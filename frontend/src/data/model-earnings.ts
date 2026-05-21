export type EarningsPeriod = "today" | "yesterday" | "week" | "month";

export interface ClientEarning {
  id: string;
  client: string;
  avatar: string;
  duration: string;
  earned: number;
  time: string;
}

export const EARNINGS_TOTALS: Record<EarningsPeriod, number> = {
  today: 124000,
  yesterday: 98500,
  week: 612000,
  month: 2480000,
};

export const EARNINGS_BY_CLIENT: Record<EarningsPeriod, ClientEarning[]> = {
  today: [
    {
      id: "t1",
      client: "Alex P.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      duration: "12:34",
      earned: 14800,
      time: "18:42",
    },
    {
      id: "t2",
      client: "Marco R.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
      duration: "08:12",
      earned: 9800,
      time: "16:10",
    },
    {
      id: "t3",
      client: "John D.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      duration: "25:00",
      earned: 30000,
      time: "11:05",
    },
    {
      id: "t4",
      client: "Carlos M.",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
      duration: "15:45",
      earned: 18900,
      time: "09:30",
    },
  ],
  yesterday: [
    {
      id: "y1",
      client: "Diego S.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
      duration: "18:20",
      earned: 22000,
      time: "21:15",
    },
    {
      id: "y2",
      client: "Alex P.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      duration: "10:05",
      earned: 12000,
      time: "19:40",
    },
    {
      id: "y3",
      client: "Luis F.",
      avatar:
        "https://images.unsplash.com/photo-1504257432389-52343af06da3?w=80&h=80&fit=crop",
      duration: "32:10",
      earned: 38500,
      time: "14:22",
    },
  ],
  week: [
    {
      id: "w1",
      client: "Alex P.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      duration: "1h 42m",
      earned: 122400,
      time: "4 sesiones",
    },
    {
      id: "w2",
      client: "Marco R.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
      duration: "58:30",
      earned: 70200,
      time: "3 sesiones",
    },
    {
      id: "w3",
      client: "John D.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      duration: "2h 10m",
      earned: 156000,
      time: "5 sesiones",
    },
    {
      id: "w4",
      client: "Diego S.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
      duration: "45:00",
      earned: 54000,
      time: "2 sesiones",
    },
  ],
  month: [
    {
      id: "m1",
      client: "Alex P.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      duration: "6h 20m",
      earned: 456000,
      time: "18 sesiones",
    },
    {
      id: "m2",
      client: "John D.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
      duration: "5h 05m",
      earned: 366000,
      time: "14 sesiones",
    },
    {
      id: "m3",
      client: "Marco R.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
      duration: "4h 40m",
      earned: 336000,
      time: "12 sesiones",
    },
    {
      id: "m4",
      client: "Luis F.",
      avatar:
        "https://images.unsplash.com/photo-1504257432389-52343af06da3?w=80&h=80&fit=crop",
      duration: "3h 15m",
      earned: 234000,
      time: "9 sesiones",
    },
    {
      id: "m5",
      client: "Diego S.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
      duration: "2h 50m",
      earned: 204000,
      time: "7 sesiones",
    },
  ],
};
