export type UserRole = "client" | "model" | "admin";

export interface Model {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cover: string;
  isOnline: boolean;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  bio: string;
  languages: string[];
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  type: "purchase" | "call" | "payout";
  amount: number;
  credits?: number;
  date: string;
  status: "completed" | "pending";
}

export const MOCK_MODELS: Model[] = [
  {
    id: "1",
    name: "Valentina Noir",
    username: "valentina_noir",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 12,
    rating: 4.9,
    reviewCount: 284,
    tags: ["VIP", "Español", "Privado"],
    bio: "Experiencia exclusiva. Sesiones íntimas y personalizadas.",
    languages: ["ES", "EN"],
  },
  {
    id: "2",
    name: "Luna Mystique",
    username: "luna_mystique",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1488426862026-3ee34a7eb18c?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 15,
    rating: 5.0,
    reviewCount: 412,
    tags: ["Premium", "Bilingüe"],
    bio: "La noche es tuya. Conexión real en tiempo real.",
    languages: ["ES", "FR"],
  },
  {
    id: "3",
    name: "Scarlett Rose",
    username: "scarlett_rose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1525872724824-739f521a3943?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 10,
    rating: 4.8,
    reviewCount: 156,
    tags: ["Nueva", "Hot"],
    bio: "Recién llegada. Energía intensa y misteriosa.",
    languages: ["ES"],
  },
  {
    id: "4",
    name: "Aurora Velvet",
    username: "aurora_velvet",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1531746020798-e6953b06bf04?w=800&h=1000&fit=crop",
    isOnline: false,
    pricePerMinute: 18,
    rating: 4.95,
    reviewCount: 523,
    tags: ["Elite", "VIP"],
    bio: "Solo para quienes buscan lo extraordinario.",
    languages: ["ES", "EN", "IT"],
  },
  {
    id: "5",
    name: "Isabella Cruz",
    username: "isabella_cruz",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7eb18c?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 14,
    rating: 4.85,
    reviewCount: 198,
    tags: ["Sensual", "Privado"],
    bio: "Cada minuto cuenta. Hazlo inolvidable.",
    languages: ["ES", "PT"],
  },
  {
    id: "6",
    name: "Diamond Eve",
    username: "diamond_eve",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 20,
    rating: 5.0,
    reviewCount: 891,
    tags: ["Top", "Diamond"],
    bio: "La modelo #1 de la plataforma. Acceso limitado.",
    languages: ["ES", "EN"],
  },
  {
    id: "7",
    name: "Mia Sombra",
    username: "mia_sombra",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953b06bf04?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
    isOnline: false,
    pricePerMinute: 11,
    rating: 4.7,
    reviewCount: 89,
    tags: ["Misteriosa"],
    bio: "Aparece solo cuando la noche lo pide.",
    languages: ["ES"],
  },
  {
    id: "8",
    name: "Celeste Moon",
    username: "celeste_moon",
    avatar: "https://images.unsplash.com/photo-1525872724824-739f521a3943?w=400&h=500&fit=crop",
    cover: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop",
    isOnline: true,
    pricePerMinute: 13,
    rating: 4.92,
    reviewCount: 334,
    tags: ["Luna", "Nocturna"],
    bio: "Magia en vivo. Conexión profunda.",
    languages: ["ES", "EN"],
  },
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "1", credits: 100, price: 9.99, bonus: 0 },
  { id: "2", credits: 300, price: 24.99, bonus: 30, popular: true },
  { id: "3", credits: 600, price: 44.99, bonus: 100 },
  { id: "4", credits: 1200, price: 79.99, bonus: 300 },
  { id: "5", credits: 3000, price: 179.99, bonus: 1000 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "purchase", amount: 24.99, credits: 330, date: "2026-05-18", status: "completed" },
  { id: "t2", type: "call", amount: 0, credits: -48, date: "2026-05-19", status: "completed" },
  { id: "t3", type: "call", amount: 0, credits: -72, date: "2026-05-19", status: "completed" },
  { id: "t4", type: "purchase", amount: 44.99, credits: 700, date: "2026-05-20", status: "completed" },
];

export const ADMIN_STATS = {
  totalUsers: 12847,
  totalModels: 342,
  activeSessions: 28,
  revenueToday: 18420,
  revenueMonth: 412800,
  onlineModels: 89,
};
