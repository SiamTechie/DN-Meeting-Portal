import React, { useState, useEffect } from "react";
import { Room, Booking, ViewTab, User } from "./types";
import { dbService } from "./services/db";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import RoomListView from "./components/RoomListView";
import RoomDetailView from "./components/RoomDetailView";
import BookingFormView from "./components/BookingFormView";
import MyBookingsView from "./components/MyBookingsView";
import AdminView from "./components/AdminView";
import KioskView from "./components/KioskView";
import LoginModal from "./components/LoginModal";
import { Language, translations } from "./locales";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserProfile } from "./services/auth";

export default function App() {
  // Global React States
  const [activeTab, setActiveTab] = useState<ViewTab>("dashboard");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Localization State
  const [lang, setLang] = useState<Language>("th");
  
  // Detail selection state helpers
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [initialStartTime, setInitialStartTime] = useState("10:00");

  // Load real-time data from Firestore
  useEffect(() => {
    // Keep lang locally
    const cachedLang = localStorage.getItem("dn_center_lang");
    if (cachedLang === "th" || cachedLang === "en") {
      setLang(cachedLang as Language);
    }

    // Subscribe to Firestore collections
    const unsubRooms = dbService.subscribeToRooms((data) => setRooms(data));
    const unsubBookings = dbService.subscribeToBookings((data) => setBookings(data));
    const unsubUsers = dbService.subscribeToUsers((data) => setUsers(data));

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user profile with Role from Firestore
        const profile = await fetchUserProfile(firebaseUser.uid);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubRooms();
      unsubBookings();
      unsubUsers();
      unsubAuth();
    };
  }, []);

  const handleAddUser = async (newUser: User) => {
    await dbService.saveUser(newUser);
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    await dbService.deleteUser(userId);

    if (userToDelete) {
      // Cascade delete bookings organized by this user
      const userBookings = bookings.filter((b) => b.organizer === userToDelete.name);
      userBookings.forEach(async (b) => {
        await dbService.deleteBooking(b.id);
      });
    }
  };

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("dn_center_lang", newLang);
  };

  // State Triggers (Realtime synced via Firestore)
  const handleAddRoom = async (newRoom: Room) => {
    await dbService.saveRoom(newRoom);
  };

  const handleUpdateRoom = async (updatedRoom: Room) => {
    await dbService.saveRoom(updatedRoom);
  };

  const handleDeleteRoom = async (roomId: string) => {
    await dbService.deleteRoom(roomId);

    // Cascade delete bookings for this room
    const roomBookings = bookings.filter((b) => b.roomId === roomId);
    roomBookings.forEach(async (b) => {
      await dbService.deleteBooking(b.id);
    });

    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    await dbService.deleteBooking(bookingId);
  };

  const handleBookingSuccess = async (newBooking: Booking) => {
    await dbService.saveBooking(newBooking);
    setActiveTab("dashboard");
  };

  const handleSeedDatabase = async () => {
    await dbService.seedDatabase();
  };

  // Deep Link Selection Triggers
  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setActiveTab("room-detail");
  };

  const handleRoomSelectById = (roomId: string) => {
    const r = rooms.find((room) => room.id === roomId);
    if (r) {
      handleRoomSelect(r);
    }
  };

  const handleQuickBook = (room: Room) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedRoom(room);
    setInitialStartTime("10:00");
    setActiveTab("booking-form");
  };

  const handleInstantBook = (roomId: string, startTime: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoom(room || null);
    setInitialStartTime(startTime);
    setActiveTab("booking-form");
  };

  const handleNewBookingClick = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedRoom(rooms[0] || null);
    setInitialStartTime("10:00");
    setActiveTab("booking-form");
  };

  // Translation function helper
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Tab Title label helper
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return t("navDashboard");
      case "room-list":
        return t("navExplore");
      case "room-detail":
        return `${t("navExplore")} • Room ${selectedRoom?.id || ""}`;
      case "my-bookings":
        return t("mbTitle");
      case "booking-form":
        return t("bfTitle");
      case "admin":
        return t("navAdmin");
      case "kiosk":
        return t("navKiosk");
      default:
        return "DN CENTER";
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row pb-16 md:pb-0 relative">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-100/70 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-stone-200/60 rounded-full blur-[160px] opacity-65"></div>
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[180px] opacity-50"></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewBookingClick={handleNewBookingClick}
        lang={lang}
        currentUser={currentUser}
      />

      {/* Main Panel Content Frame */}
      <main className="flex-grow md:pl-[280px] flex flex-col min-h-screen overflow-x-hidden z-10">
        {/* Only show header if NOT in Kiosk tablet display mode */}
        {activeTab !== "kiosk" && (
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            title={getHeaderTitle()}
            lang={lang}
            setLang={handleSetLang}
            currentUser={currentUser}
            onLoginClick={() => setIsLoginOpen(true)}
          />
        )}

        {/* Dynamic Transition Router View Board */}
        <div className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-grow flex flex-col"
            >
              {activeTab === "dashboard" && (
                <DashboardView
                  rooms={rooms}
                  bookings={bookings}
                  onRoomSelect={handleRoomSelect}
                  onInstantBook={handleInstantBook}
                  lang={lang}
                />
              )}

              {activeTab === "room-list" && (
                <RoomListView
                  rooms={rooms}
                  searchQuery={searchQuery}
                  onRoomSelect={handleRoomSelect}
                  onQuickBook={handleQuickBook}
                  lang={lang}
                />
              )}

              {activeTab === "room-detail" && selectedRoom && (
                <RoomDetailView
                  room={selectedRoom}
                  bookings={bookings}
                  onBack={() => setActiveTab("room-list")}
                  onBookClick={handleQuickBook}
                  lang={lang}
                />
              )}

              {activeTab === "booking-form" && (
                <BookingFormView
                  rooms={rooms}
                  bookings={bookings}
                  selectedRoom={selectedRoom}
                  initialStartTime={initialStartTime}
                  onBookingSuccess={handleBookingSuccess}
                  onCancel={() => setActiveTab("dashboard")}
                  lang={lang}
                  users={users}
                />
              )}

              {activeTab === "my-bookings" && (
                <MyBookingsView
                  bookings={bookings}
                  rooms={rooms}
                  onCancelBooking={handleCancelBooking}
                  onRoomSelect={handleRoomSelectById}
                  lang={lang}
                />
              )}

              {activeTab === "admin" && (
                <AdminView
                  rooms={rooms}
                  bookings={bookings}
                  users={users}
                  onAddRoom={handleAddRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onDeleteRoom={handleDeleteRoom}
                  onCancelBooking={handleCancelBooking}
                  onAddUser={handleAddUser}
                  onDeleteUser={handleDeleteUser}
                  onSeedDatabase={handleSeedDatabase}
                  lang={lang}
                />
              )}

              {activeTab === "kiosk" && (
                <KioskView
                  rooms={rooms}
                  bookings={bookings}
                  onInstantBook={handleInstantBook}
                  lang={lang}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Login / Register Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          // setCurrentUser is handled by onAuthStateChanged globally, so we can just close
          setIsLoginOpen(false);
        }}
        lang={lang}
      />
    </div>
  );
}
