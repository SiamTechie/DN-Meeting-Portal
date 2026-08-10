const functions = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const LINE_CHANNEL_ACCESS_TOKEN = defineSecret("LINE_CHANNEL_ACCESS_TOKEN");

exports.lineWebhook = functions.https.onRequest({ secrets: [LINE_CHANNEL_ACCESS_TOKEN] }, async (req, res) => {
    // ตอบกลับสถานะ 200 หา LINE ทันที
    res.sendStatus(200);

    const events = req.body.events;
    if (!events || events.length === 0) return;

    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const replyToken = event.replyToken;
            const text = event.message.text.trim();
            const userId = event.source.userId;

            try {
                const bookingRequest = parseBookingText(text);

                if (bookingRequest) {
                    const result = await handleRoomBooking(bookingRequest, userId);

                    if (result.success) {
                        const flexMessage = createBookingFlexMessage(result.booking, result.roomName);
                        await sendLineReply(replyToken, [flexMessage]);
                    } else {
                        await sendLineReply(replyToken, [{
                            type: 'text',
                            text: `❌ ไม่สามารถจองได้: ${result.error}`
                        }]);
                    }
                } else {
                    await sendLineReply(replyToken, [{
                        type: 'text',
                        text: `💡 ยินดีต้อนรับสู่ DN Meeting Portal!\n\nท่านสามารถพิมพ์เพื่อจองห้องประชุมได้ดั่งตัวอย่าง:\n👉 "จองห้อง [ชื่อห้อง] วันนี้ [เวลาเริ่ม]-[เวลาสิ้นสุด]"\nเช่น: "จองห้อง Boardroom วันนี้ 13:00-14:30"`
                    }]);
                }
            } catch (err) {
                console.error('Error:', err);
                await sendLineReply(replyToken, [{
                    type: 'text',
                    text: '⚠ ขออภัย เกิดข้อผิดพลาดระบบขัดข้อง กรุณาลองใหม่อีกครั้งภายหลัง'
                }]);
            }

        }
    }
});

// ฟังก์ชันย่อยสำหรับตัดข้อความ, จองห้อง และยิง API LINE (ก๊อปปี้จากไฟล์ webhook/index.js)
function parseBookingText(text) {
    const regex = /จองห้อง\s+([a-zA-Z\sก-๙]+)\s+วันนี้\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i;
    const match = text.match(regex);
    return match ? { roomName: match[1].trim(), startTime: match[2], endTime: match[3], date: getTodayString() } : null;
}

async function handleRoomBooking(req, lineUserId) {
    const roomsSnap = await db.collection('rooms').get();
    let selectedRoom = null;

    roomsSnap.forEach(doc => {
        const data = doc.data();
        if (data.name.toLowerCase().includes(req.roomName.toLowerCase())) {
            selectedRoom = { id: doc.id, ...data };
        }
    });

    if (!selectedRoom) return { success: false, error: `ไม่พบห้องประชุมชื่อ "${req.roomName}"` };

    const conflictsSnap = await db.collection('bookings')
        .where('roomId', '==', selectedRoom.id)
        .where('date', '==', req.date)
        .get();

    let hasConflict = false;
    conflictsSnap.forEach(doc => {
        const booking = doc.data();
        if (booking.status !== 'CANCELLED') {
            if (req.startTime < booking.endTime && req.endTime > booking.startTime) {
                hasConflict = true;
            }
        }
    });

    if (hasConflict) return { success: false, error: `ห้อง "${selectedRoom.name}" ถูกจองแล้วในช่วงเวลา ${req.startTime} - ${req.endTime}` };

    const newBooking = {
        id: `bk-line-${Date.now()}`,
        roomId: selectedRoom.id,
        title: `จองผ่าน LINE: ${selectedRoom.name}`,
        organizer: "LINE User",
        organizerAvatar: "https://ui-avatars.com/api/?name=L&background=random",
        date: req.date,
        startTime: req.startTime,
        endTime: req.endTime,
        attendees: [],
        status: "CONFIRMED",
        meetingType: "ON-SITE",
        createdAt: new Date().toISOString()
    };

    await db.collection('bookings').doc(newBooking.id).set(newBooking);
    return { success: true, booking: newBooking, roomName: selectedRoom.name };
}

async function sendLineReply(replyToken, messages) {
    await axios.post('https://api.line.me/v2/bot/message/reply', { replyToken, messages }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN.value()}` }
    });
}

function getTodayString() {
    const d = new Date();
    const localDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const date = String(localDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
}

function createBookingFlexMessage(booking, roomName) {
    return {
        type: "flex",
        altText: "ยืนยันการจองห้องประชุมสำเร็จ",
        contents: {
            type: "bubble",
            size: "mega",
            header: {
                type: "box",
                layout: "vertical",
                contents: [{ type: "text", text: "จองห้องประชุมสำเร็จ 🎉", weight: "bold", color: "#ffffff", size: "lg" }],
                backgroundColor: "#6310a3",
                paddingAll: "lg"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    { type: "text", text: booking.title, weight: "bold", size: "xl", color: "#1c1917" },
                    {
                        type: "box",
                        layout: "vertical",
                        margin: "lg",
                        spacing: "sm",
                        contents: [
                            { type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: "ห้องประชุม", color: "#78716c", size: "sm", flex: 3 }, { type: "text", text: roomName, weight: "bold", color: "#1c1917", size: "sm", flex: 7 }] },
                            { type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: "วันที่", color: "#78716c", size: "sm", flex: 3 }, { type: "text", text: booking.date, color: "#1c1917", size: "sm", flex: 7 }] },
                            { type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: "เวลา", color: "#78716c", size: "sm", flex: 3 }, { type: "text", text: `${booking.startTime} - ${booking.endTime} น.`, color: "#1c1917", size: "sm", flex: 7 }] }
                        ]
                    }
                ]
            },
            footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                    { type: "button", style: "primary", color: "#6310a3", action: { type: "uri", label: "ดูปฏิทินการจอง", uri: "https://dn-center-meeting-room-booking.web.app" } }
                ]
            }
        }
    };
}

exports.adminUpdateUser = functions.https.onRequest(async (req, res) => {
    // Enable CORS manually
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized');
        return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const callerUid = decodedToken.uid;
        
        // Check if caller is admin in Firestore
        const callerDoc = await db.collection('users').doc(callerUid).get();
        if (!callerDoc.exists || callerDoc.data().role !== 'Admin') {
            res.status(403).send('Forbidden: Only Admins can modify users');
            return;
        }

        const { uid, password } = req.body;
        if (!uid || !password) {
            res.status(400).send('Missing uid or password');
            return;
        }

        // Update password
        await admin.auth().updateUser(uid, { password: password });

        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error updating user password:', error);
        res.status(500).send(error.message);
    }
});