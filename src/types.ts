export interface Post {
  title: string;
  text: string;
  mediaType: "none" | "image" | "video";
  mediaUrl: string;
  mediaName: string;
  createdAt: string;
  theme: string; // "warm" | "light" | "dark" | "sepia" | "forest" | "sky"
  langBadge: string;
  aspectRatio: string; // "auto" | "square" | "video"
  // Campi social opzionali
  socialStyle?: "instagram" | "facebook" | "twitter" | "tiktok" | "standard";
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string; // base64, URL o colore
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

export interface PostResponse {
  post: Post;
  hasDefaultPassword: boolean;
}

export type ThemeName = "warm" | "light" | "dark" | "sepia" | "forest" | "sky" | "editorial";

export interface ThemeColors {
  name: string;
  bgPage: string;
  bgCard: string;
  textTitle: string;
  textBody: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  accent: string;
  accentHover: string;
  inputBg: string;
  inputText: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  editorial: {
    name: "Estetica Editoriale",
    bgPage: "bg-[#F4F1EA]",
    bgCard: "bg-white md:bg-[#F4F1EA]",
    textTitle: "text-[#1A1A1A] font-serif italic font-semibold tracking-tight",
    textBody: "text-[#1A1A1A] font-serif",
    badgeBg: "bg-[#1A1A1A]",
    badgeText: "text-[#F4F1EA] uppercase tracking-[1.5px] text-[10px]",
    border: "border-1.5 border-[#1A1A1A]",
    accent: "bg-[#1A1A1A] text-[#F4F1EA] font-serif",
    accentHover: "hover:bg-zinc-800",
    inputBg: "bg-white border-[#1A1A1A]",
    inputText: "text-[#1A1A1A] font-serif"
  },
  light: {
    name: "Minimal Chiaro",
    bgPage: "bg-gray-50",
    bgCard: "bg-white",
    textTitle: "text-gray-900",
    textBody: "text-gray-600",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-800",
    border: "border-gray-200/80",
    accent: "bg-gray-950 text-white",
    accentHover: "hover:bg-gray-800",
    inputBg: "bg-gray-50",
    inputText: "text-gray-950"
  },
  dark: {
    name: "Moderno Scuro",
    bgPage: "bg-zinc-950",
    bgCard: "bg-zinc-900",
    textTitle: "text-zinc-50",
    textBody: "text-zinc-300",
    badgeBg: "bg-zinc-800",
    badgeText: "text-zinc-200",
    border: "border-zinc-800",
    accent: "bg-sky-500 text-zinc-950 font-semibold",
    accentHover: "hover:bg-sky-400",
    inputBg: "bg-zinc-800",
    inputText: "text-zinc-50"
  },
  warm: {
    name: "Terracotta Caldo",
    bgPage: "bg-[#faf8f5]",
    bgCard: "bg-white",
    textTitle: "text-amber-950",
    textBody: "text-amber-900/80",
    badgeBg: "bg-amber-100/70",
    badgeText: "text-amber-900",
    border: "border-amber-100",
    accent: "bg-amber-900 text-[#faf8f5]",
    accentHover: "hover:bg-amber-950",
    inputBg: "bg-[#faf8f5]",
    inputText: "text-amber-950"
  },
  sepia: {
    name: "Vintage Editore",
    bgPage: "bg-[#f4efe2]",
    bgCard: "bg-[#fcfaf2]",
    textTitle: "text-[#3e2723]",
    textBody: "text-[#5d4037]",
    badgeBg: "bg-[#e0d5b1]",
    badgeText: "text-[#3e2723]",
    border: "border-[#e0d5b1]/60",
    accent: "bg-[#5d4037] text-[#fcfaf2]",
    accentHover: "hover:bg-[#3e2723]",
    inputBg: "bg-[#f4efe2]",
    inputText: "text-[#3e2723]"
  },
  forest: {
    name: "Salvia Natura",
    bgPage: "bg-[#f4f7f5]",
    bgCard: "bg-white",
    textTitle: "text-emerald-950",
    textBody: "text-emerald-900/80",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    border: "border-emerald-100",
    accent: "bg-emerald-800 text-white",
    accentHover: "hover:bg-emerald-900",
    inputBg: "bg-[#f4f7f5]",
    inputText: "text-emerald-950"
  },
  sky: {
    name: "Brezza Marina",
    bgPage: "bg-slate-50",
    bgCard: "bg-white",
    textTitle: "text-sky-950",
    textBody: "text-sky-900/80",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-800",
    border: "border-sky-100",
    accent: "bg-sky-700 text-white",
    accentHover: "hover:bg-sky-800",
    inputBg: "bg-slate-150",
    inputText: "text-sky-950"
  }
};
