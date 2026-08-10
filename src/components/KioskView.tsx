import React, { useState, useEffect } from "react";
import { Room, Booking, BuildingId } from "../types";
import { Calendar, Clock, MapPin, CheckCircle, RefreshCw, Layers, Wrench } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface KioskViewProps {
  rooms: Room[];
  bookings: Booking[];
  onInstantBook: (roomId: string, startTime: string) => void;
  lang: Language;
  selectedBuilding: BuildingId;
}

export default function KioskView({ rooms, bookings, onInstantBook, lang, selectedBuilding }: KioskViewProps) {
  // Kiosk only shows rooms belonging to the currently selected building.
  const buildingRooms = rooms.filter((r) => r.buildingId === selectedBuilding);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [currentTimeNum, setCurrentTimeNum] = useState(12.5); // Format: hour + minute/60
  const [currentDateStr, setCurrentDateStr] = useState("2024-10-24"); // Format: YYYY-MM-DD

  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Set/refresh the active room whenever the building-scoped room list
  // changes (including when switching buildings), and run the real clock.
  useEffect(() => {
    if (buildingRooms.length > 0 && !buildingRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(buildingRooms[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, selectedBuilding, selectedRoomId]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // format time e.g. "12:30 PM"
      const formattedTime = now.toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
      setTimeStr(formattedTime);

      // format date e.g. "Thursday, Oct 24, 2024"
      const formattedDate = now.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      setDateStr(formattedDate);

      // get current time in float format (e.g. 12:30 is 12.5, 14:15 is 14.25)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setCurrentTimeNum(hours + minutes / 60);

      // get date in YYYY-MM-DD format
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setCurrentDateStr(`${year}-${month}-${day}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const activeRoom = buildingRooms.find((r) => r.id === selectedRoomId) || buildingRooms[0];

  // Get active current booking based on real-time current date
  const roomBookings = bookings.filter(
    (b) => b.roomId === activeRoom?.id && b.date === currentDateStr && b.status === "CONFIRMED"
  );

  // Find booking active at current time
  const activeBooking = roomBookings.find((b) => {
    const [startH, startM] = b.startTime.split(":").map(Number);
    const [endH, endM] = b.endTime.split(":").map(Number);
    const startNum = startH + startM / 60;
    const endNum = endH + endM / 60;
    return startNum <= currentTimeNum && endNum > currentTimeNum;
  });

  // Find next upcoming booking after current time
  const nextBooking = roomBookings
    .filter((b) => {
      const [startH, startM] = b.startTime.split(":").map(Number);
      return startH + startM / 60 >= currentTimeNum;
    })
    .sort((a, b) => {
      const aStart = a.startTime.localeCompare(b.startTime);
      return aStart;
    })[0];

  return (
    <div className="flex-grow flex flex-col bg-transparent text-on-surface p-6 md:p-8 select-none">
      
      {/* Kiosk Mode Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-outline-variant pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
            <h2 className="font-display font-black text-xl tracking-tight text-on-surface uppercase">
              {t("kiTitle")}
            </h2>
          </div>
          <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
            {t("kiSub")}
          </p>
        </div>

        {/* Room Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-on-surface-variant font-bold" htmlFor="kiosk-room-select">{t("kiRoomSelect")}</label>
          <select
            id="kiosk-room-select"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-surface border border-outline-variant text-on-surface font-sans text-xs font-bold py-2 px-3 rounded-lg outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {buildingRooms.map((r) => (
              <option key={r.id} value={r.id} className="text-on-surface bg-surface">
                Room {r.id} ({r.name}){r.status === "MAINTENANCE" ? ` ${t("bfMaintenanceOption")}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-stretch">
          
          {/* Main Status Area Left */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Background Glow reflecting state */}
            {activeRoom.status === "MAINTENANCE" ? (
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
            ) : activeBooking ? (
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-red-600/10 blur-3xl rounded-full pointer-events-none"></div>
            ) : (
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-green-500/10 blur-3xl rounded-full pointer-events-none"></div>
            )}

            {/* Time / Room Meta */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-display font-black text-3xl leading-tight text-on-surface select-all">
                  Room {activeRoom.id}
                </h3>
                <p className="text-on-surface-variant text-xs font-semibold flex items-center gap-1.5 mt-1 select-all">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant/80" />
                  {activeRoom.location.split("•")[0].trim()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono font-black text-2xl tracking-tight text-on-surface leading-none">
                  {timeStr}
                </p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                  {dateStr}
                </p>
              </div>
            </div>

            {/* Huge Occupied / Available Panel */}
            <div className="my-10">
              {activeRoom.status === "MAINTENANCE" ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 border border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    <Wrench className="w-3.5 h-3.5" />
                    {t("kiStatusMaintenance")}
                  </div>

                  <div>
                    <h1 className="font-display font-black text-4xl leading-tight text-on-surface">
                      {t("kiStatusMaintenance")}
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {t("kiMaintenanceDesc")}
                    </p>
                  </div>
                </div>
              ) : activeBooking ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    {t("kiStatusOccupied")}
                  </div>

                  <div>
                    <h1 className="font-display font-black text-4xl leading-tight select-all">
                      {activeBooking.title}
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {t("mbOrganizedBy")} <span className="font-bold text-on-surface">{activeBooking.organizer}</span>
                    </p>
                  </div>

                  <p className="text-on-surface-variant font-mono font-bold text-lg">
                    {activeBooking.startTime} - {activeBooking.endTime}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 border border-green-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t("kiStatusAvailable")}
                  </div>

                  <div>
                    <h1 className="font-display font-black text-4xl leading-tight text-on-surface">
                      {t("kiOpenBooking")}
                    </h1>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {t("kiTapQuick")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-6 gap-4">
              <div>
                {nextBooking ? (
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                    {t("kiNextMeeting")} <span className="text-on-surface font-bold">{nextBooking.title}</span> ({nextBooking.startTime})
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant/70 font-semibold uppercase tracking-wider">
                    {t("kiNoMoreMeetings")}
                  </p>
                )}
              </div>

              {!activeBooking && activeRoom.status !== "MAINTENANCE" && (
                <button
                  onClick={() => {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    onInstantBook(activeRoom.id, `${hours}:${minutes}`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl font-black font-display text-xs uppercase tracking-widest transition-transform active:scale-95 cursor-pointer shadow-md"
                >
                  {t("kiQuickBookBtn")}
                </button>
              )}
            </div>

          </div>

          {/* Schedule Column Right */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-3xl p-6 flex flex-col">
            <h3 className="font-display font-extrabold text-sm text-on-surface mb-4 flex items-center gap-2 select-none">
              <Clock className="w-4 h-4 text-on-surface-variant" />
              {t("kiTodaysSchedule")}
            </h3>

            <div className="space-y-3.5 flex-grow overflow-y-auto custom-scrollbar pr-1">
              {roomBookings.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant/60 text-xs italic select-none">
                  {t("kiNoBookingsToday")}
                </div>
              ) : (
                roomBookings
                  .sort((a, b) => {
                    const aStart = parseInt(a.startTime.split(":")[0]);
                    const bStart = parseInt(b.startTime.split(":")[0]);
                    return aStart - bStart;
                  })
                  .map((b) => {
                    const isActive = activeBooking?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-red-500/10 border-red-500/20 text-on-surface"
                            : "bg-surface-container-low border-outline-variant hover:border-primary/25 text-on-surface"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 select-none">
                          <p className="font-display font-black text-xs leading-tight truncate">
                            {b.title}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-on-surface-variant shrink-0">
                            {b.startTime}
                          </span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1 select-none">
                          By {b.organizer}
                        </p>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Simulated hardware info */}
            <div className="mt-4 pt-4 border-t border-outline-variant text-[9px] text-on-surface-variant flex justify-between items-center select-none">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                DN KIOSK v2.4.1
              </span>
              <span className="text-right">Connected</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
