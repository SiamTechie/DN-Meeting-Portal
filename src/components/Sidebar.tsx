import React from "react";
import { ViewTab, User } from "../types";
import { LayoutDashboard, CalendarDays, BookMarked, ShieldCheck, Plus, MonitorPlay, Settings, LogOut } from "lucide-react";
import { Language, translations } from "../locales";
import { logoutUser } from "../services/auth";

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onNewBookingClick: () => void;
  lang: Language;
  currentUser?: User | null;
}

export default function Sidebar({ activeTab, setActiveTab, onNewBookingClick, lang, currentUser }: SidebarProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  const navItems = [
    { id: "dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    { id: "room-list", label: t("navExplore"), icon: CalendarDays },
    ...(currentUser ? [{ id: "my-bookings", label: t("navBookings"), icon: BookMarked }] : []),
    ...(currentUser?.role === "Admin" ? [{ id: "admin", label: t("navAdmin"), icon: ShieldCheck }] : []),
    { id: "kiosk", label: t("navKiosk"), icon: MonitorPlay },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant p-6 z-40">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md border border-white/10">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-on-surface tracking-tight uppercase">DN</h1>
              <p className="text-[11px] font-medium text-on-surface-variant">Meeting Portal</p>
            </div>
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
            <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-container-high transition-colors">
              <img
                className="w-10 h-10 rounded-full border border-outline-variant object-cover shadow-xs"
                alt={currentUser.name}
                src={currentUser.avatarUrl}
              />
              <div className="overflow-hidden flex-grow select-none">
                <p className="text-xs font-bold font-display truncate text-on-surface">{currentUser.name}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{currentUser.role}</p>
              </div>
              <button 
                onClick={() => logoutUser()}
                title="Sign out"
                className="text-on-surface-variant hover:text-red-500 cursor-pointer p-1 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-outline-variant flex justify-around py-2 px-1 z-50 shadow-lg select-none">
        {navItems.slice(0, 4).map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id || (item.id === "room-list" && activeTab === "room-detail");
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ViewTab)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg cursor-pointer ${
                isActive ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
