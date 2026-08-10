import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
  getDoc,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Room, Booking, User } from '../types';
import { INITIAL_ROOMS, INITIAL_USERS } from '../data';
import { BUILDINGS, DEFAULT_BUILDING_ID } from '../buildings';

// Collections References
const roomsRef = collection(db, 'rooms');
const bookingsRef = collection(db, 'bookings');
const usersRef = collection(db, 'users');

export const dbService = {
  // === REALTIME LISTENERS ===
  subscribeToRooms: (callback: (rooms: Room[]) => void) => {
    return onSnapshot(query(roomsRef), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Room);
      callback(data);
    });
  },

  subscribeToBookings: (callback: (bookings: Booking[]) => void) => {
    return onSnapshot(query(bookingsRef), (snapshot) => {
      // Sort bookings by creation/time if necessary, for now just map
      const data = snapshot.docs.map(doc => doc.data() as Booking);
      // Sort to make sure newest might come first or rely on client side sort
      callback(data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    });
  },

  subscribeToUsers: (callback: (users: User[]) => void) => {
    return onSnapshot(query(usersRef), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as User);
      callback(data);
    });
  },

  // === CRUD OPERATIONS ===
  
  // Rooms
  saveRoom: async (room: Room) => {
    await setDoc(doc(roomsRef, room.id), room);
  },
  deleteRoom: async (roomId: string) => {
    await deleteDoc(doc(roomsRef, roomId));
  },

  // Users
  saveUser: async (user: User) => {
    await setDoc(doc(usersRef, user.id), user);
  },
  deleteUser: async (userId: string) => {
    await deleteDoc(doc(usersRef, userId));
  },

  // Bookings
  saveBooking: async (booking: Booking) => {
    // Ensuring createdAt exists for sorting
    const bookingToSave = { ...booking, createdAt: booking.createdAt || new Date().toISOString() };
    await setDoc(doc(bookingsRef, bookingToSave.id), bookingToSave);

    try {
      // 1. Fetch Room details to get the actual Room Name + Building theme
      const roomSnap = await getDoc(doc(db, 'rooms', booking.roomId));
      const roomData = roomSnap.exists() ? (roomSnap.data() as Room) : undefined;
      const roomName = roomData?.name || `Room ${booking.roomId}`;
      const building = BUILDINGS[roomData?.buildingId || DEFAULT_BUILDING_ID];
      const brandColor = building.theme.primary;

      // 2. Collect recipient emails (Organizer + Attendees)
      const recipients: string[] = [];
      
      // Look up organizer email (We fallback to standard organizer if not an email)
      if (booking.organizer && booking.organizer.includes('@')) {
        recipients.push(booking.organizer);
      } else {
        // Fallback for mock users
        recipients.push("alex.m@dncenter.co.th");
      }

      if (booking.attendees) {
        booking.attendees.forEach(att => {
          if (att.email && att.email.includes('@')) {
            recipients.push(att.email);
          }
        });
      }

      // Filter duplicates
      const uniqueRecipients = Array.from(new Set(recipients));

      if (uniqueRecipients.length > 0) {
        const isOnline = booking.meetingType === "ONLINE";
        
        // 3. Construct beautiful HTML email layout
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4ea; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px ${brandColor}0D;">
            <div style="background-color: ${brandColor}; padding: 30px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px;">CONFIRMED / ยืนยันการจองสำเร็จ</h2>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #ffffffcc; letter-spacing: 1.5px; text-transform: uppercase;">${building.nameEn} Meeting Room Booking</p>
            </div>
            
            <div style="padding: 30px; background-color: white;">
              <p style="font-size: 14px; color: #48484a; line-height: 1.6; margin: 0 0 20px 0;">
                การจองห้องประชุมของคุณได้รับการยืนยันเรียบร้อยแล้ว รายละเอียดการจองมีดังนี้:<br>
                <span style="font-style: italic; color: #8e8e93;">Your meeting room booking has been successfully confirmed. Details below:</span>
              </p>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93; width: 140px;">หัวข้อ / Subject</td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #1c1c1e;">${booking.title}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">ห้องประชุม / Room</td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: ${brandColor};">${roomName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">วันที่ / Date</td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #1c1c1e;">${booking.date}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">เวลา / Time</td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #1c1c1e;">${booking.startTime} - ${booking.endTime}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">รูปแบบ / Format</td>
                  <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #48484a;">
                    <span style="background-color: #f2f2f7; padding: 4px 8px; border-radius: 6px;">${booking.meetingType}</span>
                  </td>
                </tr>
                
                ${isOnline ? `
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">แพลตฟอร์ม / Platform</td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #1c1c1e;">${booking.onlinePlatform}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">ลิงก์เข้าประชุม / Link</td>
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 600;">
                    <a href="${booking.onlineLink || '#'}" target="_blank" style="color: ${brandColor}; text-decoration: underline;">คลิกเพื่อเข้าร่วมประชุม (Join Meeting)</a>
                  </td>
                </tr>
                ${booking.onlineId ? `
                <tr style="border-bottom: 1px solid #f2f2f7;">
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #8e8e93;">ID / Passcode</td>
                  <td style="padding: 10px 0; font-size: 13px; font-family: monospace; color: #48484a;">${booking.onlineId}</td>
                </tr>
                ` : ''}
                ` : ''}
              </table>
              
              <div style="background-color: #fafafa; padding: 15px; border-radius: 12px; border: 1px solid #f2f2f7; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #8e8e93; line-height: 1.4;">
                  กรุณาบันทึกเวลาจัดประชุมลงในปฏิทินของท่าน และไปถึงห้องประชุมตรงเวลา<br>
                  Please add this event to your calendar and arrive at the room on time.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f4f5f8; padding: 20px; text-align: center; border-top: 1px solid #e1e4ea;">
              <p style="margin: 0; font-size: 10px; color: #8e8e93;">
                ระบบจองห้องประชุม ${building.nameEn} • © 2026 ${building.nameEn.toUpperCase()} CO., LTD.
              </p>
            </div>
          </div>
        `;

        // 4. Add to the mail collection to trigger email extension
        await addDoc(collection(db, 'mail'), {
          to: uniqueRecipients,
          message: {
            subject: `[${building.shortNameEn}] Booking Confirmed: ${booking.title}`,
            html: emailHtml
          }
        });
      }
    } catch (mailError) {
      console.error("Error creating booking notification email document:", mailError);
    }
  },
  deleteBooking: async (bookingId: string) => {
    await deleteDoc(doc(bookingsRef, bookingId));
  },

  // === MIGRATION ===
  // Backfills `buildingId` onto room documents created before the multi-building
  // feature existed. Safe to call multiple times (no-op once all docs are migrated).
  migrateRoomsAddBuildingId: async () => {
    const snapshot = await getDocs(roomsRef);
    const batch = writeBatch(db);
    let needsMigration = false;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Room;
      if (!data.buildingId) {
        batch.update(docSnap.ref, { buildingId: DEFAULT_BUILDING_ID });
        needsMigration = true;
      }
    });

    if (needsMigration) {
      await batch.commit();
      console.log("Migrated existing rooms: added buildingId.");
    }
  },

  // === INITIAL DATA SEEDER ===
  seedDatabase: async () => {
    const batch = writeBatch(db);

    // Seed Rooms
    INITIAL_ROOMS.forEach(room => {
      const ref = doc(roomsRef, room.id);
      batch.set(ref, room);
    });

    // Seed Users
    INITIAL_USERS.forEach(user => {
      const ref = doc(usersRef, user.id);
      batch.set(ref, user);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
  }
};
