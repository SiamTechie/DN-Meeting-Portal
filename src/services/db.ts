import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Room, Booking, User } from '../types';
import { INITIAL_ROOMS, INITIAL_USERS } from '../data';

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
  },
  deleteBooking: async (bookingId: string) => {
    await deleteDoc(doc(bookingsRef, bookingId));
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
