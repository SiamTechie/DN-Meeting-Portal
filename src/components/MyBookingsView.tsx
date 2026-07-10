import React from "react";
import { Booking, Room } from "../types";
import { Calendar, Clock, Trash2, ShieldAlert, ArrowRight, Video, MapPin, ExternalLink } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface MyBookingsViewProps {
  bookings: Booking[];
  rooms: Room[];
  onCancelBooking: (bookingId: string) => void;
  onRoomSelect: (roomId: string) => void;
  lang: Language;
}

export default function MyBookingsView({ bookings, rooms, onCancelBooking, onRoomSelect, lang }: MyBookingsViewProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  // Filter bookings where Alex Morgan is either the organizer or an attendee
  const myReservations = bookings.filter(
    (b) => b.organizer === "Alex Morgan" || b.attendees.some((a) => a.name === "Alex Morgan")
  );

  const getRoomName = (roomId: string) => {
    const r = rooms.find((room) => room.id === roomId);
    return r ? r.name : `Room ${roomId}`;
  };

  const getRoomImage = (roomId: string) => {
    const r = rooms.find((room) => room.id === roomId);
    return r ? r.image : "";
  };

  return (
    <div className="flex-grow flex flex-col p-6 overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-primary mb-1">{t("mbTitle")}</h2>
          <p className="font-sans text-xs text-on-surface-variant/90">
            {t("mbSub")}
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {myReservations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white rounded-2xl border border-dashed border-outline-variant/80 p-8"
              >
                <ShieldAlert className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                <p className="text-sm font-semibold text-on-surface-variant">{t("mbNoReservations")}</p>
                <p className="text-xs text-on-surface-variant/70 mt-1">{t("mbStartBooking")}</p>
              </motion.div>
            ) : (
              myReservations.map((booking) => {
                const roomImage = getRoomImage(booking.roomId);
                const roomName = getRoomName(booking.roomId);
                
                return (
                  <motion.div
                    key={booking.id}
                    layoutId={`card-${booking.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 rounded-2xl border border-outline-variant/60 flex flex-col sm:flex-row gap-5 items-center justify-between shadow-[0px_4px_15px_rgba(0,0,0,0.01)] hover:border-primary/20 transition-all group"
                  >
                    {/* Left details & Thumbnail */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                      <div
                        onClick={() => onRoomSelect(booking.roomId)}
                        className="w-full sm:w-24 h-24 sm:h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 cursor-pointer relative"
                      >
                        {roomImage && (
                          <img
                            src={roomImage}
                            alt={roomName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-bold text-white font-mono uppercase">
                          {booking.roomId}
                        </div>
                      </div>

                      <div className="text-center sm:text-left overflow-hidden">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-1">
                          <h4
                            onClick={() => onRoomSelect(booking.roomId)}
                            className="font-display font-black text-md text-on-surface hover:text-primary cursor-pointer leading-tight truncate"
                          >
                            {booking.title}
                          </h4>
                          
                          {/* Dynamic status badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </span>

                          {/* Meeting type badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${
                              booking.meetingType === "ONLINE"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {booking.meetingType === "ONLINE" ? (
                              <>
                                <Video className="w-2.5 h-2.5" />
                                {t("bfOnline")} ({booking.onlinePlatform})
                              </>
                            ) : (
                              <>
                                <MapPin className="w-2.5 h-2.5" />
                                {t("bfOnSite")}
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-on-surface-variant/90 flex items-center justify-center sm:justify-start gap-1">
                          <span className="font-bold text-primary">{roomName}</span>
                          <span>• {t("mbOrganizedBy")} {booking.organizer}</span>
                        </p>

                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-[11px] text-on-surface-variant/95 font-medium">
                          <div className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-secondary" />
                            <span>
                              {(() => {
                                const parts = booking.date.split("-");
                                if (parts.length === 3) {
                                  const year = parts[0];
                                  const month = parseInt(parts[1], 10);
                                  const day = parseInt(parts[2], 10);
                                  return `${day}/${month}/${year}`;
                                }
                                return booking.date;
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-secondary" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          {booking.meetingType === "ONLINE" && booking.onlineId && (
                            <div className="text-[10px] text-on-surface-variant shrink-0 font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant/40">
                              ID: {booking.onlineId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Panel Right */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      {booking.meetingType === "ONLINE" && booking.onlineLink && (
                        <a
                          href={booking.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-grow sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t("mbJoinBtn")} {booking.onlinePlatform}
                        </a>
                      )}

                      <button
                        onClick={() => onRoomSelect(booking.roomId)}
                        className="flex-grow sm:flex-none border border-outline-variant hover:bg-surface-variant/30 text-on-surface-variant/90 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        {t("mbDetailsBtn")}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onCancelBooking(booking.id)}
                        className="flex-grow sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("mbCancelBtn")}
                      </button>
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
