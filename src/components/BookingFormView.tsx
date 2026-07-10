import React, { useState, useEffect } from "react";
import { Room, Booking, Attendee, User } from "../types";
import { ATTENDEES_LIST } from "../data";
import { Calendar, Clock, Mail, Users, X, CheckCircle, HelpCircle, Video, MapPin, Globe } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface BookingFormViewProps {
  rooms: Room[];
  bookings: Booking[];
  selectedRoom: Room | null;
  initialStartTime?: string;
  onBookingSuccess: (newBooking: Booking) => void;
  onCancel: () => void;
  lang: Language;
  users: User[];
}

export default function BookingFormView({
  rooms,
  bookings,
  selectedRoom,
  initialStartTime = "10:00",
  onBookingSuccess,
  onCancel,
  lang,
  users,
}: BookingFormViewProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  const [meetingTitle, setMeetingTitle] = useState("Marketing Sync");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [bookingDate, setBookingDate] = useState("2024-10-24");
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState("11:30");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Online Meeting States
  const [meetingType, setMeetingType] = useState<"ON-SITE" | "ONLINE">("ON-SITE");
  const [onlinePlatform, setOnlinePlatform] = useState<"Zoom" | "Microsoft Teams" | "Google Meet" | "Other">("Zoom");
  const [onlineLink, setOnlineLink] = useState("");
  const [onlineId, setOnlineId] = useState("");
  
  // Attendee Multi-select States
  const [selectedAttendees, setSelectedAttendees] = useState<Attendee[]>([
    ATTENDEES_LIST[0], // Sarah Johnson
    ATTENDEES_LIST[1], // David K.
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");

  // Button loading animation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Set default active room on load
  useEffect(() => {
    if (selectedRoom) {
      setActiveRoomId(selectedRoom.id);
    } else if (rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [selectedRoom, rooms]);

  // Clear error message when parameters change
  useEffect(() => {
    setErrorMessage(null);
  }, [activeRoomId, bookingDate, startTime, endTime, meetingType]);

  const activeRoomObj = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  const handleAddAttendee = (attendee: Attendee) => {
    if (!selectedAttendees.some((a) => a.id === attendee.id)) {
      setSelectedAttendees([...selectedAttendees, attendee]);
    }
    setAttendeeSearch("");
    setShowDropdown(false);
  };

  const handleRemoveAttendee = (id: string) => {
    setSelectedAttendees(selectedAttendees.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    // Time validation check: Start must be before end
    if (startTime >= endTime) {
      setErrorMessage(t("bfErrorTime"));
      return;
    }

    // Check for double booking conflicts on the same date for the same room
    const hasConflict = bookings.some((booking) => {
      if (
        booking.roomId === activeRoomId &&
        booking.date === bookingDate &&
        booking.status !== "CANCELLED"
      ) {
        return startTime < booking.endTime && endTime > booking.startTime;
      }
      return false;
    });

    if (hasConflict) {
      setErrorMessage(t("bfErrorConflict"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulate micro-interactions loading (matching the mock script)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);

      setTimeout(() => {
        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          roomId: activeRoomId,
          title: meetingTitle,
          organizer: "Alex Morgan", // Current logged-in user
          organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM",
          date: bookingDate,
          startTime: startTime,
          endTime: endTime,
          attendees: selectedAttendees,
          status: "CONFIRMED",
          meetingType: meetingType,
          ...(meetingType === "ONLINE" ? {
            onlinePlatform,
            onlineLink: onlineLink.trim() || undefined,
            onlineId: onlineId.trim() || undefined
          } : {})
        };
        onBookingSuccess(newBooking);
      }, 1000);
    }, 1200);
  };

  // Filter dropdown options based on dynamic users list
  const listToSearch = (users && users.length > 0) ? users : ATTENDEES_LIST;
  const dropdownOptions = listToSearch.filter(
    (a) =>
      !selectedAttendees.some((selected) => selected.id === a.id) &&
      (a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(attendeeSearch.toLowerCase()))
  );

  return (
    <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Background Decorative Gradient Aura */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-fixed opacity-15 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary-fixed opacity-15 blur-3xl rounded-full pointer-events-none"></div>

      {/* Booking Form Container Card */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-[0px_10px_35px_rgba(0,0,0,0.06)] border border-outline-variant/60 relative z-10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar: Preselected Room Card Summary */}
        <div className="hidden md:flex flex-col w-64 bg-surface-container-low p-6 border-r border-outline-variant/65">
          {activeRoomObj && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="h-40 rounded-xl overflow-hidden mb-4 shadow-xs">
                  <img
                    className="w-full h-full object-cover"
                    alt={activeRoomObj.name}
                    src={activeRoomObj.image}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-display font-black text-lg text-primary leading-tight mb-0.5 select-all">
                  {activeRoomObj.name}
                </h3>
                <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-6">
                  {activeRoomObj.location.split("•")[0].trim()}
                </p>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-sans font-bold text-xs">{t("rlCapacity")} {activeRoomObj.capacity} {t("rlCapacity")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">videocam</span>
                    <span className="font-sans font-bold text-xs">{t("rdVideo")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">tv</span>
                    <span className="font-sans font-bold text-xs">{t("rdTv")}</span>
                  </div>
                </div>
              </div>

              {/* Informative Footer */}
              <div className="text-[10px] text-on-surface-variant/70 italic mt-6 select-none">
                {t("bfSidebarSub")}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Input Fields Form */}
        <div className="flex-grow p-6 md:p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="font-display font-black text-xl text-on-surface">{t("bfTitle")}</h1>
            <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">
              {t("bfSub")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Meeting Purpose Title */}
            <div className="space-y-1">
              <label className="font-sans font-bold text-xs text-on-surface-variant/90" htmlFor="meeting-title">
                {t("bfMeetingTitle")}
              </label>
              <input
                id="meeting-title"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Enter meeting purpose..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant font-sans text-sm focus:ring-2 focus:ring-secondary-container focus:border-primary outline-hidden transition-all bg-[#FCFCFF]"
                required
              />
            </div>

            {/* Field 2: Room Selector */}
            <div className="space-y-1">
              <label className="font-sans font-bold text-xs text-on-surface-variant/90" htmlFor="room-select">
                {t("bfRoomSelect")}
              </label>
              <select
                id="room-select"
                value={activeRoomId}
                onChange={(e) => setActiveRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant font-sans text-sm focus:ring-2 focus:ring-secondary-container focus:border-primary outline-hidden transition-all bg-white cursor-pointer"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.id} ({room.name} - Cap {room.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Field: Meeting Type Toggle (On-site vs Online) */}
            <div className="space-y-2">
              <label className="font-sans font-bold text-xs text-on-surface-variant/90">
                {t("bfFormat")}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMeetingType("ON-SITE")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    meetingType === "ON-SITE"
                      ? "bg-primary/5 text-primary border-primary"
                      : "bg-[#FCFCFF] text-on-surface-variant/95 border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {t("bfOnSite")}
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingType("ONLINE")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    meetingType === "ONLINE"
                      ? "bg-primary/5 text-primary border-primary"
                      : "bg-[#FCFCFF] text-on-surface-variant/95 border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {t("bfOnline")}
                </button>
              </div>
            </div>

            {/* Online Platform details (Render dynamically) */}
            <AnimatePresence>
              {meetingType === "ONLINE" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3.5 overflow-hidden bg-background/45 p-4 rounded-xl border border-dashed border-outline-variant/80"
                >
                  <div className="space-y-1">
                    <label className="font-sans font-bold text-[10px] text-on-surface-variant/80 uppercase tracking-wide">
                      {t("bfSelectPlatform")}
                    </label>
                    <select
                      value={onlinePlatform}
                      onChange={(e) => setOnlinePlatform(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white text-xs font-bold outline-hidden cursor-pointer"
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Other">Other Platform</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-sans font-bold text-[10px] text-on-surface-variant/80 uppercase tracking-wide">
                        {t("bfJoinLink")}
                      </label>
                      <input
                        type="url"
                        value={onlineLink}
                        onChange={(e) => setOnlineLink(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white text-xs outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-sans font-bold text-[10px] text-on-surface-variant/80 uppercase tracking-wide">
                        {t("bfMeetingId")}
                      </label>
                      <input
                        type="text"
                        value={onlineId}
                        onChange={(e) => setOnlineId(e.target.value)}
                        placeholder="e.g. 845 2849 2011"
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white text-xs outline-hidden"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Field 3: Double Date and Hour Pickers Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-sans font-bold text-xs text-on-surface-variant/90">{t("bfDate")}</label>
                <div className="relative">
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-outline-variant font-sans text-sm focus:ring-2 focus:ring-secondary-container focus:border-primary outline-hidden transition-all bg-[#FCFCFF] cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-sans font-bold text-xs text-on-surface-variant/90">{t("bfStartTime")}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-outline-variant font-sans text-sm focus:ring-2 focus:ring-secondary-container focus:border-primary outline-hidden transition-all bg-[#FCFCFF] cursor-pointer text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-bold text-xs text-on-surface-variant/90">{t("bfEndTime")}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-outline-variant font-sans text-sm focus:ring-2 focus:ring-secondary-container focus:border-primary outline-hidden transition-all bg-[#FCFCFF] cursor-pointer text-center"
                  />
                </div>
              </div>
            </div>

            {/* Field 4: Attendees Multi-select with Search Popovers */}
            <div className="space-y-1 relative">
              <label className="font-sans font-bold text-xs text-on-surface-variant/90">{t("bfGuests")}</label>
              
              <div className="p-2 border border-outline-variant rounded-xl flex flex-wrap gap-1.5 items-center min-h-[46px] bg-white relative">
                <AnimatePresence>
                  {selectedAttendees.map((att) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={att.id}
                      className="flex items-center gap-1.5 bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-full text-xs font-semibold shadow-2xs select-none"
                    >
                      <img className="w-5 h-5 rounded-full object-cover shrink-0" alt={att.name} src={att.avatarUrl} referrerPolicy="no-referrer" />
                      <span className="truncate max-w-[80px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(att.id)}
                        className="p-0.5 rounded-full hover:bg-on-secondary-fixed/15 text-on-secondary-fixed cursor-pointer shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => {
                    setAttendeeSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={selectedAttendees.length === 0 ? "Add guest email..." : "Add..."}
                  className="flex-grow font-sans text-xs focus:outline-hidden p-1 min-w-[120px] bg-transparent border-transparent focus:ring-0 focus:border-transparent outline-hidden"
                />
              </div>

              {showDropdown && dropdownOptions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)}></div>
                  <ul className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-outline-variant rounded-xl shadow-lg z-40 max-h-48 overflow-y-auto custom-scrollbar p-1 divide-y divide-outline-variant/10">
                    {dropdownOptions.map((att) => (
                      <li
                        key={att.id}
                        onClick={() => handleAddAttendee(att)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors"
                      >
                        <img className="w-6 h-6 rounded-full object-cover shrink-0" alt={att.name} src={att.avatarUrl} referrerPolicy="no-referrer" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-on-surface truncate">{att.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate">{att.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Error Message Alert Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-xl border border-red-200/60 flex items-start gap-2.5"
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
 
            <AnimatePresence>
              {isBooked && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 text-blue-700 text-xs font-semibold p-4 rounded-xl border border-blue-200 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">mail</span>
                    <span className="font-bold">
                      {lang === "th" ? "📧 จำลองการส่งอีเมลแจ้งเตือนสำเร็จ!" : "📧 Simulated Email Notification Sent!"}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700/90 font-medium leading-relaxed">
                    {lang === "th"
                      ? `ส่งจดหมายตอบกลับและคำนัดหมายปฏิทินไปที่ alex.m@dncenter.com (Alex Morgan) และอีเมลผู้เข้าร่วมประชุมทั้งหมด (${selectedAttendees.map((a) => a.name).join(", ") || "ไม่มี"}) สำเร็จแล้ว`
                      : `Invitation cards & calendar events successfully delivered to alex.m@dncenter.com (Alex Morgan) & guests (${selectedAttendees.map((a) => a.name).join(", ") || "none"}).`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons Frame */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || isBooked}
                className={`flex-grow font-sans font-bold text-xs py-3.5 px-4 rounded-xl shadow-xs transition-all flex justify-center items-center gap-2 cursor-pointer outline-hidden ${
                  isBooked
                    ? "bg-green-600 text-white"
                    : "bg-primary-container text-white hover:bg-primary active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    {t("bfProcessing")}
                  </>
                ) : isBooked ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-white" />
                    {t("bfBookedSuccess")}
                  </>
                ) : (
                  <>
                    {t("bfConfirm")}
                    <CheckCircle className="w-4 h-4 text-white shrink-0" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="flex-grow sm:flex-none sm:w-28 bg-surface-container-high text-on-surface-variant font-sans font-bold text-xs py-3.5 rounded-xl hover:bg-outline-variant/40 transition-colors cursor-pointer outline-hidden"
              >
                {t("bfCancel")}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
