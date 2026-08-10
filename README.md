# 🏢 DN Meeting Portal (DN Center Room Booking System)

ระบบบริหารจัดการและจองห้องประชุมส่วนกลางขององค์กรแบบพรีเมียม (Enterprise-Grade Meeting Room Booking & Management System) พัฒนาด้วย **React 19**, **Vite**, **TypeScript** และ **Firebase**

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- 📅 **ระบบจองห้องประชุม (Meeting Booking System)**: ค้นหาห้องประชุมตามอาคาร/อุปกรณ์ เช็กสถานะการใช้งานแบบเรียลไทม์ พร้อมป้องกันการจองเวลาซ้อนทับกัน (Conflict Detection)
- 📺 **โหมดโฆษณา/ป้ายหน้าห้อง (Kiosk Mode)**: หน้าจอ Digital Signage สำหรับติดตั้งหน้าห้องประชุม แสดงสถานะการจองปัจจุบัน คิวถัดไป และปุ่มการเช็กอินเข้าใช้งาน
- 🛡️ **ระบบจัดการสำหรับผู้ดูแล (Admin Management)**:
  - จัดการข้อมูลอาคาร (Buildings) และห้องประชุม (Rooms)
  - กำหนดสิทธิ์ผู้ใช้งาน (User Roles & Approvals)
  - ดูภาพรวมและรายงานการใช้งานห้องประชุม
- 🌐 **รองรับหลายภาษา (Multi-Language)**: สลับการใช้งานภาษาไทย (TH) และภาษาอังกฤษ (EN) ได้ทันที
- 🔔 **การแจ้งเตือน LINE Notify / Webhook**: แจ้งเตือนสถานะการจองและอนุมัติผ่าน LINE Webhook
- 🔐 **ระบบรักษาความปลอดภัยระดับสูง**: ใช้ Firebase Authentication, Firestore Security Rules และ Cloud Storage Rules

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend**: React 19, Vite, TypeScript, TailwindCSS v4, Motion (Framer Motion), Lucide React Icons
* **Backend & Database**: Firebase Authentication, Cloud Firestore, Cloud Storage, Firebase Cloud Functions
* **Integrations**: LINE Webhook & LINE Notify Integration

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
dn-center-room-booking-system/
├── src/
│   ├── components/         # UI Components (AdminView, BookingFormView, DashboardView, KioskView, ฯลฯ)
│   ├── contexts/           # React Context (AuthContext)
│   ├── pages/              # Page Views (Login, AuthAction)
│   ├── services/           # Firebase Auth & Firestore DB Services (auth.ts, db.ts)
│   ├── scripts/            # Seed data and utility scripts
│   ├── data.ts             # Default & mock data definitions
│   ├── locales.ts          # Internationalization dictionary (TH / EN)
│   └── firebase.ts         # Firebase App initialization
├── functions/              # Firebase Cloud Functions (LINE Notify / Webhook)
├── webhook/                # Webhook integration services
├── firestore.rules         # Cloud Firestore Security Rules
├── storage.rules           # Cloud Storage Security Rules
└── firebase.json           # Firebase Hosting & Services Config
```

---

## 🚀 การติดตั้งและใช้งานแบบพัฒนา (Getting Started)

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory ของโปรเจกต์ และระบุค่า Firebase Configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. รันโปรเจกต์ (Development Server)

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5174`

---

## 📜 คำสั่งสคริปต์ที่สำคัญ (NPM Scripts)

| Command | Description |
| :--- | :--- |
| `npm run dev` | รัน Development Server บนพอร์ต 5174 |
| `npm run build` | บิลด์โค้ดสำหรับ Production ไปยังโฟลเดอร์ `dist/` |
| `npm run preview` | พรีวิวการทำงานของ Production Build |
| `npm run lint` | ตรวจสอบ TypeScript type checking (`tsc --noEmit`) |
| `npm run seed:test` | สร้างข้อมูลทดสอบสำหรับการจองห้องประชุม |

---

## 🔒 Security Rules & Deployment

การอัปเดต Security Rules และการ Deploy ไปยัง Firebase:

```bash
# ตรวจสอบและปรับใช้ Firestore Rules
npx firebase-tools deploy --only firestore:rules

# ตรวจสอบและปรับใช้ Storage Rules
npx firebase-tools deploy --only storage

# Deploy Firebase Hosting
npm run build
npx firebase-tools deploy --only hosting
```

---

## 📄 License

Copyright © 2026 SiamTechie / DN Meeting Portal. All rights reserved.
