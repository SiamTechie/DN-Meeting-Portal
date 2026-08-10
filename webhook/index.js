const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin SDK
// Assumes Firebase credentials are setup in environment or via default service account if deployed to GCP
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault() // or use admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const app = express();
app.use(express.json());

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "lO3SOwqZ+FsKzOgpU6hzhjeLsvcd6ESXeczeI0mEj1sz5cXdibJQ9AwG7vMyJs30IGYXVPTQ0c1OcQMGi9dvgZFBu3nEFGA1FZSYaSOLrag1Kxar9llxNRpTkKEO2127E/rz37hBqYQFCLvKOAk1FwdB04t89/1O/w1cDnyilFU=";

// 2. Main Webhook Route for LINE Bot
app.post('/webhook', async (req, res) => {
  // Always return 200 to LINE Platform immediately
  res.sendStatus(200);

  const events = req.body.events;
  if (!events || events.length === 0) return;

  for (const event of events) {
    // Only handle Text Messages
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const text = event.message.text.trim();
      const userId = event.source.userId;

      try {
        // Parse booking intent (e.g., "จองห้อง Boardroom วันนี้ 13:00 - 14:00")
        const bookingRequest = parseBookingText(text);

        if (bookingRequest) {
          // Process booking logic
          const result = await handleRoomBooking(bookingRequest, userId);
          
          if (result.success) {
            // Send booking confirmation Flex Message (Reply = FREE)
            const flexMessage = createBookingFlexMessage(result.booking, result.roomName);
            await sendLineReply(replyToken, [flexMessage]);
          } else {
            // Reply with error message (e.g., Room not available)
            await sendLineReply(replyToken, [{
              type: 'text',
              text: `❌ ไม่สามารถจองได้: ${result.error}`
            }]);
          }
        } else {
          // Guide / Help message if text doesn't match format
          await sendLineReply(replyToken, [{
            type: 'text',
            text: `💡 ยินดีต้อนรับสู่ DN Meeting Portal!\n\nท่านสามารถพิมพ์เพื่อจองห้องประชุมได้ดั่งตัวอย่าง:\n👉 "จองห้อง [ชื่อห้อง] วันนี้ [เวลาเริ่ม]-[เวลาสิ้นสุด]"\nเช่น: "จองห้อง Boardroom วันนี้ 13:00-14:30"`
          }]);
        }
      } catch (err) {
        console.error('Error handling webhook event:', err);
        // Reply with fallback failure message
        await sendLineReply(replyToken, [{
          type: 'text',
          text: '⚠ ขออภัย เกิดข้อผิดพลาดระบบขัดข้อง กรุณาลองใหม่อีกครั้งภายหลัง'
        }]);
      }
    }
  }
});

/**
 * Parses user booking string using basic regex rules
 * Example input: "จองห้อง Boardroom วันนี้ 13:00-14:30"
 */
function parseBookingText(text) {
  // Match pattern: จองห้อง {ห้อง} วันนี้ {เริ่ม}-{สิ้นสุด}
  const regex = /จองห้อง\s+([a-zA-Z\sก-๙]+)\s+วันนี้\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i;
  const match = text.match(regex);
  
  if (match) {
    return {
      roomName: match[1].trim(),
      startTime: match[2],
      endTime: match[3],
      date: getTodayString()
    };
  }
  return null;
}

/**
 * Handles checking room availability and saving to Firestore
 */
async function handleRoomBooking(req, lineUserId) {
  // 1. Find Room ID by name in Firestore
  const roomsSnap = await db.collection('rooms').get();
  let selectedRoom = null;
  
  roomsSnap.forEach(doc => {
    const data = doc.data();
    if (data.name.toLowerCase().includes(req.roomName.toLowerCase())) {
      selectedRoom = { id: doc.id, ...data };
    }
  });

  if (!selectedRoom) {
    return { success: false, error: `ไม่พบห้องประชุมชื่อ "${req.roomName}"` };
  }

  // 2. Check booking conflicts
  const conflictsSnap = await db.collection('bookings')
    .where('roomId', '==', selectedRoom.id)
    .where('date', '==', req.date)
    .where('status', '!=', 'CANCELLED')
    .get();

  let hasConflict = false;
  conflictsSnap.forEach(doc => {
    const booking = doc.data();
    if (req.startTime < booking.endTime && req.endTime > booking.startTime) {
      hasConflict = true;
    }
  });

  if (hasConflict) {
    return { success: false, error: `ห้อง "${selectedRoom.name}" ถูกจองแล้วในช่วงเวลา ${req.startTime} - ${req.endTime}` };
  }

  // 3. Find User Profile (or fallback to LINE User ID)
  let organizerName = "LINE User";
  let organizerAvatar = "https://ui-avatars.com/api/?name=L&background=random";
  const usersSnap = await db.collection('users').where('email', '==', `${lineUserId}@line.bot`).get(); // example mapping
  if (!usersSnap.empty) {
    const u = usersSnap.docs[0].data();
    organizerName = u.name;
    organizerAvatar = u.avatarUrl;
  }

  // 4. Save booking
  const newBooking = {
    id: `bk-line-${Date.now()}`,
    roomId: selectedRoom.id,
    title: `จองผ่าน LINE: ${selectedRoom.name}`,
    organizer: organizerName,
    organizerAvatar: organizerAvatar,
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

/**
 * Sends a reply message to LINE using replyToken (FREE pack)
 */
async function sendLineReply(replyToken, messages) {
  try {
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken: replyToken,
      messages: messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });
  } catch (error) {
    console.error('Error calling LINE reply API:', error.response ? error.response.data : error.message);
  }
}

/**
 * Helper to generate today's date in YYYY-MM-DD
 */
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * Creates a beautiful LINE Flex Message payload for booking confirmation
 */
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
        contents: [
          {
            type: "text",
            text: "จองห้องประชุมสำเร็จ 🎉",
            weight: "bold",
            color: "#ffffff",
            size: "lg"
          }
        ],
        backgroundColor: "#6310a3",
        paddingAll: "lg"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: booking.title,
            weight: "bold",
            size: "xl",
            color: "#1c1917"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "ห้องประชุม",
                    color: "#78716c",
                    size: "sm",
                    flex: 3
                  },
                  {
                    type: "text",
                    text: roomName,
                    weight: "bold",
                    color: "#1c1917",
                    size: "sm",
                    flex: 7
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "วันที่",
                    color: "#78716c",
                    size: "sm",
                    flex: 3
                  },
                  {
                    type: "text",
                    text: booking.date,
                    color: "#1c1917",
                    size: "sm",
                    flex: 7
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "เวลา",
                    color: "#78716c",
                    size: "sm",
                    flex: 3
                  },
                  {
                    type: "text",
                    text: `${booking.startTime} - ${booking.endTime} น.`,
                    color: "#1c1917",
                    size: "sm",
                    flex: 7
                  }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "ผู้จอง",
                    color: "#78716c",
                    size: "sm",
                    flex: 3
                  },
                  {
                    type: "text",
                    text: booking.organizer,
                    color: "#1c1917",
                    size: "sm",
                    flex: 7
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#6310a3",
            action: {
              type: "uri",
              label: "ดูปฏิทินการจอง",
              uri: "https://dn-center-meeting-room-booking.web.app"
            }
          }
        ],
        flex: 0
      }
    }
  };
}

// Start Server locally or on hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LINE Webhook Server is running on port ${PORT}`);
});
