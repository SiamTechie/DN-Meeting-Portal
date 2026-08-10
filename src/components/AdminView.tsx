import React, { useState } from "react";
import { Room, Booking, User, UserRole, BuildingId } from "../types";
import { Plus, Trash2, ShieldCheck, Activity, Layers, Settings, CheckCircle, UserPlus, Users, Edit, Database, Wifi, Monitor, Projector, ClipboardList, Speaker, Coffee, X, Wrench, PlayCircle } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";
import { BUILDING_LIST, BUILDINGS } from "../buildings";

// Short prefixes used to namespace new room IDs per building, avoiding
// Firestore document ID collisions (e.g. "DN-483", "HU-483").
const BUILDING_ID_PREFIX: Record<BuildingId, string> = {
  "dn-center": "DN",
  "health-up": "HU",
};

interface AdminViewProps {
  rooms: Room[];
  bookings: Booking[];
  users: User[];
  onAddRoom: (newRoom: Room) => void;
  onUpdateRoom?: (updatedRoom: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onAddUser: (newUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser?: (userId: string, updatedData: Partial<User>, newPassword?: string) => Promise<void>;
  onSeedDatabase?: () => Promise<void>;
  lang: Language;
  selectedBuilding: BuildingId;
}

export default function AdminView({
  rooms,
  bookings,
  users,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onCancelBooking,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  onSeedDatabase,
  lang,
  selectedBuilding,
}: AdminViewProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Add Room form states
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("Meeting");
  const [capacity, setCapacity] = useState(8);
  const [floor, setFloor] = useState(1);
  const [tier, setTier] = useState<"Standard" | "Premium" | "Elite Tier">("Premium");
  const [roomImage, setRoomImage] = useState("");
  const [equipment, setEquipment] = useState<string[]>(["High-speed Wifi", "4K Display"]);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomBuilding, setRoomBuilding] = useState<BuildingId>(selectedBuilding);
  const [roomListFilter, setRoomListFilter] = useState<"all" | BuildingId>("all");
  
  const [isSuccess, setIsSuccess] = useState(false);

  // Add User form states
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("Member");
  const [isUserSuccess, setIsUserSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Edit User states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState<UserRole>("Member");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [isEditUserSubmitting, setIsEditUserSubmitting] = useState(false);

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserRole(user.role);
    setEditUserPassword("");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsEditUserSubmitting(true);
    try {
      if (onUpdateUser) {
        await onUpdateUser(
          editingUser.id,
          { name: editUserName, role: editUserRole },
          editUserPassword.trim() || undefined
        );
      }
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditUserSubmitting(false);
    }
  };

  // Log Tab Switcer state
  const [activeLogTab, setActiveLogTab] = useState<"bookings" | "emails">("bookings");
  const [logSearch, setLogSearch] = useState("");

  const handleSubmitRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const finalImage = roomImage.trim() !== "" ? roomImage.trim() : "https://lh3.googleusercontent.com/aida-public/AB6AXuCEhZ9nqwUjaJBtoaxnxRr9i1IqqZsk_eDly3WcwpVsZgW47XCnkS7jpCBLvgG0XWZpqrJP9VkVrbC1iYmuHiJuzzww_UoWfXrvj54qvIFonOcV58uWBNEpt2oqzKrkzgR5qQw3IjL160EDbzOOH08t2h601FA0yAhl6VRuE-1cnEm3JChDnmlBLzFI1V3INrBanH1-xQ1ITQF3nYR5GGl5GJ-3gGhPFmh9GUAYlWiCMtkmgRTH8BmT";

    const updatedRoomData: Room = {
      id: editingRoomId ? editingRoomId : `${BUILDING_ID_PREFIX[roomBuilding]}-${Math.floor(Math.random() * 899) + 100}`,
      name: roomName,
      type: roomType,
      capacity: capacity,
      floor: floor,
      sqft: capacity * 45,
      tier: tier,
      image: finalImage,
      equipment: equipment,
      buildingId: roomBuilding,
      location: `Floor ${floor}, ${BUILDINGS[roomBuilding].nameEn.toUpperCase()}`,
    };

    if (editingRoomId && onUpdateRoom) {
      onUpdateRoom(updatedRoomData);
    } else {
      onAddRoom(updatedRoomData);
    }

    resetRoomForm();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const resetRoomForm = () => {
    setEditingRoomId(null);
    setRoomName("");
    setRoomType("Meeting");
    setCapacity(8);
    setFloor(1);
    setTier("Premium");
    setRoomImage("");
    setEquipment(["High-speed Wifi", "4K Display"]);
    setRoomBuilding(selectedBuilding);
  };

  const handleEditRoomClick = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setRoomType(room.type);
    setCapacity(room.capacity);
    setFloor(room.floor);
    setTier(room.tier);
    setRoomImage(room.image);
    setEquipment(room.equipment || []);
    setRoomBuilding(room.buildingId || selectedBuilding);

    // Scroll to form slightly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    // Create unique random id and assign standard avatar
    const randomAvatarNum = Math.floor(Math.random() * 5) + 1;
    const avatars = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCC-Nwq_e1PmaHUNQkaGRNVIcPj5eQxrVgdCfK9sT71kXLNZm5XEva8jQLIexPmKgnddz1fXBdqo6Q3bD5JoaS5ifAElfGtq0pHHjgeA7ZrjKREVTrmjinCUNZcg2vvEozOogRgobayYI9kDTpOmLlqGW7PaGXVyLFSX8UA1fwtj1XkwaFwzNq3jPBfw9MFrbeTcMHfmQBBzLIVRNCL_bNWeKhmN52a7awCvfS5GuJZeF2XJITXimzT",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxiJfwfWhrXFYosD3Ov-UYXsHjDB4wmvGvQWm5y7CGpcWorSYBQXT2cxhrg1-PATm5qVG2LIaTAyTxAnQdbbm_jsCT3pmEwYWd13vnChfOuAVQBTlKbejVDnHYAjrLFxOU2KEjk82BO26Yn0ammWwa0px8-EoYbIoqeZ1TjawdAWyuiilWdnoTTm66Xcprasvolx2NXgQ_mqM8h4rP7GxE_x5naW-dB8FgEnEtmMKQtinTWnaT1oUS"
    ];

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userName,
      email: userEmail,
      role: userRole,
      avatarUrl: avatars[randomAvatarNum - 1],
    };

    onAddUser(newUser);
    setUserName("");
    setUserEmail("");
    setIsUserSuccess(true);
    setTimeout(() => setIsUserSuccess(false), 3000);
  };

  // Diagnostics calculations
  const pendingBookings = bookings.filter(b => b.status === "PENDING").length;

  return (
    <div className="flex-grow flex flex-col p-6 overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-primary mb-1 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" />
              {t("adTitle")}
            </h2>
            <p className="font-sans text-xs text-on-surface-variant/90">
              {t("adSub")}
            </p>
          </div>
          

        </div>

        {/* Real-time system diagnostics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("adMetricRooms")}</p>
              <p className="font-display font-black text-2xl text-primary">{rooms.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("adMetricBookings")}</p>
              <p className="font-display font-black text-2xl text-secondary">{bookings.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">Active Users</p>
              <p className="font-display font-black text-2xl text-orange-600">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* SECTION 1: Resources Split Panels (Add Room / Log List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add New Room Resource (Form) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-outline-variant/60 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-extrabold text-md text-on-surface mb-5 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                {editingRoomId ? (lang === "th" ? "แก้ไขห้องประชุม" : "Edit Room") : t("adFormTitle")}
              </h3>

              <form onSubmit={handleSubmitRoom} className="space-y-5">
                
                {/* SECTION: General Info */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">General Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant">{lang === "th" ? "อาคาร" : "Building"}</label>
                      <select
                        value={roomBuilding}
                        onChange={(e) => setRoomBuilding(e.target.value as BuildingId)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm outline-hidden cursor-pointer bg-white"
                      >
                        {BUILDING_LIST.map((building) => (
                          <option key={building.id} value={building.id}>
                            {lang === "th" ? building.nameTh : building.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant">{t("adRoomName")}</label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="e.g. Conference C"
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant">{t("adRoomType")}</label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm outline-hidden cursor-pointer bg-white"
                      >
                        <option>Meeting</option>
                        <option>Executive</option>
                        <option>Workshop</option>
                        <option>Quiet Zone</option>
                        <option>Interview</option>
                        <option>Boardroom</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-outline-variant/30 w-full"></div>

                {/* SECTION: Capacity & Location */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Capacity & Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">{t("adFloorLevel")}</label>
                      <input
                        type="number"
                        value={floor}
                        min={1}
                        max={100}
                        onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Capacity</label>
                      <input
                        type="number"
                        value={capacity}
                        min={1}
                        onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                        required
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant">Tier</label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as "Standard" | "Premium" | "Elite Tier")}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm outline-hidden cursor-pointer bg-white"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Elite Tier">Elite Tier</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-outline-variant/30 w-full"></div>

                {/* SECTION: Equipment & Media */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Equipment & Media</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "High-speed Wifi", icon: <Wifi className="w-4 h-4" />, label: "Wi-Fi" },
                        { id: "4K Display", icon: <Monitor className="w-4 h-4" />, label: "4K Display" },
                        { id: "Projector", icon: <Projector className="w-4 h-4" />, label: "Projector" },
                        { id: "Whiteboard", icon: <ClipboardList className="w-4 h-4" />, label: "Whiteboard" },
                        { id: "Audio System", icon: <Speaker className="w-4 h-4" />, label: "Audio System" },
                        { id: "Coffee", icon: <Coffee className="w-4 h-4" />, label: "Coffee/Snack" },
                      ].map(amenity => {
                        const isActive = equipment.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => {
                              if (isActive) {
                                setEquipment(equipment.filter(e => e !== amenity.id));
                              } else {
                                setEquipment([...equipment, amenity.id]);
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all border ${
                              isActive 
                                ? "bg-primary-container text-primary border-primary-container shadow-xs" 
                                : "bg-surface text-on-surface-variant border-outline-variant hover:bg-outline-variant/30"
                            }`}
                          >
                            {amenity.icon}
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Cover Image URL (Optional)</label>
                    <input
                      type="url"
                      value={roomImage}
                      onChange={(e) => setRoomImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-[11px] focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF] font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-container text-white py-3 rounded-xl font-bold text-xs hover:bg-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("adSuccessSaved")}
                      </>
                    ) : (
                      <>
                        {editingRoomId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingRoomId ? (lang === "th" ? "อัปเดตข้อมูล" : "Update Room") : t("adBtnDeploy")}
                      </>
                    )}
                  </button>

                  {editingRoomId && (
                    <button
                      type="button"
                      onClick={resetRoomForm}
                      className="px-6 bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-xs hover:bg-outline-variant transition-all active:scale-95 cursor-pointer"
                    >
                      {lang === "th" ? "ยกเลิก" : "Cancel"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* System Logs Panel (Bookings & Emails) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-outline-variant/60 flex flex-col h-[520px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant pb-3.5 mb-4 gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveLogTab("bookings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLogTab === "bookings"
                      ? "bg-primary/5 text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  📝 {t("adLogTitle")}
                </button>
                <button
                  onClick={() => setActiveLogTab("emails")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLogTab === "emails"
                      ? "bg-primary/5 text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  📧 {lang === "th" ? "ประวัติการส่งอีเมล" : "Email Notification Logs"}
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={lang === "th" ? "ค้นหาประวัติ..." : "Search logs..."} 
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-medium w-full sm:w-48 focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[14px]">search</span>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar relative border border-outline-variant/40 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-surface-container/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-on-surface-variant tracking-wider">{activeLogTab === "bookings" ? "Title / Organizer" : "Status"}</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-on-surface-variant tracking-wider">{activeLogTab === "bookings" ? "Room" : "Recipient"}</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-on-surface-variant tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 bg-white">
                  {(() => {
                    const filteredLogs = bookings.filter(b => 
                      logSearch.trim() === "" || 
                      b.title.toLowerCase().includes(logSearch.toLowerCase()) || 
                      b.organizer.toLowerCase().includes(logSearch.toLowerCase()) ||
                      (activeLogTab === "emails" && b.attendees.some(a => a.email.toLowerCase().includes(logSearch.toLowerCase())))
                    );

                    if (filteredLogs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="text-center py-16 text-xs italic text-on-surface-variant/70">
                            {logSearch ? "No matching records found." : "No active records."}
                          </td>
                        </tr>
                      );
                    }

                    if (activeLogTab === "bookings") {
                      return filteredLogs.map((booking) => (
                        <tr key={booking.id} className="hover:bg-surface-container/20 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <p className="font-display font-black text-xs text-on-surface leading-tight truncate max-w-[200px]">
                              {booking.title}
                            </p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5 truncate max-w-[200px]">
                              {booking.organizer}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/60 rounded text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                              {rooms.find((r) => r.id === booking.roomId)?.name || `Room ${booking.roomId}`}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            <p className="text-[10px] font-bold text-on-surface">{booking.date}</p>
                            <p className="text-[9px] text-secondary font-mono font-medium">{booking.startTime}-{booking.endTime}</p>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <button
                              onClick={() => onCancelBooking(booking.id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title={t("adForceCancel")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ));
                    } else {
                      return filteredLogs.map((booking) => (
                        <tr key={`email-${booking.id}`} className="hover:bg-surface-container/20 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                <span className="text-[9px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                  Delivered
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-on-surface truncate max-w-[150px]">
                                [DN Meeting] {booking.title}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="text-[10px] text-on-surface-variant truncate max-w-[150px]">
                              To: <span className="font-bold text-on-surface">alex.m@dncenter.com</span>
                              {booking.attendees.length > 0 && (
                                <span>, {booking.attendees.map(a => a.email).join(", ")}</span>
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            <p className="text-[10px] font-bold text-on-surface">{booking.date}</p>
                            <p className="text-[9px] text-secondary font-mono font-medium">{booking.startTime}</p>
                          </td>
                          <td className="px-4 py-3 align-top text-right text-[9px] font-bold text-on-surface-variant/70">
                            SMTP Success
                          </td>
                        </tr>
                      ));
                    }
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: User Management Split Panels (Add User / Users List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add User Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-outline-variant/60">
            <h3 className="font-display font-extrabold text-md text-on-surface mb-5 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              {lang === "th" ? "เพิ่มผู้ใช้งานใหม่" : "Register New User"}
            </h3>

            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">
                  {lang === "th" ? "ชื่อ-นามสกุล" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Robert Downy"
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">
                  {lang === "th" ? "อีเมล" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. robert.d@dncenter.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">
                  {lang === "th" ? "สิทธิ์การเข้าถึง (บทบาท)" : "Access Permission Role"}
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm outline-hidden cursor-pointer bg-white"
                >
                  <option value="Member">{lang === "th" ? "Member (พนักงานทั่วไป)" : "Member"}</option>
                  <option value="Executive">{lang === "th" ? "Executive (ผู้บริหาร)" : "Executive"}</option>
                  <option value="Admin">{lang === "th" ? "Admin (ผู้ดูแลระบบ)" : "Admin"}</option>
                  <option value="Guest">{lang === "th" ? "Guest (บุคคลภายนอก)" : "Guest"}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-container text-white py-3 rounded-xl font-bold text-xs mt-3 hover:bg-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isUserSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {lang === "th" ? "บันทึกพนักงานสำเร็จ" : "User Saved Successfully"}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {lang === "th" ? "เพิ่มผู้ใช้" : "Register User"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Users Table List */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-outline-variant/60 flex flex-col h-[420px]">
            <h3 className="font-display font-extrabold text-md text-on-surface mb-5 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {lang === "th" ? "รายชื่อผู้ใช้งานในระบบ" : "Active Users Database"}
            </h3>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 divide-y divide-outline-variant/30">
              {users.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-outline-variant/50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-black text-xs text-on-surface leading-tight truncate">
                          {user.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          user.role === "Admin" ? "bg-red-100 text-red-700" :
                          user.role === "Executive" ? "bg-purple-100 text-purple-700" :
                          user.role === "Guest" ? "bg-stone-100 text-stone-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditUserClick(user)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit user"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(lang === "th" ? "คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้ออกจากระบบ?" : "Are you sure you want to remove this user?")) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Remove user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: Workspace Resource Management Panel */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="font-display font-extrabold text-md text-on-surface flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              {t("adManageTitle")}
            </h3>

            {/* Building Filter */}
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30 shrink-0">
              <button
                onClick={() => setRoomListFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  roomListFilter === "all"
                    ? "bg-white text-primary shadow-xs"
                    : "text-on-surface-variant/80 hover:text-primary"
                }`}
              >
                {t("rlAllRooms")}
              </button>
              {BUILDING_LIST.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setRoomListFilter(building.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    roomListFilter === building.id
                      ? "bg-white text-primary shadow-xs"
                      : "text-on-surface-variant/80 hover:text-primary"
                  }`}
                >
                  {lang === "th" ? building.shortNameTh : building.shortNameEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms
              .filter((room) => roomListFilter === "all" || room.buildingId === roomListFilter)
              .map((room) => (
              <div 
                key={room.id} 
                className="p-4 rounded-xl border border-outline-variant/50 bg-background/50 hover:bg-background transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      room.tier === "Elite Tier" ? "bg-purple-100 text-purple-700" :
                      room.tier === "Premium" ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-700"
                    }`}>
                      {room.tier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary">
                      {lang === "th" ? BUILDINGS[room.buildingId]?.shortNameTh : BUILDINGS[room.buildingId]?.shortNameEn}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Room {room.id}</span>
                    {room.status === "MAINTENANCE" && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5" />
                        {t("adMaintenanceBadge")}
                      </span>
                    )}
                  </div>
                  <p className="font-display font-black text-sm text-on-surface truncate">{room.name}</p>
                  <p className="text-[11px] text-on-surface-variant/80 truncate">{room.type} • Cap: {room.capacity}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onUpdateRoom && (
                    <button
                      onClick={() =>
                        onUpdateRoom({
                          ...room,
                          status: room.status === "MAINTENANCE" ? "ACTIVE" : "MAINTENANCE",
                        })
                      }
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                        room.status === "MAINTENANCE"
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                      title={room.status === "MAINTENANCE" ? t("adSetActive") : t("adSetMaintenance")}
                    >
                      {room.status === "MAINTENANCE" ? <PlayCircle className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditRoomClick(room)}
                    className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit this room"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t("adConfirmDelete"))) {
                        onDeleteRoom(room.id);
                      }
                    }}
                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                    title="Remove this room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md border border-outline-variant/60 shadow-xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-extrabold text-md text-on-surface flex items-center gap-2">
                    <Edit className="w-4 h-4 text-primary" />
                    {lang === "th" ? "แก้ไขข้อมูลพนักงาน" : "Edit User Profile"}
                  </h3>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveUser} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {lang === "th" ? "ชื่อ-นามสกุล" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {lang === "th" ? "อีเมล (แก้ไขไม่ได้)" : "Email (Read-Only)"}
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#e2e8f0] text-sm bg-[#f1f5f9] text-[#64748b] cursor-not-allowed outline-hidden"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {lang === "th" ? "สิทธิ์การเข้าถึง (บทบาท)" : "Access Permission Role"}
                    </label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm outline-hidden cursor-pointer bg-white"
                    >
                      <option value="Member">{lang === "th" ? "Member (พนักงานทั่วไป)" : "Member"}</option>
                      <option value="Executive">{lang === "th" ? "Executive (ผู้บริหาร)" : "Executive"}</option>
                      <option value="Admin">{lang === "th" ? "Admin (ผู้ดูแลระบบ)" : "Admin"}</option>
                      <option value="Guest">{lang === "th" ? "Guest (บุคคลภายนอก)" : "Guest"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {lang === "th" ? "รหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)" : "New Password (Leave blank to keep current)"}
                    </label>
                    <input
                      type="password"
                      value={editUserPassword}
                      onChange={(e) => setEditUserPassword(e.target.value)}
                      placeholder="e.g. ••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-outline-variant text-sm focus:ring-1 focus:ring-primary outline-hidden bg-[#FCFCFF]"
                    />
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 bg-surface-container hover:bg-surface-variant/40 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center"
                    >
                      {lang === "th" ? "ยกเลิก" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={isEditUserSubmitting}
                      className="flex-1 bg-primary-container text-white py-3 rounded-xl font-bold text-xs hover:bg-primary transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isEditUserSubmitting ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : (lang === "th" ? "บันทึก" : "Save Changes")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
