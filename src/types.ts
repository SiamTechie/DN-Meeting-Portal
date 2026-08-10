export interface Attendee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export type UserRole = "Admin" | "Member" | "Executive" | "Guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export type BuildingId = "dn-center" | "health-up";

export interface BuildingTheme {
  primary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
}

export interface Building {
  id: BuildingId;
  nameTh: string;
  nameEn: string;
  shortNameTh: string;
  shortNameEn: string;
  logoUrl: string;
  theme: BuildingTheme;
}

export interface Room {
  id: string; // e.g. "DN-101", "HU-101"
  buildingId: BuildingId;
  name: string; // e.g. "Conference A"
  type: string; // e.g. "Executive", "Huddle Room", "Boardroom"
  capacity: number;
  floor: number;
  sqft: number;
  tier: "Standard" | "Premium" | "Elite Tier";
  image: string;
  equipment: string[]; // e.g. ["High-speed Wifi", "4K Display", "Video Conference System", "Coffee Machine"]
  location: string;
  status?: "ACTIVE" | "MAINTENANCE"; // Defaults to "ACTIVE" when missing. "MAINTENANCE" closes the room from booking.
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  organizer: string;
  organizerAvatar?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  attendees: Attendee[];
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  meetingType: "ON-SITE" | "ONLINE";
  onlinePlatform?: "Zoom" | "Microsoft Teams" | "Google Meet" | "Other";
  onlineLink?: string;
  onlineId?: string;
  createdAt?: string;
  notes?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type ViewTab = "dashboard" | "room-list" | "my-bookings" | "admin" | "kiosk" | "room-detail" | "booking-form" | "user-manual";
