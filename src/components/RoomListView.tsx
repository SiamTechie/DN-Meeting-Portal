import React, { useState } from "react";
import { Room } from "../types";
import { Users, Wifi, Tv, Video, Edit3, ArrowRight } from "lucide-react";
import { Language, translations } from "../locales";
import { motion } from "motion/react";

interface RoomListViewProps {
  rooms: Room[];
  searchQuery: string;
  onRoomSelect: (room: Room) => void;
  onQuickBook: (room: Room) => void;
  lang: Language;
}

type FloorFilter = "All Rooms" | "Floor 1" | "Floor 2" | "Floor 3";

export default function RoomListView({ rooms, searchQuery, onRoomSelect, onQuickBook, lang }: RoomListViewProps) {
  const [activeFloor, setActiveFloor] = useState<FloorFilter>("All Rooms");
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Filters
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFloor =
      activeFloor === "All Rooms" ||
      (activeFloor === "Floor 1" && room.floor === 1) ||
      (activeFloor === "Floor 2" && room.floor === 2) ||
      (activeFloor === "Floor 3" && room.floor === 3);

    return matchesSearch && matchesFloor;
  });

  // Group by floor for header categories
  const floors = Array.from(new Set(filteredRooms.map((r) => r.floor))).sort();

  // Helper to render equipment icons
  const getEquipmentIcon = (eq: string) => {
    const eqLower = eq.toLowerCase();
    if (eqLower.includes("wifi")) return <Wifi className="w-4 h-4 text-secondary shrink-0" title="Wifi" />;
    if (eqLower.includes("display") || eqLower.includes("tv") || eqLower.includes("panel"))
      return <Tv className="w-4 h-4 text-secondary shrink-0" title="4K Screen" />;
    if (eqLower.includes("video") || eqLower.includes("camera") || eqLower.includes("conference"))
      return <Video className="w-4 h-4 text-secondary shrink-0" title="Video Conferencing" />;
    if (eqLower.includes("whiteboard") || eqLower.includes("draw"))
      return <Edit3 className="w-4 h-4 text-secondary shrink-0" title="Whiteboard" />;
    return null;
  };

  const getFloorLabel = (floor: FloorFilter) => {
    if (floor === "All Rooms") return t("rlAllRooms");
    if (floor === "Floor 1") return t("rlFloor1");
    if (floor === "Floor 2") return t("rlFloor2");
    return t("rlFloor3");
  };

  return (
    <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar">
      {/* Floor Filter Tabs Subheader */}
      <div className="bg-white/60 backdrop-blur-md px-8 py-3.5 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 z-20 select-none">
        <div className="text-xs font-semibold text-on-surface-variant max-w-[200px] truncate md:max-w-none">
          {t("rlSub")}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30 shrink-0">
          {(["All Rooms", "Floor 1", "Floor 2", "Floor 3"] as FloorFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFloor(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeFloor === tab
                  ? "bg-white text-primary shadow-xs"
                  : "text-on-surface-variant/80 hover:text-primary"
              }`}
            >
              {getFloorLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-outline-variant/80 p-8 select-none">
            <p className="text-sm font-semibold text-on-surface-variant">{t("rlNoRooms")}</p>
            <button
              onClick={() => {
                setActiveFloor("All Rooms");
              }}
              className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-primary-container"
            >
              {t("rlReset")}
            </button>
          </div>
        ) : (
          floors.map((floorNum) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floorNum);
            return (
              <section key={floorNum} className="space-y-6">
                {/* Floor Section Header */}
                <div className="flex items-center gap-4 select-none">
                  <span className="h-px flex-grow bg-outline-variant/50"></span>
                  <h3 className="font-display font-black text-md text-on-surface-variant uppercase tracking-widest bg-background px-4">
                    {t("rlFloor")} {floorNum}
                  </h3>
                  <span className="h-px flex-grow bg-outline-variant/50"></span>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {floorRooms.map((room) => (
                    <motion.div
                      layoutId={`room-card-${room.id}`}
                      key={room.id}
                      className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.02)] group hover:border-primary/30 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Card Thumbnail Image */}
                      <div
                        onClick={() => onRoomSelect(room)}
                        className="h-48 w-full relative overflow-hidden bg-surface-container cursor-pointer"
                      >
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-primary/95 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
                          {t("rlFloor")} {room.floor}
                        </div>
                      </div>

                      {/* Content Card Info */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div className="select-all">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary px-2 py-0.5 rounded-md bg-secondary/10">
                              {room.type}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                              {room.tier}
                            </span>
                          </div>
                          
                          <h4 className="font-display font-black text-base text-on-surface leading-tight mb-1">
                            {room.name}
                          </h4>
                          
                          <p className="text-[11px] font-semibold text-on-surface-variant/80 truncate">
                            {room.location.split("•")[0].trim()}
                          </p>
                        </div>

                        {/* Room capabilities & Equipment bar */}
                        <div className="mt-5 pt-4 border-t border-outline-variant/40 flex items-center justify-between gap-4 select-none">
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <Users className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-sans font-bold text-xs">
                              {room.capacity} {t("rlCapacity")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {room.equipment.map((eq, idx) => (
                              <React.Fragment key={idx}>{getEquipmentIcon(eq)}</React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => onQuickBook(room)}
                          className="bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {t("rlQuickBook")}
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => onRoomSelect(room)}
                          className="border border-outline-variant hover:bg-surface-variant/30 text-on-surface-variant/90 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          {t("rlDetails")}
                        </button>
                      </div>

                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
