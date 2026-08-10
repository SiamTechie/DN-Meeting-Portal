import { Room, Booking, Attendee, User } from "./types";

export const ATTENDEES_LIST: Attendee[] = [
  {
    id: "att-1",
    name: "Sarah Johnson",
    email: "sarah.j@dncenter.com",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg"
  },
  {
    id: "att-2",
    name: "David K.",
    email: "david.k@dncenter.com",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC-Nwq_e1PmaHUNQkaGRNVIcPj5eQxrVgdCfK9sT71kXLNZm5XEva8jQLIexPmKgnddz1fXBdqo6Q3bD5JoaS5ifAElfGtq0pHHjgeA7ZrjKREVTrmjinCUNZcg2vvEozOogRgobayYI9kDTpOmLlqGW7PaGXVyLFSX8UA1fwtj1XkwaFwzNq3jPBfw9MFrbeTcMHfmQBBzLIVRNCL_bNWeKhmN52a7awCvfS5GuJZeF2XJITXimzT"
  },
  {
    id: "att-3",
    name: "Marcus Thorne",
    email: "marcus.t@dncenter.com",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz"
  },
  {
    id: "att-4",
    name: "Alex Morgan",
    email: "alex.m@dncenter.com",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM"
  },
  {
    id: "att-5",
    name: "Linda Zhao",
    email: "linda.z@dncenter.com",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxiJfwfWhrXFYosD3Ov-UYXsHjDB4wmvGvQWm5y7CGpcWorSYBQXT2cxhrg1-PATm5qVG2LIaTAyTxAnQdbbm_jsCT3pmEwYWd13vnChfOuAVQBTlKbejVDnHYAjrLFxOU2KEjk82BO26Yn0ammWwa0px8-EoYbIoqeZ1TjawdAWyuiilWdnoTTm66Xcprasvolx2NXgQ_mqM8h4rP7GxE_x5naW-dB8FgEnEtmMKQtinTWnaT1oUS"
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: "101",
    buildingId: "dn-center",
    name: "Conference A",
    type: "Executive",
    capacity: 8,
    floor: 1,
    sqft: 350,
    tier: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEg5DITXLeu62SxWN5trxaT93cQisENyi_a45NdN79HO7bQSH9ruIkhOO-j8Hqffysdbk3nY8pKUhOXUAYfEGuzR0chWb1bAmFIZ6TRmdTlW9filU3tgzOMdslT05CiIAgloMVSpPuTE24r6FGY5gbRXM40Nqv9voWb_2QnuQtakGomMDm0nkZ1yVS-xRZoBIDRbOnNeR9n02ny5gJNUOoidhZujmsTYxVfHG5gI1nRHBYB6PE6oST",
    equipment: ["High-speed Wifi", "Video Conference System", "4K Display"],
    location: "1st Floor, West Wing • DN CENTER HQ"
  },
  {
    id: "102",
    buildingId: "dn-center",
    name: "Huddle 101",
    type: "Workshop",
    capacity: 4,
    floor: 1,
    sqft: 180,
    tier: "Standard",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEhZ9nqwUjaJBtoaxnxRr9i1IqqZsk_eDly3WcwpVsZgW47XCnkS7jpCBLvgG0XWZpqrJP9VkVrbC1iYmuHiJuzzww_UoWfXrvj54qvIFonOcV58uWBNEpt2oqzKrkzgR5qQw3IjL160EDbzOOH08t2h601FA0yAhl6VRuE-1cnEm3JChDnmlBLzFI1V3INrBanH1-xQ1ITQF3nYR5GGl5GJ-3gGhPFmh9GUAYlWiCMtkmgRTH8BmT",
    equipment: ["High-speed Wifi", "4K Display"],
    location: "1st Floor, Inner Core • DN CENTER HQ"
  },
  {
    id: "103",
    buildingId: "dn-center",
    name: "Creative Studio",
    type: "Workshop",
    capacity: 12,
    floor: 1,
    sqft: 400,
    tier: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuuYAyE1oypVLpsRs1zdhGroWUjdMJUK42QcjQcxzhWAFuYOvq1OLWjN5lYhoOOg0vo46J0IfypY4izWDXrh-9G5YiXZNcdkshcrOYVGB5ydss61eDfTx6uYPsJfC1BthkMXlD9fp4lDisSa7KkiX_lBf4hjqClimXIckLxpRCpo0WocHihT5Gi8lyuF_LHgpmwd9wALoXPH_2e5C-tMlJ-WmmTLFdFyoMyLJ_uxKzHg_GN9R1pwvH",
    equipment: ["High-speed Wifi", "Whiteboard Wall", "Projector"],
    location: "1st Floor, Creative Wing • DN CENTER HQ"
  },
  {
    id: "201",
    buildingId: "dn-center",
    name: "Room 201",
    type: "Meeting",
    capacity: 12,
    floor: 2,
    sqft: 450,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClYPBT85GVjFhHQ0lasxhbeTLqqQcyw2tjaZZN4m2REVO-n2GtbYjy9SqCK8tkB7bU8oCFPMQXIY4z7LqvY28q15PrTBwC_oUYtJRpNo3sAUTjxXk9q7llFzgrdlnyn5blib9uc1S1yXM6ff8yIr7paT7_9_Vmr5VPpR1YXVinswXsNxzjcIyabWo8fudaTHMMyyAF4xWD31R_twOZNhvdBJvWoBVPlFvWzjgQysDtV0NcrWvo8VJD",
    equipment: ["High-speed Wifi", "4K Display", "Video Conference System", "Coffee Machine"],
    location: "2nd Floor, East Wing • DN CENTER HQ"
  },
  {
    id: "202",
    buildingId: "dn-center",
    name: "Boardroom B",
    type: "Quiet Zone",
    capacity: 15,
    floor: 2,
    sqft: 600,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1xQTgfsEsbyRMT_l8NsZTAGIjSnWQu-p5zHLWjPcf9aWzdNh0Uk5MtDRFKClyvbXdAKqpQLFR5Ag-lItgQDOb-fsSoQXZXLiQr7qC-djauBXWkAs1_pld3fmFyW43najqTFboiQjj-M_JCCMRSV9cmFXfanLQQQrlzL5Be7UbNAkM8hW3wMRG7qvBaioPw53YCh75CNcD_uOvtlyJ15bpygLx0-CyiuuC5ZXQY-WRjTJnofNL53Lx",
    equipment: ["High-speed Wifi", "Video Conference System", "4K Display", "Whiteboard Wall"],
    location: "2nd Floor, Boardroom Suite • DN CENTER HQ"
  },
  {
    id: "203",
    buildingId: "dn-center",
    name: "Focus Pod",
    type: "Interview",
    capacity: 2,
    floor: 2,
    sqft: 120,
    tier: "Standard",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiJneE9yPG4FO9uFvctLpRJ6BaZVeJZsG2-6-pGgLHzAQZGHvwCGjACan_-h9vhIxf_k7SjWT7tFxZUvrSvdENGhJjmZMox4qTnTm5e1zNgxSu41l_xjMhyRT2KzeLYJfPJNLwhD_lNGWHNLbrD6UD6HyjH1dxPwqFrroi4LvCr_0Yhq0CFnKMZgKgNSuNqDjA_4DFACPdD8emTBVBadW0sApwu53nVtywHRxsIZNJaOzyo26zZUad",
    equipment: ["High-speed Wifi", "Acoustic Insulation"],
    location: "2nd Floor, Focus Zone • DN CENTER HQ"
  },
  {
    id: "301",
    buildingId: "dn-center",
    name: "Sky Lounge",
    type: "Boardroom",
    capacity: 20,
    floor: 3,
    sqft: 800,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYxNnsOEnlVD80hgGfCNU3I8Mf6us3hw3vl5NpVtisiAJszDDE86iAlqpGbdAEcwyV0S-1dGB_cfNHXeQ2ZQVJ3w7ASjeQj-g-Tp3K6wnVtxCBS-jAM_LxgzeN9Q-K5oF4AhpQiemOrPgwiIzpriS_XAJUbhwKp_kBKod1qyihAdOyKEo2TRXgSFknNCGn_tPQH8ZKw491lvXHgWKy7VzSnysyvvPVqlel5hlNU3GJyU60nyNrtWL5",
    equipment: ["High-speed Wifi", "4K Display", "City Panoramic Windows"],
    location: "3rd Floor, Executive Penthouse • DN CENTER HQ"
  },
  {
    id: "302",
    buildingId: "dn-center",
    name: "Global Link Hub",
    type: "Lab",
    capacity: 6,
    floor: 3,
    sqft: 280,
    tier: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoaAVfgeLJpjyThzRhUpc1qmVr_ZlMXW19iHLb85A-1_7SRr0R3AiyinmJI1FFDJy4CVy3P8o-E_A1brMXK1j6-yT8Qucp-wTieOWdhz1bR4mX1Xlk9ASc29YsErldurQyxQ7adAk_KDDyizHIxZpDfC5SsXdmFd_t-M7flVsp4vhTWn2AUUvvFIyO4tfE9QUjYJwA4KXCyX7LXRLPgqzNWZd43vqjxeKbJ3utZnViCzYmr7CaVGCU",
    equipment: ["High-speed Wifi", "Video Conference System", "4K Display"],
    location: "3rd Floor, Tech Center • DN CENTER HQ"
  },

  // --- Health Up Building (Placeholder rooms; awaiting real data) ---
  {
    id: "HU-101",
    buildingId: "health-up",
    name: "Wellness Room A",
    type: "Meeting",
    capacity: 8,
    floor: 1,
    sqft: 350,
    tier: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEg5DITXLeu62SxWN5trxaT93cQisENyi_a45NdN79HO7bQSH9ruIkhOO-j8Hqffysdbk3nY8pKUhOXUAYfEGuzR0chWb1bAmFIZ6TRmdTlW9filU3tgzOMdslT05CiIAgloMVSpPuTE24r6FGY5gbRXM40Nqv9voWb_2QnuQtakGomMDm0nkZ1yVS-xRZoBIDRbOnNeR9n02ny5gJNUOoidhZujmsTYxVfHG5gI1nRHBYB6PE6oST",
    equipment: ["High-speed Wifi", "4K Display"],
    location: "1st Floor, Wing A • HEALTH UP"
  },
  {
    id: "HU-102",
    buildingId: "health-up",
    name: "Huddle Room 1",
    type: "Workshop",
    capacity: 4,
    floor: 1,
    sqft: 180,
    tier: "Standard",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEhZ9nqwUjaJBtoaxnxRr9i1IqqZsk_eDly3WcwpVsZgW47XCnkS7jpCBLvgG0XWZpqrJP9VkVrbC1iYmuHiJuzzww_UoWfXrvj54qvIFonOcV58uWBNEpt2oqzKrkzgR5qQw3IjL160EDbzOOH08t2h601FA0yAhl6VRuE-1cnEm3JChDnmlBLzFI1V3INrBanH1-xQ1ITQF3nYR5GGl5GJ-3gGhPFmh9GUAYlWiCMtkmgRTH8BmT",
    equipment: ["High-speed Wifi"],
    location: "1st Floor, Wing B • HEALTH UP"
  },
  {
    id: "HU-201",
    buildingId: "health-up",
    name: "Care Conference Room",
    type: "Meeting",
    capacity: 12,
    floor: 2,
    sqft: 450,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClYPBT85GVjFhHQ0lasxhbeTLqqQcyw2tjaZZN4m2REVO-n2GtbYjy9SqCK8tkB7bU8oCFPMQXIY4z7LqvY28q15PrTBwC_oUYtJRpNo3sAUTjxXk9q7llFzgrdlnyn5blib9uc1S1yXM6ff8yIr7paT7_9_Vmr5VPpR1YXVinswXsNxzjcIyabWo8fudaTHMMyyAF4xWD31R_twOZNhvdBJvWoBVPlFvWzjgQysDtV0NcrWvo8VJD",
    equipment: ["High-speed Wifi", "4K Display", "Video Conference System"],
    location: "2nd Floor, East Wing • HEALTH UP"
  },
  {
    id: "HU-202",
    buildingId: "health-up",
    name: "Boardroom Health",
    type: "Boardroom",
    capacity: 15,
    floor: 2,
    sqft: 600,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1xQTgfsEsbyRMT_l8NsZTAGIjSnWQu-p5zHLWjPcf9aWzdNh0Uk5MtDRFKClyvbXdAKqpQLFR5Ag-lItgQDOb-fsSoQXZXLiQr7qC-djauBXWkAs1_pld3fmFyW43najqTFboiQjj-M_JCCMRSV9cmFXfanLQQQrlzL5Be7UbNAkM8hW3wMRG7qvBaioPw53YCh75CNcD_uOvtlyJ15bpygLx0-CyiuuC5ZXQY-WRjTJnofNL53Lx",
    equipment: ["High-speed Wifi", "Video Conference System", "4K Display", "Whiteboard Wall"],
    location: "2nd Floor, Boardroom Suite • HEALTH UP"
  },
  {
    id: "HU-301",
    buildingId: "health-up",
    name: "Sky Terrace",
    type: "Boardroom",
    capacity: 20,
    floor: 3,
    sqft: 800,
    tier: "Elite Tier",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiJneE9yPG4FO9uFvctLpRJ6BaZVeJZsG2-6-pGgLHzAQZGHvwCGjACan_-h9vhIxf_k7SjWT7tFxZUvrSvdENGhJjmZMox4qTnTm5e1zNgxSu41l_xjMhyRT2KzeLYJfPJNLwhD_lNGWHNLbrD6UD6HyjH1dxPwqFrroi4LvCr_0Yhq0CFnKMZgKgNSuNqDjA_4DFACPdD8emTBVBadW0sApwu53nVtywHRxsIZNJaOzyo26zZUad",
    equipment: ["High-speed Wifi", "4K Display", "City Panoramic Windows"],
    location: "3rd Floor, Executive Suite • HEALTH UP"
  },
  {
    id: "HU-302",
    buildingId: "health-up",
    name: "Innovation Lab",
    type: "Lab",
    capacity: 6,
    floor: 3,
    sqft: 280,
    tier: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoaAVfgeLJpjyThzRhUpc1qmVr_ZlMXW19iHLb85A-1_7SRr0R3AiyinmJI1FFDJy4CVy3P8o-E_A1brMXK1j6-yT8Qucp-wTieOWdhz1bR4mX1Xlk9ASc29YsErldurQyxQ7adAk_KDDyizHIxZpDfC5SsXdmFd_t-M7flVsp4vhTWn2AUUvvFIyO4tfE9QUjYJwA4KXCyX7LXRLPgqzNWZd43vqjxeKbJ3utZnViCzYmr7CaVGCU",
    equipment: ["High-speed Wifi", "Video Conference System", "4K Display"],
    location: "3rd Floor, Tech Center • HEALTH UP"
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "bk-1",
    roomId: "101",
    title: "Product Sync",
    organizer: "Alex Morgan",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM",
    date: "2024-10-24",
    startTime: "09:00",
    endTime: "11:00",
    attendees: [ATTENDEES_LIST[0], ATTENDEES_LIST[1]],
    status: "CONFIRMED",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-2",
    roomId: "102",
    title: "Quick Interview",
    organizer: "David K.",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC-Nwq_e1PmaHUNQkaGRNVIcPj5eQxrVgdCfK9sT71kXLNZm5XEva8jQLIexPmKgnddz1fXBdqo6Q3bD5JoaS5ifAElfGtq0pHHjgeA7ZrjKREVTrmjinCUNZcg2vvEozOogRgobayYI9kDTpOmLlqGW7PaGXVyLFSX8UA1fwtj1XkwaFwzNq3jPBfw9MFrbeTcMHfmQBBzLIVRNCL_bNWeKhmN52a7awCvfS5GuJZeF2XJITXimzT",
    date: "2024-10-24",
    startTime: "11:00",
    endTime: "12:00",
    attendees: [ATTENDEES_LIST[2]],
    status: "PENDING",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-3",
    roomId: "201",
    title: "Architecture Review",
    organizer: "Linda Zhao",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxiJfwfWhrXFYosD3Ov-UYXsHjDB4wmvGvQWm5y7CGpcWorSYBQXT2cxhrg1-PATm5qVG2LIaTAyTxAnQdbbm_jsCT3pmEwYWd13vnChfOuAVQBTlKbejVDnHYAjrLFxOU2KEjk82BO26Yn0ammWwa0px8-EoYbIoqeZ1TjawdAWyuiilWdnoTTm66Xcprasvolx2NXgQ_mqM8h4rP7GxE_x5naW-dB8FgEnEtmMKQtinTWnaT1oUS",
    date: "2024-10-24",
    startTime: "13:00",
    endTime: "14:30",
    attendees: [ATTENDEES_LIST[1], ATTENDEES_LIST[3]],
    status: "CONFIRMED",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-4",
    roomId: "202",
    title: "All Hands Meeting",
    organizer: "Marcus Thorne",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz",
    date: "2024-10-24",
    startTime: "10:00",
    endTime: "12:30",
    attendees: [ATTENDEES_LIST[0], ATTENDEES_LIST[4]],
    status: "CONFIRMED",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-5",
    roomId: "301",
    title: "Marketing Sync",
    organizer: "Sarah Johnson",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg",
    date: "2024-10-24",
    startTime: "09:00",
    endTime: "10:30",
    attendees: [ATTENDEES_LIST[1], ATTENDEES_LIST[3]],
    status: "CONFIRMED",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-6",
    roomId: "301",
    title: "Lunch Break",
    organizer: "Marcus Thorne",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz",
    date: "2024-10-24",
    startTime: "13:00",
    endTime: "14:00",
    attendees: [],
    status: "CONFIRMED",
    meetingType: "ON-SITE"
  },
  {
    id: "bk-7",
    roomId: "201",
    title: "Q4 Financial Review",
    organizer: "Sarah Johnson",
    organizerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg",
    date: "2024-10-24",
    startTime: "16:30",
    endTime: "18:00",
    attendees: [ATTENDEES_LIST[3], ATTENDEES_LIST[4]],
    status: "PENDING",
    meetingType: "ON-SITE"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.j@dncenter.com",
    role: "Executive",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZeQ88T9foI7VOadJ3rJV7vtVTqSuNa8QHHf_j62gHLBHW86wIvuQ7NqbYq-fIjUuRGxtyajCSLpP2fvHJ8OV9_xiwEEeKBOq4zr6bYt7mG8vsjmAIMknvmG7ltARqoyeq7V3gJw8ZT2jQLynel536YzYVLlcwHTA8a42vBQNkmY1sVrfZe7fQMagS8Am3UsWdHWdTGRLinOIqIjv4O6h1be6Cg8W4WunIWv8SQGfd4xeA-tF6dGg"
  },
  {
    id: "user-2",
    name: "David K.",
    email: "david.k@dncenter.com",
    role: "Admin",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC-Nwq_e1PmaHUNQkaGRNVIcPj5eQxrVgdCfK9sT71kXLNZm5XEva8jQLIexPmKgnddz1fXBdqo6Q3bD5JoaS5ifAElfGtq0pHHjgeA7ZrjKREVTrmjinCUNZcg2vvEozOogRgobayYI9kDTpOmLlqGW7PaGXVyLFSX8UA1fwtj1XkwaFwzNq3jPBfw9MFrbeTcMHfmQBBzLIVRNCL_bNWeKhmN52a7awCvfS5GuJZeF2XJITXimzT"
  },
  {
    id: "user-3",
    name: "Marcus Thorne",
    email: "marcus.t@dncenter.com",
    role: "Executive",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8f9GilSEuphAOTGKZrJzroK3xW1dGeBbcj6FnuIrVbln4T6h8g5JfWtmg0T7FvAOKkRnlIJaR3tcHcl5ORRmKyRee1u9XFmbJELSVnoXBZq1xW82Z5KLyweKE6e5R74hIZURD-jrOOECz0nGp340_g2TPbh5wqz-nBbYioy3lxvx3ne5YIoYA29c1Hr2-WBJS8ubhRH2vKrVhrG7SESP9nD1gYCtaOcnlRWhkJZjnxhMew89qvPXz"
  },
  {
    id: "user-4",
    name: "Alex Morgan",
    email: "alex.m@dncenter.com",
    role: "Admin",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1B3r4mX3tP4VtQbLwnA2jYEK2ugap2jCnHk6IXl1ZHOVIjI1Wixv4S8LuliCyPSuM5llSbab3aSvD89eU7ofHoMAjmnLUifSl18P-ybmzyzQ82OBTd--Gsntce6p-yOadGKwWojPJ4XggkJHyh_JQOd2cZHrAKqGDgSiSTECiMF8Q_tFu1Ydo-41ZMnPJDyBhBRq_f_GZer-4wNBJ1agfL0aU0ZWmE_YdApn8Th2HhvUiYzrq22lM"
  },
  {
    id: "user-5",
    name: "Linda Zhao",
    email: "linda.z@dncenter.com",
    role: "Member",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxiJfwfWhrXFYosD3Ov-UYXsHjDB4wmvGvQWm5y7CGpcWorSYBQXT2cxhrg1-PATm5qVG2LIaTAyTxAnQdbbm_jsCT3pmEwYWd13vnChfOuAVQBTlKbejVDnHYAjrLFxOU2KEjk82BO26Yn0ammWwa0px8-EoYbIoqeZ1TjawdAWyuiilWdnoTTm66Xcprasvolx2NXgQ_mqM8h4rP7GxE_x5naW-dB8FgEnEtmMKQtinTWnaT1oUS"
  }
];
