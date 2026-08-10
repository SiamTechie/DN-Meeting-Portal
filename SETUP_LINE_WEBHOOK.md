# คู่มือการติดตั้ง LINE Bot Webhook สำหรับจองห้องประชุมอย่างละเอียด
คู่มือนี้จะแนะนำขั้นตอนการสร้าง LINE Bot, การติดตั้ง Firebase Cloud Functions ในโปรเจค, และการเชื่อมต่อ Webhook เพื่อรองรับการจองห้องผ่าน LINE ด้วยการตอบกลับแบบฟรี (Reply Message)

---

## 📌 ขั้นตอนที่ 1: สร้าง LINE Bot และดึงค่า Token
1. เข้าสู่ระบบด้วยบัญชี LINE ที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง **Provider** (หากยังไม่มี)
3. กดสร้าง Channel ใหม่ เลือกประเภทเป็น **Messaging API**
4. กรอกข้อมูลส่วนตัวของบอทให้เรียบร้อย (ชื่อบอท, รูปโปรไฟล์, อีเมล)
5. เมื่อสร้างเสร็จ ให้สลับไปที่แท็บ **Messaging API** เลื่อนลงมาล่างสุดตรงหัวข้อ **Channel access token (long-lived)** แล้วกดปุ่ม **Issue**
6. คัดลอกค่า **Channel access token** เก็บไว้ (เพื่อเอาไปใส่ในโค้ดหลังบ้าน)

---

## 📌 ขั้นตอนที่ 2: เริ่มต้นติดตั้ง Firebase Functions ในโปรเจค
เนื่องจากโปรเจคนี้ใช้งาน Firebase อยู่แล้ว การใช้ Firebase Cloud Functions จึงเป็นวิธีที่ง่ายที่สุดในการรัน Webhook เป็น HTTPS ฟรี

1. เปิด Terminal ในโฟลเดอร์หลักของโปรเจค (`d:\Projects\dn-center-room-booking-system`)
2. ตรวจสอบให้แน่ใจว่าติดตั้งเครื่องมือ Firebase CLI เรียบร้อยแล้ว:
   ```bash
   npm install -g firebase-tools
   ```
3. ล็อกอิน Firebase (หากยังไม่ได้ล็อกอิน):
   ```bash
   firebase login
   ```
4. รันคำสั่งเปิดใช้งานระบบ Functions:
   ```bash
   firebase init functions
   ```
5. เมื่อระบบขึ้นถาม ให้ระบุดังนี้:
   - **Language:** เลือก `JavaScript` (หรือ TypeScript ตามสะดวก แต่คู่มือนี้อิงตามโค้ด JS ที่จัดเตรียมไว้ให้)
   - **ESLint:** พิมพ์ `n` (ไม่ใช้งานชั่วคราวเพื่อความรวดเร็ว)
   - **Install dependencies now?:** พิมพ์ `y` (เพื่อติดตั้งแพ็กเกจเบื้องต้นของ Firebase)

ระบบจะสร้างโฟลเดอร์ใหม่ชื่อว่า `functions` ขึ้นมาในโปรเจคของคุณ

---

## 📌 ขั้นตอนที่ 3: ลงโค้ด Webhook และตั้งค่า Library
1. ย้ายเข้าไปทำงานในโฟลเดอร์ `functions`:
   ```bash
   cd functions
   ```
2. ติดตั้ง Library ที่จำเป็นสำหรับการส่งข้อความและเรียก API:
   ```bash
   npm install axios express
   ```
3. เปิดไฟล์ `functions/index.js` ขึ้นมา และวางโค้ดที่เตรียมไว้ (ซึ่งดัดแปลงจากไฟล์ตัวอย่างให้เป็น Cloud Function) ตามตัวอย่างด้านล่างนี้:

```javascript
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const LINE_CHANNEL_ACCESS_TOKEN = "lO3SOwqZ+FsKzOgpU6hzhjeLsvcd6ESXeczeI0mEj1sz5cXdibJQ9AwG7vMyJs30IGYXVPTQ0c1OcQMGi9dvgZFBu3nEFGA1FZSYaSOLrag1Kxar9llxNRpTkKEO2127E/rz37hBqYQFCLvKOAk1FwdB04t89/1O/w1cDnyilFU=";

exports.lineWebhook = onRequest(async (req, res) => {
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
    .where('status', '!=', 'CANCELLED')
    .get();

  let hasConflict = false;
  conflictsSnap.forEach(doc => {
    const booking = doc.data();
    if (req.startTime < booking.endTime && req.endTime > booking.startTime) {
      hasConflict = true;
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
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
  });
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
```

---

## 📌 ขั้นตอนที่ 4: อัปโหลดโค้ดขึ้น Firebase (Deploy)
1. ตรวจสอบให้แน่ใจว่าอยู่โปรเจคหลัก แล้วรันคำสั่ง Deploy เฉพาะตัวฟังก์ชัน:
   ```bash
   firebase deploy --only functions
   ```
2. เมื่อระเบียบการ Deploy สำเร็จ หน้าจอ Terminal จะแสดงค่า **Function URL** ออกมา เช่น:
   `https://lineWebhook-xxxxxx-as.a.run.app` (จดลิงก์นี้ไว้)

---

## 📌 ขั้นตอนที่ 5: นำ URL ไปผูกใน LINE Console และทดสอบ
1. กลับไปที่หน้า **LINE Developers Console** เลือก Channel ของคุณ
2. สลับไปที่แท็บ **Messaging API** เลื่อนหาช่อง **Webhook URL**
3. กด **Edit** นำลิงก์ HTTPS จากขั้นตอนที่ 4 ไปวาง (เช่น `https://lineWebhook-xxxxxx-as.a.run.app`) จากนั้นกด **Update**
4. **สำคัญมาก:** เลื่อนลงมานิดหน่อยเปิดสวิตช์ **Use webhook** ให้เป็นสีเขียว (ON)
5. เปิดแอป LINE สแกน QR Code เพื่อแอดไลน์บอทของคุณเป็นเพื่อน
6. ทดลองพิมพ์แชทคำสั่งใน LINE: 
   👉 *"จองห้อง Boardroom วันนี้ 13:00 - 14:00"*
7. บอทจะทำการตรวจสอบความถูกต้อง บันทึกข้อมูลลงฐานข้อมูล Firebase และยิงข้อความ Flex Message ยืนยันการจองกลับมาหาคุณทันทีโดยไม่มีการหักค่าโควต้าครับ!
