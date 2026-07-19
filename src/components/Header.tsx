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
        return lang === "th" ? "หน้านี้แสดงภาพรวมของการจองห้องประชุมทั้งหมด คุณสามารถดูตารางเวลาและเลือกจองห้องได้อย่างรวดเร็ว" : "This page shows an overview of all room bookings. You can view schedules and quickly book a room.";
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
    <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface/85 backdrop-blur-md select-none">
      <div className="flex items-center gap-6">
        {/* Page Title */}
        <h1 className="hidden lg:block font-display font-bold text-xl text-primary select-none">
          {title}
        </h1>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary w-[260px] md:w-[320px] transition-all"
          />
        </div>
      </div>

      {/* Action Badges */}
      <div className="flex items-center gap-3">
        {/* Language Switcher Buttons */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30 text-xs font-bold mr-2">
          <button
            onClick={() => setLang("th")}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              lang === "th" ? "bg-white text-primary shadow-2xs" : "text-on-surface-variant/80 hover:text-primary"
            }`}
          >
            TH
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              lang === "en" ? "bg-white text-primary shadow-2xs" : "text-on-surface-variant/80 hover:text-primary"
            }`}
          >
            EN
          </button>
        </div>

        <button 
          onClick={handleNotificationClick}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant relative transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {hasNewBookings && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          )}
        </button>

        <div className="relative group/help">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant transition-colors cursor-pointer">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-outline-variant rounded-xl shadow-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all p-4 z-50">
            <h4 className="font-bold text-on-surface text-sm mb-1">{lang === "th" ? "คู่มือการใช้งาน" : "Help Guide"}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {getHelpContent()}
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-outline-variant/60 mx-1"></div>

        {/* User Profile or Login */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-on-surface">{currentUser.name}</p>
              <p className="text-[10px] text-on-surface-variant font-medium">{currentUser.role}</p>
            </div>
            <div className="relative group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant shadow-xs cursor-pointer">
                <img
                  className="w-full h-full object-cover"
                  alt={currentUser.name}
                  src={currentUser.avatarUrl}
                />
              </div>
              
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-outline-variant rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link 
                  to="/profile"
                  className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high rounded-t-xl flex items-center gap-2 cursor-pointer border-b border-outline-variant/30"
                >
                  <Settings className="w-4 h-4 text-on-surface-variant" />
                  {lang === "th" ? "จัดการบัญชี" : "Profile"}
                </Link>
                <button 
                  onClick={() => logoutUser()}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {lang === "th" ? "ออกจากระบบ" : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:block">{lang === "th" ? "เข้าสู่ระบบ" : "Log In"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
