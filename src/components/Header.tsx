import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, HelpCircle, LogIn, LogOut, Settings } from "lucide-react";
import { Language, translations } from "../locales";
import { User, Booking } from "../types";
import { logoutUser } from "../services/auth";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  title: string;
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser?: User | null;
  onLoginClick?: () => void;
  bookings?: Booking[];
  activeTab?: string;
}

export default function Header({ searchQuery, setSearchQuery, title, lang, setLang, currentUser, onLoginClick, bookings = [], activeTab = "" }: HeaderProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  const [lastViewedAt, setLastViewedAt] = useState<number>(() => {
    return parseInt(localStorage.getItem("dn_last_viewed_notifications") || "0", 10);
  });

  // Popover States
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const latestBookingTime = bookings.reduce((max, b) => {
    if (!b.createdAt) return max;
    const time = new Date(b.createdAt).getTime();
    return time > max ? time : max;
  }, 0);

  const hasNewBookings = latestBookingTime > lastViewedAt;

  const handleNotificationClick = () => {
    const now = Date.now();
    setLastViewedAt(now);
    localStorage.setItem("dn_last_viewed_notifications", now.toString());
  };

  const getHelpContent = () => {
    switch(activeTab) {
      case "dashboard":
        return lang === "th" ? "หน้านี้แสดงภาพรวมของการจองห้องประชุมทั้งหมด คุณสามารถดูตารางเวลาและเลือกจองห้องได้อย่างรวด" : "This page shows an overview of all room bookings. You can view schedules and quickly book a room.";
      case "room-list":
        return lang === "th" ? "ค้นหาและเรียกดูห้องประชุมทั้งหมด พร้อมดูรายละเอียดและสิ่งอำนวยความสะดวกของแต่ละห้อง" : "Search and browse all meeting rooms, view their details and available amenities.";
      case "room-detail":
        return lang === "th" ? "ดูรายละเอียดเชิงลึกของห้องประชุมที่เลือก รวมถึงปฏิทินการจองเฉพาะห้องนี้" : "View in-depth details of the selected room, including its specific booking calendar.";
      case "booking-form":
        return lang === "th" ? "กรอกข้อมูลเพื่อทำการจองห้องประชุม ระบุเวลา ผู้เข้าร่วม และรายละเอียดการประชุม" : "Fill in the details to book a meeting room. Specify time, attendees, and meeting specifics.";
      case "my-bookings":
        return lang === "th" ? "จัดการรายการจองของคุณ ดูสถานะ หรือยกเลิกการจองได้ที่นี่" : "Manage your bookings. View status, or cancel your reservations here.";
      case "admin":
        return lang === "th" ? "หน้าสำหรับผู้ดูแลระบบ เพื่อจัดการห้องประชุม ผู้ใช้งาน และข้อมูลภาพรวมของระบบ" : "Admin panel for managing rooms, users, and overall system data.";
      default:
        return lang === "th" ? "คู่มือการใช้งานหน้านี้" : "Page user guide.";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-outline-variant bg-surface/85 backdrop-blur-md select-none">
      <div className="flex items-center gap-3 sm:gap-6 flex-grow max-w-xs sm:max-w-none">
        {/* Page Title */}
        <h1 className="hidden md:block font-display font-bold text-xl sm:text-2xl text-primary select-none whitespace-nowrap">
          {title}
        </h1>

        {/* Search Bar */}
        <div className="relative group flex-grow sm:flex-grow-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-xs sm:text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-[240px] md:w-[320px] transition-all"
          />
        </div>
      </div>

      {/* Action Badges */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        <button 
          onClick={handleNotificationClick}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant relative transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {hasNewBookings && (
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-error rounded-full ring-2 ring-surface"></span>
          )}
        </button>

        {/* Help Guide Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer ${isHelpOpen ? 'bg-surface-variant/40 text-primary' : ''}`}
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {isHelpOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsHelpOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-white border border-outline-variant rounded-xl shadow-lg p-4 z-50">
                <h4 className="font-bold text-on-surface text-sm mb-1">{lang === "th" ? "คู่มือการใช้งาน" : "Help Guide"}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {getHelpContent()}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="h-5 sm:h-6 w-px bg-outline-variant/60 mx-0.5 sm:mx-1"></div>

        {/* User Profile or Login */}
        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold text-on-surface">{currentUser.name}</p>
              <p className="text-[10px] text-on-surface-variant font-medium">{currentUser.role}</p>
            </div>
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-outline-variant shadow-xs cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              >
                <img
                  className="w-full h-full object-cover"
                  alt={currentUser.name}
                  src={currentUser.avatarUrl}
                />
              </div>
              
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-36 sm:w-40 bg-white border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
                    <Link 
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-on-surface hover:bg-surface-container-high rounded-t-xl flex items-center gap-2 cursor-pointer border-b border-outline-variant/30"
                    >
                      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-surface-variant" />
                      {lang === "th" ? "จัดการบัญชี" : "Profile"}
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logoutUser();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-b-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {lang === "th" ? "ออกจากระบบ" : "Sign Out"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white text-xs sm:text-sm font-bold rounded-full hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:block">{lang === "th" ? "เข้าสู่ระบบ" : "Log In"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
