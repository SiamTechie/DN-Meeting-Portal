import React, { useState } from "react";
import { Room, Booking } from "../types";
import { ChevronLeft, ChevronRight, Filter, TrendingUp, Users, Clock, Flame, CalendarRange, MapPin } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface DashboardViewProps {
  rooms: Room[];
  bookings: Booking[];
  onRoomSelect: (room: Room) => void;
  onInstantBook: (roomId: string, startTime: string) => void;
  lang: Language;
}

export default function DashboardView({ rooms, bookings, onRoomSelect, onInstantBook, lang }: DashboardViewProps) {
  // Base date for navigation. We use 2024-10-24 as the default simulated current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2024-10-24"));
  const [activeSegment, setActiveSegment] = useState<"Day" | "Week" | "Month">("Week");
  
  // Filtering for Week View (view bookings for all rooms, or one specific room)
  const [selectedFilterRoomId, setSelectedFilterRoomId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // [8, 9, ..., 18]
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Time conversion helper
  const calculatePosition = (startTime: string, endTime: string) => {
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const startHourOffset = Math.max(0, start - 8);
    const duration = Math.max(0.5, end - start);
    return { top: startHourOffset * 60, height: duration * 60 };
  };

  const getRoomColorClasses = (roomId: string, mode: "card" | "pill" = "card") => {
    switch (roomId) {
      case "101":
        return mode === "card" ? "bg-sky-50 text-sky-800 border-sky-400" : "bg-sky-100 text-sky-800 border-sky-400 hover:bg-sky-200";
      case "102":
        return mode === "card" ? "bg-orange-50 text-orange-800 border-orange-400" : "bg-orange-100 text-orange-800 border-orange-400 hover:bg-orange-200";
      case "103":
        return mode === "card" ? "bg-emerald-50 text-emerald-800 border-emerald-400" : "bg-emerald-100 text-emerald-800 border-emerald-400 hover:bg-emerald-200";
      case "201":
        return mode === "card" ? "bg-purple-50 text-purple-800 border-purple-400" : "bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-200";
      case "202":
        return mode === "card" ? "bg-rose-50 text-rose-800 border-rose-400" : "bg-rose-100 text-rose-800 border-rose-400 hover:bg-rose-200";
      case "203":
        return mode === "card" ? "bg-amber-50 text-amber-800 border-amber-400" : "bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-200";
      case "301":
        return mode === "card" ? "bg-lime-50 text-lime-800 border-lime-400" : "bg-lime-100 text-lime-800 border-lime-400 hover:bg-lime-200";
      default:
        return mode === "card" ? "bg-slate-50 text-slate-800 border-slate-400" : "bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200";
    }
  };

  // Navigations based on view mode
  const handleNext = () => {
    const next = new Date(currentDate);
    if (activeSegment === "Day") {
      next.setDate(next.getDate() + 1);
    } else if (activeSegment === "Week") {
      next.setDate(next.getDate() + 7);
    } else if (activeSegment === "Month") {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handlePrev = () => {
    const prev = new Date(currentDate);
    if (activeSegment === "Day") {
      prev.setDate(prev.getDate() - 1);
    } else if (activeSegment === "Week") {
      prev.setDate(prev.getDate() - 7);
    } else if (activeSegment === "Month") {
      prev.setMonth(prev.getMonth() - 1);
    }
    setCurrentDate(prev);
  };

  const handleToday = () => {
    setCurrentDate(new Date("2024-10-24"));
  };

  // Format header dates
  const getHeaderTitle = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (activeSegment === "Day") {
      return currentDate.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { weekday: "long", ...options });
    } else if (activeSegment === "Week") {
      // Find start of week (Monday)
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(start.setDate(diff));
      
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      
      return `${monday.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", options)}`;
    } else {
      return currentDate.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { month: "long", year: "numeric" });
    }
  };

  // Date helper formatting YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const currentFormattedDate = formatDateKey(currentDate);

  // Segment Label Map
  const getSegmentName = (seg: "Day" | "Week" | "Month") => {
    if (seg === "Day") return t("dbDayView");
    if (seg === "Week") return t("dbWeekView");
    return t("dbMonthView");
  };

  return (
    <div className="flex-grow flex flex-col p-6 gap-6 overflow-hidden">
      
      {/* Calendar Navigation and View Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="font-display font-extrabold text-[11px] text-on-surface-variant/80 uppercase tracking-widest mb-1">
            {t("dbTitle")} ({getSegmentName(activeSegment)})
          </h2>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-surface-variant/50 rounded-full cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-on-surface" />
            </button>
            <span className="font-sans font-black text-lg tracking-tight text-on-surface">{getHeaderTitle()}</span>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-surface-variant/50 rounded-full cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-on-surface" />
            </button>
            <button
              onClick={handleToday}
              className="ml-4 px-4 py-1.5 border border-outline-variant rounded-full text-xs font-semibold hover:bg-surface-variant/50 cursor-pointer transition-colors text-on-surface"
            >
              {t("dbTodayBtn")}
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          {activeSegment === "Week" && (
            <div className="relative">
              {/* Trigger Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 bg-white border border-outline-variant/60 rounded-xl px-3.5 py-2 text-xs font-bold text-on-surface hover:border-primary/40 transition-colors shadow-2xs cursor-pointer select-none"
              >
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span>
                  {t("dbFilterRoom")}{" "}
                  <span className="text-primary font-black ml-1">
                    {selectedFilterRoomId === "all"
                      ? t("dbAllRooms")
                      : `Room ${selectedFilterRoomId}`}
                  </span>
                </span>
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200" style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'none' }}>
                  keyboard_arrow_down
                </span>
              </button>

              {/* Popover List Options */}
              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    {/* Click outside target */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFilterOpen(false)}
                    />
                    
                    <motion.ul
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1.5 w-52 bg-white border border-outline-variant rounded-2xl shadow-lg z-50 p-1 divide-y divide-outline-variant/20 overflow-hidden font-sans"
                    >
                      <li>
                        <button
                          onClick={() => {
                            setSelectedFilterRoomId("all");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedFilterRoomId === "all"
                              ? "bg-primary/5 text-primary"
                              : "text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          {t("dbAllRooms")}
                        </button>
                      </li>

                      {rooms.map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => {
                              setSelectedFilterRoomId(r.id);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              selectedFilterRoomId === r.id
                                ? "bg-primary/5 text-primary"
                                : "text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            <span>Room {r.id}</span>
                            <span className="text-[10px] text-on-surface-variant font-medium truncate max-w-[100px]">
                              {r.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex p-1 bg-surface-container-high rounded-xl border border-outline-variant/30">
            {(["Day", "Week", "Month"] as const).map((segment) => (
              <button
                key={segment}
                onClick={() => {
                  setActiveSegment(segment);
                  setSelectedFilterRoomId("all");
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeSegment === segment
                    ? "bg-white text-primary shadow-xs"
                    : "text-on-surface-variant/80 hover:text-primary"
                }`}
              >
                {getSegmentName(segment)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Schedule Container Board */}
      <div className="flex-grow flex flex-col bg-white rounded-2xl shadow-[0px_4px_25px_rgba(0,0,0,0.03)] border border-outline-variant/80 overflow-hidden min-h-[400px]">
        
        {/* DAY VIEW RENDER */}
        {activeSegment === "Day" && (
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Header Columns: Rooms list */}
            <div className="flex border-b border-outline-variant bg-surface-container-low select-none">
              <div className="w-20 md:w-24 shrink-0 border-r border-outline-variant/85 flex items-center justify-center p-3">
                <span className="font-mono text-[11px] font-bold text-on-surface-variant/80">{t("dbTime")}</span>
              </div>
              
              <div className="flex-grow grid grid-cols-4 md:grid-cols-8 divide-x divide-outline-variant/85">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className="p-3 text-center cursor-pointer hover:bg-surface-variant/20 transition-all group min-w-0"
                  >
                    <span className="block font-display font-black text-sm text-primary group-hover:scale-105 transition-transform">
                      Room {room.id}
                    </span>
                    <span className="text-[10px] font-semibold text-on-surface-variant truncate block max-w-full">
                      {room.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable grid area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar relative bg-background">
              <div className="flex relative min-h-full">
                
                {/* Time Labels */}
                <div className="w-20 md:w-24 shrink-0 border-r border-outline-variant bg-surface-container-low/20 divide-y divide-transparent select-none">
                  {hours.map((hour) => (
                    <div key={hour} className="h-[60px] flex items-start justify-end pr-3.5 pt-1.5 font-mono text-[11px] font-bold text-on-surface-variant/80">
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>

                {/* Matrix Rooms mapping */}
                <div className="flex-grow grid grid-cols-4 md:grid-cols-8 divide-x divide-outline-variant/70 relative">
                  
                  {/* Background lines */}
                  <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col">
                    {hours.map((hour) => (
                      <div key={hour} className="h-[60px] border-b border-outline-variant/50 w-full" />
                    ))}
                  </div>

                  {rooms.map((room) => {
                    const dayBookings = bookings.filter(
                      (b) => b.roomId === room.id && b.date === currentFormattedDate && b.status === "CONFIRMED"
                    );

                    return (
                      <div key={room.id} className="relative h-full group/col min-w-0">
                        {/* Empty Time click targets */}
                        {hours.slice(0, -1).map((hour) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                          return (
                            <div
                              key={hour}
                              onClick={() => onInstantBook(room.id, timeStr)}
                              className="h-[60px] w-full hover:bg-primary-container/10 transition-colors cursor-pointer relative group/cell"
                              title={`${t("dbBookTitle")} ${room.name} ${t("dbTime")} ${timeStr}`}
                            >
                              <div className="absolute inset-0.5 border border-dashed border-transparent hover:border-primary-container/30 rounded-lg pointer-events-none transition-all flex items-center justify-center">
                                <span className="opacity-0 group-hover/cell:opacity-100 font-mono text-[8px] text-primary font-bold">{t("dbBook")}</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Booking blocks */}
                        {dayBookings.map((b) => {
                          const { top, height } = calculatePosition(b.startTime, b.endTime);
                          return (
                            <motion.div
                              key={b.id}
                              layoutId={`card-day-${b.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRoomSelect(room);
                              }}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              className={`absolute left-1 right-1 ${getRoomColorClasses(b.roomId, "card")} rounded-xl p-2 shadow-xs flex flex-col justify-between border-l-4 transition-all hover:brightness-[0.98] cursor-pointer overflow-hidden z-10`}
                            >
                              <div className="overflow-hidden">
                                <p className="font-display font-black text-[12px] leading-tight truncate">{b.title}</p>
                                <p className="text-[10px] text-on-primary-container/85 truncate">{b.organizer}</p>
                              </div>
                              <span className="font-mono text-[10px] font-bold leading-none">{b.startTime}-{b.endTime}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW RENDER */}
        {activeSegment === "Week" && (
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Header Columns: 7 Days of the week */}
            <div className="flex border-b border-outline-variant bg-surface-container-low select-none">
              <div className="w-20 md:w-24 shrink-0 border-r border-outline-variant/85 flex items-center justify-center p-3">
                <span className="font-mono text-[11px] font-bold text-on-surface-variant/80">{t("dbTime")}</span>
              </div>
              
              <div className="flex-grow grid grid-cols-7 divide-x divide-outline-variant/85">
                {Array.from({ length: 7 }).map((_, idx) => {
                  // Find day relative to Monday
                  const start = new Date(currentDate);
                  const day = start.getDay();
                  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                  const mon = new Date(start.setDate(diff));
                  mon.setDate(mon.getDate() + idx);

                  const isToday = formatDateKey(mon) === formatDateKey(new Date("2024-10-24"));

                  return (
                    <div key={idx} className={`p-2.5 text-center min-w-0 ${isToday ? "bg-primary/5" : ""}`}>
                      <span className={`block text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-primary font-black" : "text-on-surface-variant"}`}>
                        {mon.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { weekday: "short" })}
                      </span>
                      <span className={`block font-display text-[15px] font-black mt-0.5 ${isToday ? "text-primary" : "text-on-surface"}`}>
                        {mon.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar relative bg-background">
              <div className="flex relative min-h-full">
                
                {/* Time Labels */}
                <div className="w-20 md:w-24 shrink-0 border-r border-outline-variant bg-surface-container-low/20 divide-y divide-transparent select-none">
                  {hours.map((hour) => (
                    <div key={hour} className="h-[60px] flex items-start justify-end pr-3.5 pt-1.5 font-mono text-[11px] font-bold text-on-surface-variant/80">
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>

                {/* Matrix days mapping */}
                <div className="flex-grow grid grid-cols-7 divide-x divide-outline-variant/70 relative">
                  
                  {/* Background horizontal lines */}
                  <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col">
                    {hours.map((hour) => (
                      <div key={hour} className="h-[60px] border-b border-outline-variant/50 w-full" />
                    ))}
                  </div>

                  {Array.from({ length: 7 }).map((_, idx) => {
                    const start = new Date(currentDate);
                    const day = start.getDay();
                    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                    const cellDate = new Date(start.setDate(diff));
                    cellDate.setDate(cellDate.getDate() + idx);
                    const cellFormattedDate = formatDateKey(cellDate);

                    // Filter bookings for this day and matching filter options
                    const cellBookings = bookings.filter((b) => {
                      const dateMatches = b.date === cellFormattedDate;
                      const statusMatches = b.status === "CONFIRMED";
                      const roomMatches = selectedFilterRoomId === "all" || b.roomId === selectedFilterRoomId;
                      return dateMatches && statusMatches && roomMatches;
                    });

                    return (
                      <div key={idx} className="relative h-full group/col min-w-0">
                        {/* Empty Time Click slot */}
                        {hours.slice(0, -1).map((hour) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                          return (
                            <div
                              key={hour}
                              onClick={() => {
                                const targetRoomId = selectedFilterRoomId === "all" ? (rooms[0]?.id || "101") : selectedFilterRoomId;
                                onInstantBook(targetRoomId, timeStr);
                              }}
                              className="h-[60px] w-full hover:bg-primary-container/10 transition-colors cursor-pointer relative group/cell"
                              title={t("dbBookTitle")}
                            >
                              <div className="absolute inset-0.5 border border-dashed border-transparent hover:border-primary-container/30 rounded-lg pointer-events-none transition-all flex items-center justify-center">
                                <span className="opacity-0 group-hover/cell:opacity-100 text-[8px] font-bold text-primary">{t("dbBook")}</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Render week event block cards */}
                        {cellBookings.map((b) => {
                          const { top, height } = calculatePosition(b.startTime, b.endTime);
                          const associatedRoom = rooms.find((r) => r.id === b.roomId);

                          return (
                            <motion.div
                              key={b.id}
                              layoutId={`card-week-${b.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (associatedRoom) onRoomSelect(associatedRoom);
                              }}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              className={`absolute left-1 right-1 ${getRoomColorClasses(b.roomId, "card")} rounded-xl p-2.5 shadow-xs flex flex-col justify-between border-l-4 transition-all hover:brightness-[0.98] cursor-pointer overflow-hidden z-10`}
                            >
                              <div className="overflow-hidden">
                                <p className="font-display font-black text-[12px] leading-tight truncate">{b.title}</p>
                                <p className="text-[10px] opacity-90 truncate mt-0.5">Room {b.roomId}</p>
                              </div>
                              <span className="font-mono text-[10px] font-bold leading-none">{b.startTime}-{b.endTime}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW RENDER */}
        {activeSegment === "Month" && (
          <div className="flex-grow flex flex-col overflow-hidden bg-background">
            {/* Days grid headers Mon - Sun */}
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low select-none text-center p-3.5">
              {(lang === "th" ? ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((dayName) => (
                <span key={dayName} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {dayName}
                </span>
              ))}
            </div>

            {/* Grid 35/42 days representation */}
            <div className="flex-grow grid grid-cols-7 grid-rows-5 divide-x divide-y divide-outline-variant/60 bg-white overflow-y-auto custom-scrollbar">
              {(() => {
                // Calculate calendar layout
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                const firstDayOfMonth = new Date(year, month, 1);
                // Adjust first day (Monday as starting element index)
                const startOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

                const calendarCells: React.ReactNode[] = [];

                for (let cellIdx = 0; cellIdx < 35; cellIdx++) {
                  const cellDate = new Date(year, month, 1 - startOffset + cellIdx);
                  const cellFormattedDate = formatDateKey(cellDate);
                  const isCurrentMonth = cellDate.getMonth() === month;
                  const isToday = cellFormattedDate === formatDateKey(new Date("2024-10-24"));

                  // Bookings happening on this calendar date
                  const cellBookings = bookings.filter((b) => b.date === cellFormattedDate && b.status === "CONFIRMED");

                  calendarCells.push(
                    <div
                      key={cellIdx}
                      className={`min-h-[90px] p-2 flex flex-col justify-between hover:bg-background/40 transition-colors ${
                        isCurrentMonth ? "bg-white" : "bg-surface-container-low/10 text-on-surface-variant/40"
                      } ${isToday ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-between items-center select-none">
                        <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                          isToday ? "bg-primary text-white font-black" : "text-on-surface"
                        }`}>
                          {cellDate.getDate()}
                        </span>
                        {cellBookings.length > 0 && (
                          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                            {cellBookings.length} {t("dbMore")}
                          </span>
                        )}
                      </div>

                      {/* Display small items */}
                      <div className="flex-grow mt-1.5 space-y-1 overflow-y-auto custom-scrollbar max-h-[64px]">
                        {cellBookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              const r = rooms.find((rm) => rm.id === b.roomId);
                              if (r) onRoomSelect(r);
                            }}
                            className={`px-1.5 py-0.5 rounded-sm border-l-2 text-[11px] font-bold truncate cursor-pointer select-none ${getRoomColorClasses(b.roomId, "pill")}`}
                            title={`${b.title} (Room ${b.roomId} | ${b.startTime}-${b.endTime})`}
                          >
                            {b.startTime} • {b.title}
                          </div>
                        ))}
                        {cellBookings.length > 3 && (
                          <div className="text-[10px] text-center font-bold text-on-surface-variant">+ {cellBookings.length - 3} {t("dbMore")}</div>
                        )}
                      </div>
                    </div>
                  );
                }

                return calendarCells;
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4 border border-outline-variant/30">
          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("dbOccupancyRate")}</p>
            <p className="font-display font-black text-lg text-primary">74.2%</p>
          </div>
        </div>

        <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4 border border-outline-variant/30">
          <div className="w-11 h-11 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("dbAvgDuration")}</p>
            <p className="font-display font-black text-lg text-secondary">45m</p>
          </div>
        </div>

        <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4 border border-outline-variant/30">
          <div className="w-11 h-11 rounded-full bg-orange-600/15 flex items-center justify-center text-orange-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("dbActiveUsers")}</p>
            <p className="font-display font-black text-lg text-orange-700">128</p>
          </div>
        </div>

        <div className="p-4 bg-surface-container rounded-2xl flex items-center gap-4 border border-outline-variant/30">
          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{t("dbMostPopular")}</p>
            <p className="font-display font-black text-lg text-primary">Room 301</p>
          </div>
        </div>
      </div>

    </div>
  );
}
