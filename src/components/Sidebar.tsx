import React from "react";
import { Link } from "react-router-dom";
import { ViewTab, User, BuildingId } from "../types";
import { LayoutDashboard, CalendarDays, BookMarked, ShieldCheck, Plus, MonitorPlay, Settings, LogOut, HelpCircle } from "lucide-react";
import { Language, translations } from "../locales";
import { logoutUser } from "../services/auth";
import { BUILDING_LIST, BUILDINGS } from "../buildings";

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onNewBookingClick: () => void;
  lang: Language;
  currentUser?: User | null;
  selectedBuilding: BuildingId;
  onSelectBuilding: (buildingId: BuildingId) => void;
}

export default function Sidebar({ activeTab, setActiveTab, onNewBookingClick, lang, currentUser, selectedBuilding, onSelectBuilding }: SidebarProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;
  const activeBuilding = BUILDINGS[selectedBuilding];

  const navItems = [
    { id: "dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    { id: "room-list", label: t("navExplore"), icon: CalendarDays },
    ...(currentUser ? [{ id: "my-bookings", label: t("sbMyBookings"), icon: BookMarked }] : []),
    ...(currentUser?.role === "Admin" ? [{ id: "admin", label: t("navAdmin"), icon: ShieldCheck }] : []),
    { id: "user-manual", label: t("navManual"), icon: HelpCircle },
    // { id: "kiosk", label: t("navKiosk"), icon: MonitorPlay },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant p-6 z-40">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            {activeBuilding.logoUrl ? (
              <img
                src={activeBuilding.logoUrl}
                alt={activeBuilding.nameEn}
                className="w-12 h-12 rounded-full object-contain bg-white shadow-md border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[24px]">meeting_room</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-display font-bold text-sm text-on-surface whitespace-nowrap">Meeting Portal</span>
              <span className="text-on-surface-variant/40 text-xs">•</span>
              <span className="text-xs font-medium text-on-surface-variant truncate">
                {lang === "th" ? "ระบบจองห้องประชุม" : "Meeting Room Booking System"}
              </span>
            </div>
          </div>
        </div>

        {/* Building Switcher */}
        <div className="mb-6 px-1">
          <div className="grid grid-cols-2 gap-1 bg-surface-container-high rounded-xl p-1">
            {BUILDING_LIST.map((building) => {
              const isActive = building.id === selectedBuilding;
              return (
                <button
                  key={building.id}
                  onClick={() => onSelectBuilding(building.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {lang === "th" ? building.shortNameTh : building.shortNameEn}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="flex-grow space-y-2 select-none">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id || (item.id === "room-list" && activeTab === "room-detail");
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ViewTab)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-primary font-semibold shadow-xs border border-primary/5"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? "stroke-[2.5px] text-primary" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-6 pt-4 border-t border-outline-variant">
          <button
            onClick={onNewBookingClick}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            {t("navNewBooking")}
          </button>

          {currentUser && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-container-high transition-colors group">
              <Link to="/profile" className="flex items-center gap-3 flex-grow overflow-hidden cursor-pointer" aria-label="View Profile">
                <img
                  className="w-10 h-10 rounded-full border border-outline-variant object-cover shadow-xs group-hover:border-primary transition-colors shrink-0"
                  alt={currentUser.name}
                  src={currentUser.avatarUrl}
                />
                <div className="overflow-hidden flex-grow select-none">
                  <p className="text-xs font-bold font-display truncate text-on-surface group-hover:text-primary transition-colors">{currentUser.name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{currentUser.role}</p>
                </div>
              </Link>
              <button 
                onClick={(e) => { e.preventDefault(); logoutUser(); }}
                title="Sign out"
                aria-label="Sign out"
                className="text-on-surface-variant hover:text-error hover:bg-error/10 cursor-pointer p-2 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Version & Copyright Footer */}
          <div className="text-center select-none pt-2 border-t border-outline-variant/30">
            <p className="text-[9px] text-on-surface-variant/60">© 2026 {activeBuilding.nameEn.toUpperCase()} CO., LTD.</p>
            <p className="text-[9px] font-mono text-primary/60 mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-outline-variant flex justify-around py-2 px-1 z-50 shadow-lg select-none pb-[env(safe-area-inset-bottom)]">
        {navItems.filter(item => item.id !== "kiosk").map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id || (item.id === "room-list" && activeTab === "room-detail");
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ViewTab)}
              className={`flex flex-col items-center justify-center gap-1 py-1 min-w-[56px] rounded-lg cursor-pointer transition-colors ${
                isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-label={item.label}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
