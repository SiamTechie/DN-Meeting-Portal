import React, { useState, useEffect } from "react";
import { Room, Booking, BuildingId } from "../types";
import { ChevronLeft, ChevronRight, Filter, TrendingUp, Users, Clock, Flame, CalendarRange, MapPin, Wrench } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface DashboardViewProps {
  rooms: Room[];
  bookings: Booking[];
  onRoomSelect: (room: Room) => void;
  onInstantBook: (roomId: string, startTime: string) => void;
  lang: Language;
  selectedBuilding: BuildingId;
}

export default function DashboardView({ rooms, bookings, onRoomSelect, onInstantBook, lang, selectedBuilding }: DashboardViewProps) {
  // Scope everything on this page to the currently selected building so
  // room colors/legend/schedules never mix companies together.
  const buildingRooms = rooms.filter((r) => r.buildingId === selectedBuilding);
  const buildingRoomIds = new Set(buildingRooms.map((r) => r.id));
  const buildingBookings = bookings.filter((b) => buildingRoomIds.has(b.roomId));
  // Base date for navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeSegment, setActiveSegment] = useState<"Day" | "Week" | "Month">("Week");

  // Tooltip state
  const [hoveredBooking, setHoveredBooking] = useState<{ booking: Booking, x: number, y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent, booking: Booking) => {
    setHoveredBooking({ booking, x: e.clientX + 15, y: e.clientY + 15 });
  };
  
  const handleMouseLeave = () => {
    setHoveredBooking(null);
  };
  
  // Real time tracker for the red line indicator
  const [realNow, setRealNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setRealNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filtering for Week View
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

  // Resolve overlapping blocks
  const calculateOverlaps = (bookingsList: Booking[]) => {
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };
    
    const sorted = [...bookingsList].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    const columns: Booking[][] = [];
    const result = new Map<string, { left: string, width: string }>();
    let lastEventEnding: number | null = null;

    const packGroup = () => {
      if (columns.length > 0) {
        const numCols = columns.length;
        columns.forEach((col, colIndex) => {
          col.forEach(event => {
            result.set(event.id, {
              left: `calc(${(colIndex / numCols) * 100}% + 2px)`,
              width: `calc(${(1 / numCols) * 100}% - 4px)`
            });
          });
        });
        columns.length = 0;
      }
    };

    sorted.forEach((b) => {
      const start = parseTime(b.startTime);
      const end = parseTime(b.endTime);

      if (lastEventEnding !== null && start >= lastEventEnding) {
        packGroup();
      }
      
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastInCol = col[col.length - 1];
        if (parseTime(lastInCol.endTime) <= start) {
          col.push(b);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([b]);
      }
      lastEventEnding = lastEventEnding === null ? end : Math.max(lastEventEnding, end);
    });

    packGroup();
    return result;
  };

  const ROOM_PALETTES = [
    { card: "bg-blue-50 text-blue-900 border-blue-200", pill: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
    { card: "bg-emerald-50 text-emerald-900 border-emerald-200", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
    { card: "bg-purple-50 text-purple-900 border-purple-200", pill: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
    { card: "bg-orange-50 text-orange-900 border-orange-200", pill: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
    { card: "bg-rose-50 text-rose-900 border-rose-200", pill: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
  ];

  const getRoomPaletteIndex = (roomId: string) => {
    const idx = buildingRooms.findIndex(r => r.id === roomId);
    return idx >= 0 ? idx % ROOM_PALETTES.length : 0;
  };

  const getRoomColorClasses = (roomId: string, mode: "card" | "pill" | "dot" = "card") => {
    const palette = ROOM_PALETTES[getRoomPaletteIndex(roomId)];
    if (mode === "card") return palette.card;
    if (mode === "pill") return palette.pill;
    return palette.dot;
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
    setCurrentDate(new Date());
  };

  // Format header dates
  const getHeaderTitle = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (activeSegment === "Day") {
      return currentDate.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { weekday: "long", ...options });
    } else if (activeSegment === "Week") {
      const start = new Date(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      return `${start.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", options)}`;
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

  const isRealToday = formatDateKey(currentDate) === formatDateKey(realNow);
  const currentTimeTop = Math.max(0, (realNow.getHours() - 8) * 60 + realNow.getMinutes());
  const shouldShowTimeIndicator = realNow.getHours() >= 8 && realNow.getHours() <= 18;

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
                      : (buildingRooms.find(r => r.id === selectedFilterRoomId)?.name || `Room ${selectedFilterRoomId}`)}
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

                      {buildingRooms.map((r) => (
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

      {/* Room Legend */}
      <div className="flex flex-wrap items-center gap-3 md:gap-5 px-1 py-1">
        {buildingRooms.map((room) => (
          <div key={`legend-${room.id}`} className="flex items-center gap-1.5 cursor-default group">
            <span className={`w-2.5 h-2.5 rounded-full ${getRoomColorClasses(room.id, "dot")} shadow-xs transition-transform group-hover:scale-125`}></span>
            <span className="text-[11px] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors truncate max-w-[120px]">
              {room.name}
            </span>
            {room.status === "MAINTENANCE" && (
              <Wrench className="w-3 h-3 text-orange-500" />
            )}
          </div>
        ))}
      </div>

      {/* Main Schedule Container Board */}
      <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border border-outline-variant/80 overflow-hidden min-h-[400px]">
        
        {/* DAY VIEW RENDER */}
        {activeSegment === "Day" && (
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Header Columns: Rooms list */}
            <div className="flex border-b border-outline-variant bg-surface-container-low select-none">
              <div className="w-20 md:w-24 shrink-0 border-r border-outline-variant/85 flex items-center justify-center p-3">
                <span className="font-mono text-[11px] font-bold text-on-surface-variant/80">{t("dbTime")}</span>
              </div>
              
              <div className="flex-grow grid grid-cols-4 md:grid-cols-8 divide-x divide-outline-variant/85">
                {buildingRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className="p-3 text-center cursor-pointer hover:bg-surface-variant/20 transition-all group min-w-0"
                  >
                    <span className="flex items-center justify-center gap-1 font-display font-black text-[13px] text-primary group-hover:scale-105 transition-transform truncate px-1">
                      {room.name}
                      {room.status === "MAINTENANCE" && <Wrench className="w-3 h-3 text-orange-500 shrink-0" />}
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

                  {/* Current Time Indicator for Day View */}
                  {isRealToday && shouldShowTimeIndicator && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${currentTimeTop}px` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                      <div className="flex-grow border-t-2 border-red-500"></div>
                    </div>
                  )}

                  {buildingRooms.map((room) => {
                    const dayBookings = buildingBookings.filter(
                      (b) => b.roomId === room.id && b.date === currentFormattedDate && b.status === "CONFIRMED"
                    );

                    const isRoomClosed = room.status === "MAINTENANCE";

                    return (
                      <div key={room.id} className="relative h-full group/col min-w-0">
                        {/* Empty Time click targets */}
                        {!isRoomClosed && hours.slice(0, -1).map((hour) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                          return (
                            <button
                              key={hour}
                              onClick={() => onInstantBook(room.id, timeStr)}
                              className="h-[60px] w-full hover:bg-primary/5 transition-colors cursor-pointer relative group/cell block text-left focus:outline-none focus:bg-primary/10"
                              aria-label={`${t("dbBookTitle")} ${room.name} ${t("dbTime")} ${timeStr}`}
                            >
                              <div className="absolute inset-0.5 border border-dashed border-transparent hover:border-primary/30 rounded-lg pointer-events-none transition-all flex items-center justify-center">
                                <span className="opacity-0 group-hover/cell:opacity-100 font-mono text-[8px] text-primary font-bold">{t("dbBook")}</span>
                              </div>
                            </button>
                          );
                        })}

                        {isRoomClosed && (
                          <div className="absolute inset-0 bg-orange-50/40 flex items-center justify-center pointer-events-none z-[5]">
                            <span className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wider [writing-mode:vertical-rl]">
                              {t("adMaintenanceBadge")}
                            </span>
                          </div>
                        )}

                        {/* Booking blocks */}
                        {(() => {
                          const overlaps = calculateOverlaps(dayBookings);
                          return dayBookings.map((b) => {
                            const { top, height } = calculatePosition(b.startTime, b.endTime);
                            const pos = overlaps.get(b.id) || { left: "2px", width: "calc(100% - 4px)" };
                            return (
                              <motion.div
                                key={b.id}
                                layoutId={`card-day-${b.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoomSelect(room);
                                }}
                                onMouseMove={(e) => handleMouseMove(e, b)}
                                onMouseLeave={handleMouseLeave}
                                style={{ top: `${top}px`, height: `${height}px`, left: pos.left, width: pos.width }}
                                className={`absolute ${getRoomColorClasses(b.roomId, "card")} rounded-xl p-2 shadow-sm flex flex-col justify-between border transition-all hover:shadow-md cursor-pointer overflow-hidden z-10`}
                              >
                                <div className="overflow-hidden">
                                  <p className="font-display font-black text-[12px] leading-tight truncate">{b.title}</p>
                                  <p className="text-[10px] text-on-primary-container/85 truncate">{b.organizer}</p>
                                </div>
                                <span className="font-mono text-[10px] font-bold leading-none">{b.startTime}-{b.endTime}</span>
                              </motion.div>
                            );
                          });
                        })()}
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
                  const mon = new Date(currentDate);
                  mon.setDate(mon.getDate() + idx);

                  const isToday = formatDateKey(mon) === formatDateKey(realNow);

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
                    const cellDate = new Date(currentDate);
                    cellDate.setDate(cellDate.getDate() + idx);
                    const cellFormattedDate = formatDateKey(cellDate);
                    const isThisCellRealToday = cellFormattedDate === formatDateKey(realNow);

                    // Filter bookings for this day and matching filter options
                    const cellBookings = buildingBookings.filter((b) => {
                      const dateMatches = b.date === cellFormattedDate;
                      const statusMatches = b.status === "CONFIRMED";
                      const roomMatches = selectedFilterRoomId === "all" || b.roomId === selectedFilterRoomId;
                      return dateMatches && statusMatches && roomMatches;
                    });

                    return (
                      <div key={idx} className="relative h-full group/col min-w-0">
                        {/* Current Time Indicator for Week View */}
                        {isThisCellRealToday && shouldShowTimeIndicator && (
                          <div 
                            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                            style={{ top: `${currentTimeTop}px` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                            <div className="flex-grow border-t-2 border-red-500"></div>
                          </div>
                        )}

                        {/* Empty Time Click slot */}
                        {hours.slice(0, -1).map((hour) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                          const availableRooms = buildingRooms.filter((r) => r.status !== "MAINTENANCE");
                          const filteredRoom = selectedFilterRoomId !== "all" ? buildingRooms.find((r) => r.id === selectedFilterRoomId) : undefined;
                          const isSlotDisabled = selectedFilterRoomId !== "all" && filteredRoom?.status === "MAINTENANCE";
                          return (
                            <button
                              key={hour}
                              disabled={isSlotDisabled}
                              onClick={() => {
                                const targetRoomId = selectedFilterRoomId === "all" ? (availableRooms[0]?.id || buildingRooms[0]?.id || "101") : selectedFilterRoomId;
                                onInstantBook(targetRoomId, timeStr);
                              }}
                              className="h-[60px] w-full hover:bg-primary/5 transition-colors cursor-pointer relative group/cell block text-left focus:outline-none focus:bg-primary/10 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              aria-label={t("dbBookTitle")}
                            >
                              <div className="absolute inset-0.5 border border-dashed border-transparent hover:border-primary/30 rounded-lg pointer-events-none transition-all flex items-center justify-center">
                                <span className="opacity-0 group-hover/cell:opacity-100 text-[8px] font-bold text-primary">{t("dbBook")}</span>
                              </div>
                            </button>
                          );
                        })}

                        {/* Render week event block cards */}
                        {(() => {
                          const overlaps = calculateOverlaps(cellBookings);
                          return cellBookings.map((b) => {
                            const { top, height } = calculatePosition(b.startTime, b.endTime);
                            const associatedRoom = buildingRooms.find((r) => r.id === b.roomId);
                            const pos = overlaps.get(b.id) || { left: "2px", width: "calc(100% - 4px)" };

                            return (
                              <motion.div
                                key={b.id}
                                layoutId={`card-week-${b.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (associatedRoom) onRoomSelect(associatedRoom);
                                }}
                                onMouseMove={(e) => handleMouseMove(e, b)}
                                onMouseLeave={handleMouseLeave}
                                style={{ top: `${top}px`, height: `${height}px`, left: pos.left, width: pos.width }}
                                className={`absolute ${getRoomColorClasses(b.roomId, "card")} rounded-xl p-2.5 shadow-sm flex flex-col justify-between border transition-all hover:shadow-md cursor-pointer overflow-hidden z-10`}
                              >
                                <div className="overflow-hidden">
                                  <p className="font-display font-black text-[12px] leading-tight truncate">{b.title}</p>
                                  <p className="text-[10px] opacity-90 truncate mt-0.5">{associatedRoom?.name || `Room ${b.roomId}`}</p>
                                </div>
                                <span className="font-mono text-[10px] font-bold leading-none">{b.startTime}-{b.endTime}</span>
                              </motion.div>
                            );
                          });
                        })()}
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
                  const isToday = cellFormattedDate === formatDateKey(realNow);

                  // Bookings happening on this calendar date
                  const cellBookings = buildingBookings.filter((b) => b.date === cellFormattedDate && b.status === "CONFIRMED");

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
                            onClick={(e) => {
                              e.stopPropagation();
                              const r = buildingRooms.find((rm) => rm.id === b.roomId);
                              if (r) onRoomSelect(r);
                            }}
                            onMouseMove={(e) => handleMouseMove(e, b)}
                            onMouseLeave={handleMouseLeave}
                            className={`px-1.5 py-0.5 rounded-md border text-[11px] font-bold truncate cursor-pointer select-none ${getRoomColorClasses(b.roomId, "pill")}`}
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

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredBooking && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] p-4 rounded-2xl shadow-xl border border-outline-variant pointer-events-none w-64 backdrop-blur-2xl bg-white/95"
            style={{ 
              left: Math.min(hoveredBooking.x, window.innerWidth - 270), 
              top: Math.min(hoveredBooking.y, window.innerHeight - 150)
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider truncate max-w-[150px] ${getRoomColorClasses(hoveredBooking.booking.roomId, "pill")}`}>
                  {buildingRooms.find(r => r.id === hoveredBooking.booking.roomId)?.name || `Room ${hoveredBooking.booking.roomId}`}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant">
                  {hoveredBooking.booking.date}
                </span>
              </div>
              <h3 className="font-display font-black text-sm leading-tight text-on-surface">{hoveredBooking.booking.title}</h3>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-[11px] text-on-surface-variant flex items-center gap-2 font-medium"><Clock className="w-3.5 h-3.5 text-primary"/> {hoveredBooking.booking.startTime} - {hoveredBooking.booking.endTime}</p>
                <p className="text-[11px] text-on-surface-variant flex items-center gap-2 font-medium"><Users className="w-3.5 h-3.5 text-primary"/> {hoveredBooking.booking.organizer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
