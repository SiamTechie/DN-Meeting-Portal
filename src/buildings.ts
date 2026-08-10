import { Building, BuildingId } from "./types";

// Static config for each building: branding + theme colors.
// Kept in code (not Firestore) since these values are known at build time
// and switching themes should not require a network round-trip.
export const BUILDINGS: Record<BuildingId, Building> = {
  "dn-center": {
    id: "dn-center",
    nameTh: "DN Center",
    nameEn: "DN Center",
    shortNameTh: "DN",
    shortNameEn: "DN",
    logoUrl: "https://pub-5757654995004eb79b9d11eb37976c88.r2.dev/logo-DN.jpg",
    theme: {
      primary: "#6310a3",
      primaryContainer: "#f3e8ff",
      onPrimaryContainer: "#2c004d",
      secondary: "#a884c4",
      secondaryContainer: "#faf5ff",
      onSecondaryContainer: "#6310a3",
    },
  },
  "health-up": {
    id: "health-up",
    nameTh: "Health Up",
    nameEn: "Health Up",
    shortNameTh: "HU",
    shortNameEn: "HU",
    logoUrl: "https://maintain.healthup.co.th/assets/logo-BCpIkKu2.png",
    theme: {
      primary: "#F26924",
      primaryContainer: "#FDEBE4",
      onPrimaryContainer: "#7A2E0C",
      secondary: "#17B69F",
      secondaryContainer: "#E6FAF6",
      onSecondaryContainer: "#0B4F45",
    },
  },
};

export const BUILDING_LIST: Building[] = Object.values(BUILDINGS);

export const DEFAULT_BUILDING_ID: BuildingId = "dn-center";
