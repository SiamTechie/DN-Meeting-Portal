import React from "react";
import { Room, Booking } from "../types";
import { ChevronRight, ArrowLeft, Users, Layers, Maximize, Award, Wifi, Tv, Video, Coffee, HelpCircle, CalendarRange } from "lucide-react";
import { Language, translations } from "../locales";
import { motion } from "motion/react";

interface RoomDetailViewProps {
  room: Room;
  bookings: Booking[];
  onBack: () => void;
  onBookClick: (room: Room) => void;
  lang: Language;
}

export default function RoomDetailView({ room, bookings, onBack, onBookClick, lang }: RoomDetailViewProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Filter bookings for this room today
  const roomBookingsToday = bookings.filter((b) => b.roomId === room.id && b.status === "CONFIRMED");

  // Custom descriptions based on equipment
  const getEquipmentMeta = (eq: string) => {
    const eqLower = eq.toLowerCase();
    if (eqLower.includes("wifi")) {
      return {
        icon: <Wifi className="w-5 h-5 text-on-secondary-fixed" />,
        label: t("rdWifi"),
        desc: t("rdWifiDesc"),
      };
    }
    if (eqLower.includes("display") || eqLower.includes("tv") || eqLower.includes("panel")) {
      return {
        icon: <Tv className="w-5 h-5 text-on-secondary-fixed" />,
        label: t("rdTv"),
        desc: t("rdTvDesc"),
      };
    }
    if (eqLower.includes("video") || eqLower.includes("camera") || eqLower.includes("conference")) {
      return {
        icon: <Video className="w-5 h-5 text-on-secondary-fixed" />,
        label: t("rdVideo"),
        desc: t("rdVideoDesc"),
      };
    }
    if (eqLower.includes("coffee")) {
      return {
        icon: <Coffee className="w-5 h-5 text-on-secondary-fixed" />,
        label: t("rdCoffee"),
        desc: t("rdCoffeeDesc"),
      };
    }
    return {
      icon: <Award className="w-5 h-5 text-on-secondary-fixed" />,
      label: eq,
      desc: t("rdEquipmentDefault"),
    };
  };

  // Vertical Availability slots (08:00 to 17:00)
  const slots = [
    { label: "08:00", time: "08:00 - 09:00" },
    { label: "09:00", time: "09:00 - 10:00" },
    { label: "10:00", time: "10:00 - 11:00" },
    { label: "11:00", time: "11:00 - 12:00" },
    { label: "12:00", time: "12:00 - 13:00" },
    { label: "13:00", time: "13:00 - 14:00" },
    { label: "14:00", time: "14:00 - 15:00" },
    { label: "15:00", time: "15:00 - 16:00" },
    { label: "16:00", time: "16:00 - 17:00" },
  ];

  // Check if a time slot is booked
  const getBookingForSlot = (timeLabel: string) => {
    return roomBookingsToday.find((b) => {
      const bStartHour = parseInt(b.startTime.split(":")[0]);
      const bEndHour = parseInt(b.endTime.split(":")[0]);
      const slotHour = parseInt(timeLabel.split(":")[0]);
      return slotHour >= bStartHour && slotHour < bEndHour;
    });
  };

  return (
    <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-on-surface-variant font-sans text-xs select-none">
          <button
            onClick={onBack}
            className="hover:text-primary transition-colors flex items-center gap-1 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("rdBack")}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline-variant" />
          <span className="text-on-surface font-semibold">Room {room.id}</span>
        </nav>

        {/* Room Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Hero & Bento Row) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Main Picture Frame */}
            <div className="relative group rounded-2xl overflow-hidden shadow-xs bg-white aspect-video relative">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                alt={room.name}
                src={room.image}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 flex gap-2 select-none">
                <span className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 text-primary shadow-sm">
                  <span className="material-symbols-outlined scale-75 text-primary">photo_camera</span>
                  1/8 Photos
                </span>
              </div>
            </div>

            {/* Room Identity */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-outline-variant/60">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="font-display font-black text-2xl text-on-surface mb-1 select-all">{room.name}</h2>
                  <p className="text-on-surface-variant font-sans text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
                    {room.location}
                  </p>
                </div>
              </div>

              {/* Highlights Bento Box Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-outline-variant/40 pt-6 select-none">
                <div className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <Users className="w-5 h-5 text-primary mb-1.5" />
                  <span className="font-sans font-bold text-xs text-on-surface text-center">
                    {room.capacity} {t("rdCapacity")}
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <Layers className="w-5 h-5 text-primary mb-1.5" />
                  <span className="font-sans font-bold text-xs text-on-surface text-center">
                    {t("rdFloor")} {room.floor.toString().padStart(2, "0")}
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <Maximize className="w-5 h-5 text-primary mb-1.5" />
                  <span className="font-sans font-bold text-xs text-on-surface text-center">
                    {room.sqft} {t("rdSqft")}
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <Award className="w-5 h-5 text-primary mb-1.5" />
                  <span className="font-sans font-bold text-xs text-on-surface text-center">{room.tier}</span>
                </div>
              </div>
            </div>

            {/* Room Equipment List */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-outline-variant/60">
              <h3 className="font-display font-extrabold text-md text-on-surface mb-5">{t("rdEquipment")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                {room.equipment.map((eq, idx) => {
                  const meta = getEquipmentMeta(eq);
                  return (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed group-hover:scale-105 transition-transform">
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-sans font-bold text-xs text-on-surface leading-snug">{meta.label}</p>
                        <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">{meta.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (Live Availability Mini Timeline) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Live Availability Miniature Calendar */}
            <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/60 sticky top-4 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low select-none">
                <h3 className="font-display font-extrabold text-sm text-on-surface flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-primary" />
                  {t("rdAvailability")}
                </h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                  {new Date().toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>

              {/* Scrollable Micro Vertical Grid */}
              <div className="h-[280px] overflow-y-auto custom-scrollbar relative bg-surface-container-low/20">
                <div className="divide-y divide-outline-variant/40">
                  {slots.map((slot) => {
                    const booking = getBookingForSlot(slot.label);
                    return (
                      <div key={slot.label} className="flex items-center min-h-[48px] px-4 relative select-none">
                        {/* Time marker */}
                        <div className="w-14 shrink-0 font-mono text-[10px] font-bold text-on-surface-variant/90 border-r border-outline-variant/40 pr-2">
                          {slot.label}
                        </div>

                        {/* Status detail box */}
                        <div className="flex-grow pl-4 min-w-0 flex items-center py-2 h-full">
                          {booking ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="w-2 h-2 rounded-full bg-error shrink-0"></span>
                              <div className="overflow-hidden min-w-0">
                                <p className="text-[10px] font-bold text-on-surface truncate leading-tight select-all">
                                  {booking.title}
                                </p>
                                <p className="text-[9px] text-on-surface-variant leading-none mt-0.5">
                                  by {booking.organizer}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full text-on-surface-variant/50">
                              <span className="w-2 h-2 rounded-full bg-outline-variant shrink-0"></span>
                              <span className="text-[10px] font-bold tracking-tight uppercase">Open</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Book trigger */}
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/75 select-none">
                <button
                  onClick={() => onBookClick(room)}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold font-display text-xs uppercase tracking-widest hover:bg-primary/95 transition-colors active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  {t("rdBookBtn")}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
