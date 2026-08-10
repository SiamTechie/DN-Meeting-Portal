import React, { useState, useEffect } from "react";
import { Room, Booking, ViewTab, User, BuildingId } from "./types";
import { dbService } from "./services/db";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import RoomListView from "./components/RoomListView";
import RoomDetailView from "./components/RoomDetailView";
import BookingFormView from "./components/BookingFormView";
import MyBookingsView from "./components/MyBookingsView";
import UserManualView from "./components/UserManualView";
import AdminView from "./components/AdminView";
import KioskView from "./components/KioskView";
import LoginModal from "./components/LoginModal";
import { Language, translations } from "./locales";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserProfile } from "./services/auth";
import { DEFAULT_BUILDING_ID } from "./buildings";

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

  // Localization State - Enforced to Thai
  const [lang, setLang] = useState<Language>("th");

  // Building State - which company/building the user is currently viewing.
  // Persisted so returning users keep their last selected building + theme.
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId>(() => {
    const stored = localStorage.getItem("dn_center_building");
    return stored === "dn-center" || stored === "health-up" ? stored : DEFAULT_BUILDING_ID;
  });

  // Detail selection state helpers
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [initialStartTime, setInitialStartTime] = useState("10:00");

  // Load real-time data from Firestore
  useEffect(() => {
    // Force language to Thai globally
    setLang("th");
    localStorage.setItem("dn_center_lang", "th");

    // One-time backfill: ensure rooms created before the multi-building
    // feature existed have a buildingId (defaults to "dn-center").
    dbService.migrateRoomsAddBuildingId();

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

  const handleUpdateUser = async (userId: string, updatedData: Partial<User>, newPassword?: string) => {
    const existingUser = users.find((u) => u.id === userId);
    if (!existingUser) return;
    
    const updatedUser = { ...existingUser, ...updatedData };
    await dbService.saveUser(updatedUser);

    if (newPassword && newPassword.trim() !== "") {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          await fetch('/adminUpdateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: userId,
              password: newPassword
            })
          });
        }
      } catch (err) {
        console.error("Failed to update password:", err);
      }
    }
  };

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("dn_center_lang", newLang);
  };

  const handleSetBuilding = (buildingId: BuildingId) => {
    setSelectedBuilding(buildingId);
    localStorage.setItem("dn_center_building", buildingId);
  };

  // Apply the selected building's brand theme to the whole app by toggling
  // a `data-brand` attribute on <html>, which CSS variable overrides in
  // index.css key off of.
  useEffect(() => {
    if (selectedBuilding === DEFAULT_BUILDING_ID) {
      document.documentElement.removeAttribute("data-brand");
    } else {
      document.documentElement.setAttribute("data-brand", selectedBuilding);
    }
  }, [selectedBuilding]);

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
    // Default room must belong to the currently selected building, so the
    // "New Booking" sidebar shortcut never pre-selects a room from the
    // other company.
    const buildingRooms = rooms.filter((r) => r.buildingId === selectedBuilding);
    setSelectedRoom(buildingRooms[0] || null);
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
        selectedBuilding={selectedBuilding}
        onSelectBuilding={handleSetBuilding}
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
            bookings={bookings}
            activeTab={activeTab}
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
                  selectedBuilding={selectedBuilding}
                />
              )}

              {activeTab === "room-list" && (
                <RoomListView
                  rooms={rooms}
                  searchQuery={searchQuery}
                  onRoomSelect={handleRoomSelect}
                  onQuickBook={handleQuickBook}
                  lang={lang}
                  selectedBuilding={selectedBuilding}
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
                  currentUser={currentUser}
                  selectedBuilding={selectedBuilding}
                />
              )}

              {activeTab === "my-bookings" && (
                <MyBookingsView
                  bookings={bookings}
                  rooms={rooms}
                  onCancelBooking={handleCancelBooking}
                  onRoomSelect={handleRoomSelectById}
                  lang={lang}
                  currentUser={currentUser}
                  selectedBuilding={selectedBuilding}
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
                  onUpdateUser={handleUpdateUser}
                  onSeedDatabase={handleSeedDatabase}
                  lang={lang}
                  selectedBuilding={selectedBuilding}
                />
              )}

              {activeTab === "user-manual" && (
                <UserManualView lang={lang} />
              )}

              {activeTab === "kiosk" && (
                <KioskView
                  rooms={rooms}
                  bookings={bookings}
                  onInstantBook={handleInstantBook}
                  lang={lang}
                  selectedBuilding={selectedBuilding}
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
