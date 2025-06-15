import { Theme } from "../types";

export const themes: Theme[] = [
  {
    id: "classic",
    name: "Classic Traffic",
    description: "Chủ đề giao thông truyền thống với màu cam đỏ",
    preview: "🚦",
    background: "from-orange-50 via-white to-red-50",
    cardBackground: "from-white via-orange-50/50 to-white",
    headerBackground: "from-orange-100 to-red-100",
    primaryGradient: "from-orange-500 to-red-500",
    secondaryGradient: "from-orange-600 to-red-600",
    accentColor: "#f97316",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#fed7aa",
    shadowColor: "rgba(249, 115, 22, 0.1)",
    categories: {
      safety: "#ef4444",
      rules: "#3b82f6",
      signs: "#eab308",
      tips: "#10b981"
    }
  },
  {
    id: "pink-space",
    name: "Pink Galaxy",
    description: "Không gian hồng tím đầy mê hoặc",
    preview: "🌸",
    background: "from-pink-100 via-purple-50 to-violet-100",
    cardBackground: "from-white via-pink-50/30 to-purple-50/30",
    headerBackground: "from-pink-200 to-purple-200",
    primaryGradient: "from-pink-500 to-purple-600",
    secondaryGradient: "from-pink-600 to-purple-700",
    accentColor: "#ec4899",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#fce7f3",
    shadowColor: "rgba(236, 72, 153, 0.15)",
    categories: {
      safety: "#f43f5e",
      rules: "#8b5cf6",
      signs: "#f59e0b",
      tips: "#06d6a0"
    }
  },
  {
    id: "ocean-blue",
    name: "Ocean Depths",
    description: "Đại dương xanh thẳm với làn sóng nhẹ nhàng",
    preview: "🌊",
    background: "from-blue-100 via-cyan-50 to-teal-100",
    cardBackground: "from-white via-blue-50/40 to-cyan-50/40",
    headerBackground: "from-blue-200 to-cyan-200",
    primaryGradient: "from-blue-500 to-cyan-600",
    secondaryGradient: "from-blue-600 to-cyan-700",
    accentColor: "#0ea5e9",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#dbeafe",
    shadowColor: "rgba(14, 165, 233, 0.12)",
    categories: {
      safety: "#0ea5e9",
      rules: "#6366f1",
      signs: "#f59e0b",
      tips: "#10b981"
    }
  },
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    description: "Hoàng hôn rực rỡ với sắc màu ấm áp",
    preview: "🌅",
    background: "from-amber-100 via-orange-50 to-red-100",
    cardBackground: "from-white via-amber-50/50 to-orange-50/50",
    headerBackground: "from-amber-200 to-orange-200",
    primaryGradient: "from-amber-500 to-red-500",
    secondaryGradient: "from-amber-600 to-red-600",
    accentColor: "#f59e0b",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#fef3c7",
    shadowColor: "rgba(245, 158, 11, 0.15)",
    categories: {
      safety: "#dc2626",
      rules: "#7c3aed",
      signs: "#f59e0b",
      tips: "#059669"
    }
  },
  {
    id: "forest-green",
    name: "Forest Fresh",
    description: "Rừng xanh tươi mát và trong lành",
    preview: "🌲",
    background: "from-green-100 via-emerald-50 to-teal-100",
    cardBackground: "from-white via-green-50/40 to-emerald-50/40",
    headerBackground: "from-green-200 to-emerald-200",
    primaryGradient: "from-green-500 to-emerald-600",
    secondaryGradient: "from-green-600 to-emerald-700",
    accentColor: "#10b981",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#d1fae5",
    shadowColor: "rgba(16, 185, 129, 0.12)",
    categories: {
      safety: "#f43f5e",
      rules: "#3b82f6",
      signs: "#f59e0b",
      tips: "#10b981"
    }
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    description: "Vũ trụ tím huyền bí đầy sao",
    preview: "🌌",
    background: "from-violet-100 via-purple-50 to-indigo-100",
    cardBackground: "from-white via-violet-50/30 to-purple-50/30",
    headerBackground: "from-violet-200 to-purple-200",
    primaryGradient: "from-violet-500 to-purple-600",
    secondaryGradient: "from-violet-600 to-purple-700",
    accentColor: "#8b5cf6",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#ede9fe",
    shadowColor: "rgba(139, 92, 246, 0.15)",
    categories: {
      safety: "#f43f5e",
      rules: "#8b5cf6",
      signs: "#f59e0b",
      tips: "#06d6a0"
    }
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Giờ vàng lung linh và ấm áp",
    preview: "✨",
    background: "from-yellow-100 via-amber-50 to-orange-100",
    cardBackground: "from-white via-yellow-50/40 to-amber-50/40",
    headerBackground: "from-yellow-200 to-amber-200",
    primaryGradient: "from-yellow-500 to-amber-600",
    secondaryGradient: "from-yellow-600 to-amber-700",
    accentColor: "#eab308",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#fef3c7",
    shadowColor: "rgba(234, 179, 8, 0.15)",
    categories: {
      safety: "#dc2626",
      rules: "#3b82f6",
      signs: "#eab308",
      tips: "#059669"
    }
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    description: "Hoa anh đào nhẹ nhàng và tinh khôi",
    preview: "🌸",
    background: "from-rose-100 via-pink-50 to-red-100",
    cardBackground: "from-white via-rose-50/40 to-pink-50/40",
    headerBackground: "from-rose-200 to-pink-200",
    primaryGradient: "from-rose-500 to-pink-600",
    secondaryGradient: "from-rose-600 to-pink-700",
    accentColor: "#f43f5e",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#fce7f3",
    shadowColor: "rgba(244, 63, 94, 0.12)",
    categories: {
      safety: "#f43f5e",
      rules: "#8b5cf6",
      signs: "#f59e0b",
      tips: "#10b981"
    }
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    description: "Thế giới cyber với ánh sáng neon",
    preview: "💎",
    background: "from-slate-100 via-gray-50 to-zinc-100",
    cardBackground: "from-white via-slate-50/60 to-gray-50/60",
    headerBackground: "from-slate-200 to-gray-200",
    primaryGradient: "from-cyan-500 to-blue-600",
    secondaryGradient: "from-cyan-600 to-blue-700",
    accentColor: "#06b6d4",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#e2e8f0",
    shadowColor: "rgba(6, 182, 212, 0.15)",
    categories: {
      safety: "#ef4444",
      rules: "#3b82f6",
      signs: "#f59e0b",
      tips: "#10b981"
    }
  },
  {
    id: "aurora-nights",
    name: "Aurora Nights",
    description: "Cực quang lung linh trong đêm tối",
    preview: "🌌",
    background: "from-indigo-100 via-blue-50 to-purple-100",
    cardBackground: "from-white via-indigo-50/30 to-blue-50/30",
    headerBackground: "from-indigo-200 to-blue-200",
    primaryGradient: "from-indigo-500 to-blue-600",
    secondaryGradient: "from-indigo-600 to-blue-700",
    accentColor: "#6366f1",
    textColor: "#1f2937",
    mutedColor: "#6b7280",
    borderColor: "#e0e7ff",
    shadowColor: "rgba(99, 102, 241, 0.15)",
    categories: {
      safety: "#f43f5e",
      rules: "#6366f1",
      signs: "#f59e0b",
      tips: "#10b981"
    }
  }
];

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0];
};

export const getRandomTheme = (): Theme => {
  return themes[Math.floor(Math.random() * themes.length)];
};
