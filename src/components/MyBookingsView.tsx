import React, { useState } from "react";
import { Booking, Room, User, BuildingId } from "../types";
import { Calendar, Clock, Trash2, ShieldAlert, ArrowRight, Video, MapPin, ExternalLink, X, AlignLeft, Users } from "lucide-react";
import { Language, translations } from "../locales";
import { motion, AnimatePresence } from "motion/react";

interface MyBookingsViewProps {
  bookings: Booking[];
  rooms: Room[];
  onCancelBooking: (bookingId: string) => void;
  onRoomSelect: (roomId: string) => void;
  lang: Language;
  currentUser: User | null;
  selectedBuilding: BuildingId;
}

export default function MyBookingsView({ bookings, rooms, onCancelBooking, onRoomSelect, lang, currentUser, selectedBuilding }: MyBookingsViewProps) {
  const t = (key: keyof typeof translations.th) => translations[lang][key] || key;

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Bookings page always scopes to the building selected in the sidebar, so
  // bookings from the other company never mix into this list.
  const buildingRoomIds = new Set(rooms.filter((r) => r.buildingId === selectedBuilding).map((r) => r.id));
  const displayBookings = bookings.filter((b) => buildingRoomIds.has(b.roomId));

  const getRoomName = (roomId: string) => {
    const r = rooms.find((room) => room.id === roomId);
    return r ? r.name : `Room ${roomId}`;
  };

  const getRoomImage = (roomId: string) => {
    const r = rooms.find((room) => room.id === roomId);
    return r ? r.image : "";
  };

  // Check if booking is in the past
  const isBookingPast = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.endTime}:00`);
    return bookingDateTime < new Date();
  };

  return (
    <div className="flex-grow flex flex-col p-6 overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-primary mb-1">{t("mbTitle")}</h2>
          <p className="font-sans text-xs text-on-surface-variant/90">
            {t("mbSub")}
          </p>
        </div>

        {displayBookings.length === 0 ? (
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
          <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-[0px_4px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-low border-b border-outline-variant/40">
                  <tr>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      {t("bfMeetingTitle")}
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      ห้องประชุม
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      {t("bfDate")}
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      เวลา
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      ผู้จัด
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      รูปแบบ
                    </th>
                    <th className="text-left py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      สถานะ
                    </th>
                    <th className="text-right py-3 px-4 font-sans text-[10px] font-semibold text-on-surface-variant/90 uppercase tracking-wide">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <AnimatePresence>
                    {displayBookings.map((booking) => {
                      const roomName = getRoomName(booking.roomId);
                      const canEdit = currentUser?.role === "Admin" || currentUser?.name === booking.organizer;
                      const isPast = isBookingPast(booking);

                      return (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-surface-container-low/50 transition-colors group ${
                            isPast ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Meeting Title */}
                          <td className="py-2.5 px-4">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className={`font-display font-normal text-sm hover:text-primary transition-colors text-left ${
                                isPast ? 'text-on-surface-variant/70' : 'text-on-surface'
                              }`}
                            >
                              {booking.title}
                            </button>
                            {booking.attendees && booking.attendees.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-on-surface-variant/60">
                                <Users className="w-2.5 h-2.5" />
                                <span>{booking.attendees.length} คน</span>
                              </div>
                            )}
                          </td>

                          {/* Room */}
                          <td className="py-2.5 px-4">
                            <button
                              onClick={() => onRoomSelect(booking.roomId)}
                              className="font-sans text-xs font-medium text-primary hover:underline"
                            >
                              {roomName}
                            </button>
                          </td>

                          {/* Date */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-normal">
                              <Calendar className="w-3 h-3 text-secondary" />
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
                          </td>

                          {/* Time */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-normal">
                              <Clock className="w-3 h-3 text-secondary" />
                              <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                          </td>

                          {/* Organizer */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {booking.organizerAvatar && (
                                <img
                                  src={booking.organizerAvatar}
                                  alt={booking.organizer}
                                  className="w-5 h-5 rounded-full"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <span className="text-[11px] font-normal text-on-surface-variant">
                                {booking.organizer}
                              </span>
                            </div>
                          </td>

                          {/* Meeting Type */}
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                                booking.meetingType === "ONLINE"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {booking.meetingType === "ONLINE" ? (
                                <>
                                  <Video className="w-2 h-2" />
                                  Online
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-2 h-2" />
                                  On-site
                                </>
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-4">
                            {isPast ? (
                              <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-gray-100 text-gray-600">
                                ผ่านไปแล้ว
                              </span>
                            ) : (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                                  booking.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "CANCELLED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isPast && booking.meetingType === "ONLINE" && booking.onlineLink && (
                                <a
                                  href={booking.onlineLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                                  title="เข้าร่วมประชุม"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}

                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-variant/30 text-on-surface-variant transition-colors"
                                title="ดูรายละเอียด"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {!isPast && canEdit && (
                                <button
                                  onClick={() => {
                                    if (confirm(t("mbConfirmCancel"))) {
                                      onCancelBooking(booking.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="ยกเลิกการจอง"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
                <h3 className="font-display font-black text-lg text-on-surface truncate">
                  {selectedBooking.title}
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">{t("bfDate")}</p>
                    <p className="text-sm font-bold text-on-surface">{selectedBooking.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">เวลา</p>
                    <p className="text-sm font-bold text-on-surface">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-tertiary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">ห้องประชุม</p>
                    <p className="text-sm font-bold text-on-surface hover:text-primary cursor-pointer" onClick={() => {
                        setSelectedBooking(null);
                        onRoomSelect(selectedBooking.roomId);
                    }}>{getRoomName(selectedBooking.roomId)}</p>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="flex items-start gap-3 bg-surface-container/50 p-4 rounded-xl">
                    <AlignLeft className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant mb-1">หมายเหตุ / วาระการประชุม</p>
                      <p className="text-sm text-on-surface whitespace-pre-wrap">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.attendees && selectedBooking.attendees.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-2">{t("mbAttendees")} ({selectedBooking.attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.attendees.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 bg-surface-container py-1 px-2 rounded-full border border-outline-variant/30">
                          <img src={a.avatarUrl} alt={a.name} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-semibold text-on-surface">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
