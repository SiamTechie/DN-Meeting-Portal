import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { Booking } from '../types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test scenario: 11/08/26 - 14/08/26, 5 time slots per day, mixed rooms
const roomIds = ["101", "102", "103", "201", "202", "203", "301", "302"];
const dates = ["2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14"];
const timeSlots = [
  { start: "09:00", end: "10:30" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:30" },
  { start: "15:00", end: "16:00" },
  { start: "16:30", end: "18:00" }
];

const meetingTitles = [
  "Sprint Planning",
  "Design Review",
  "Client Presentation",
  "Team Standup",
  "Code Review Session",
  "Product Demo",
  "Strategy Meeting",
  "Training Workshop",
  "Performance Review",
  "Budget Discussion"
];

const organizers = [
  { name: "Sarah Johnson", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg" },
  { name: "David K.", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC-Nwq_e1PmaHUNQkaGRNVIcPj5eQxrVgdCfK9sT71kXLNZm5XEva8jQLIexPmKgnddz1fXBdqo6Q3bD5JoaS5ifAElfGtq0pHHjgeA7ZrjKREVTrmjinCUNZcg2vvEozOogRgobayYI9kDTpOmLlqGW7PaGXVyLFSX8UA1fwtj1XkwaFwzNq3jPBfw9MFrbeTcMHfmQBBzLIVRNCL_bNWeKhmN52a7awCvfS5GuJZeF2XJITXimzT" },
  { name: "Marcus Thorne", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz" },
  { name: "Alex Morgan", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM" },
  { name: "Linda Zhao", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxiJfwfWhrXFYosD3Ov-UYXsHjDB4wmvGvQWm5y7CGpcWorSYBQXT2cxhrg1-PATm5qVG2LIaTAyTxAnQdbbm_jsCT3pmEwYWd13vnChfOuAVQBTlKbejVDnHYAjrLFxOU2KEjk82BO26Yn0ammWwa0px8-EoYbIoqeZ1TjawdAWyuiilWdnoTTm66Xcprasvolx2NXgQ_mqM8h4rP7GxE_x5naW-dB8FgEnEtmMKQtinTWnaT1oUS" }
];

async function seedTestBookings() {
  console.log('🚀 Starting test booking seeding...');
  console.log(`📅 Dates: ${dates.join(', ')}`);
  console.log(`⏰ Time slots per day: ${timeSlots.length}`);
  console.log(`🏢 Rooms: ${roomIds.join(', ')}`);

  const bookingsRef = collection(db, 'bookings');
  let bookingCounter = 0;
  let roomIndex = 0;

  for (const date of dates) {
    console.log(`\n📆 Processing ${date}...`);

    for (const slot of timeSlots) {
      const roomId = roomIds[roomIndex % roomIds.length];
      const organizer = organizers[bookingCounter % organizers.length];
      const title = meetingTitles[bookingCounter % meetingTitles.length];

      const booking: Booking = {
        id: `test-bk-${bookingCounter + 1}`,
        roomId: roomId,
        title: title,
        organizer: organizer.name,
        organizerAvatar: organizer.avatar,
        date: date,
        startTime: slot.start,
        endTime: slot.end,
        attendees: [],
        status: "CONFIRMED",
        meetingType: bookingCounter % 3 === 0 ? "ONLINE" : "ON-SITE",
        createdAt: new Date().toISOString(),
        ...(bookingCounter % 3 === 0 ? {
          onlinePlatform: "Zoom" as const,
          onlineLink: `https://zoom.us/j/${900000000 + bookingCounter}`,
          onlineId: `${900000000 + bookingCounter}`
        } : {})
      };

      try {
        await setDoc(doc(bookingsRef, booking.id), booking);
        console.log(`  ✅ ${slot.start}-${slot.end} | Room ${roomId} | ${title}`);
        bookingCounter++;
        roomIndex++;
      } catch (error) {
        console.error(`  ❌ Failed to create booking:`, error);
      }
    }
  }

  console.log(`\n✨ Seeding complete! Created ${bookingCounter} test bookings.`);
  console.log(`📊 Summary:`);
  console.log(`   - Total bookings: ${bookingCounter}`);
  console.log(`   - Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
  console.log(`   - Bookings per day: ${timeSlots.length}`);
  console.log(`   - Rooms used: ${new Set(Array.from({ length: bookingCounter }, (_, i) => roomIds[i % roomIds.length])).size}`);
}

seedTestBookings()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
