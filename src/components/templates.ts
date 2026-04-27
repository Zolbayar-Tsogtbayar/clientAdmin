// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockSection {
  id: string;
  componentType: string;
  props: Record<string, any>;
  order: number;
}

export interface PageDef {
  id: string;
  name: string;
  path: string;
  blocks: BlockSection[];
}

/** Readable page title when API rows have no `_pageName` in props */
export function defaultPageDisplayName(path: string): string {
  const p = path === "" ? "/" : path;
  const labels: Record<string, string> = {
    "/": "Нүүр",
    "/about": "Танилцуулга",
    "/contact": "Холбоо барих",
    "/clients": "Харилцагчид",
    "/news": "Мэдээ",
    "/pricing": "Үнийн санал",
    "/services": "Үйлчилгээ",
  };
  return labels[p] || p;
}

/** Match href to page.path (handles missing leading slash, trailing slash). External URLs unchanged. */
export function normalizePagePath(path: string): string {
  let t = (path ?? "").trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t === "" || t === "/") return "/";
  if (!t.startsWith("/")) t = `/${t.replace(/^\/+/, "")}`;
  if (t.length > 1) t = t.replace(/\/+$/, "");
  return t;
}

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category:
    | "static"
    | "ecommerce"
    | "info"
    | "video"
    | "rental"
    | "parking"
    | "pos"
    | "automotive";
  color: string;
  gradient: string;
  pages: PageDef[];
}

// ─── Style factories ───────────────────────────────────────────────────────────

const H = (
  bg: string,
  text: string,
  accent: string,
  extra: Record<string, any> = {},
) => ({
  bgColor: bg,
  textColor: text,
  accentColor: accent,
  fontFamily: "Inter",
  fontSize: 20,
  paddingX: 48,
  paddingY: 20,
  sticky: true,
  borderBottom: true,
  borderColor: "#e2e8f0",
  shadowSize: "sm",
  title: "Site",
  headerNavIndependent: false,
  navFontSize: 14,
  links: [] as { label: string; href: string; isExternal?: boolean }[],
  ...extra,
});

const HERO = (
  bg: string,
  text: string,
  accent: string,
  img: boolean,
  extra: Record<string, any> = {},
) => ({
  bgColor: bg,
  textColor: text,
  accentColor: accent,
  fontFamily: "Inter",
  titleSize: 54,
  titleWeight: "800",
  subtitleSize: 18,
  paddingX: 48,
  paddingY: 100,
  align: "center",
  hasImage: img,
  btnRadius: 12,
  btnPaddingX: 32,
  btnPaddingY: 14,
  overlayOpacity: 0,
  ...extra,
});

const SEC = (
  bg: string,
  text: string,
  accent: string,
  extra: Record<string, any> = {},
) => ({
  bgColor: bg,
  textColor: text,
  accentColor: accent,
  fontFamily: "Inter",
  paddingX: 48,
  paddingY: 72,
  titleSize: 34,
  titleWeight: "700",
  cardBg: "#ffffff",
  cardRadius: 16,
  cardShadow: "md",
  columns: 3,
  ...extra,
});

const F = (
  bg: string,
  text: string,
  accent: string,
  extra: Record<string, any> = {},
) => ({
  bgColor: bg,
  textColor: text,
  accentColor: accent,
  fontFamily: "Inter",
  paddingX: 48,
  paddingY: 48,
  fontSize: 14,
  align: "center",
  ...extra,
});

// Standard full page set for branded templates (all pages required)
function brandedPages(
  id: string,
  accent: string,
  bg: string,
  text: string,
  cardBg: string,
  font: string,
  darkHeader = false,
): PageDef[] {
  const hBg = darkHeader ? bg : "#ffffff";
  const hText = darkHeader ? text : "#1a1a2e";
  const hBorder = darkHeader ? accent + "30" : "#e2e8f0";
  return [
    {
      id: "home",
      name: "Нүүр",
      path: "/",
      blocks: [
        {
          id: `${id}-h1`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
            ...(darkHeader ? { shadowSize: "none" } : {}),
          }),
        },
        {
          id: `${id}-hero`,
          componentType: "hero",
          order: 1,
          props: HERO(bg, text, accent, true, {
            fontFamily: font,
            hasVideo: true,
            overlayOpacity: 40,
          }),
        },
        {
          id: `${id}-feat`,
          componentType: "features",
          order: 2,
          props: SEC(cardBg === bg ? "#fff" : cardBg, text, accent, {
            fontFamily: font,
            columns: 3,
            cardBg: cardBg,
          }),
        },
        {
          id: `${id}-promo`,
          componentType: "promo",
          order: 3,
          props: {
            bgColor: accent,
            textColor: "#fff",
            accentColor: "#fff",
            fontFamily: font,
            paddingX: 48,
            paddingY: 72,
            titleSize: 36,
            btnRadius: 12,
          },
        },
        {
          id: `${id}-f1`,
          componentType: "footer",
          order: 4,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
    {
      id: "about",
      name: "Танилцуулга",
      path: "/about",
      blocks: [
        {
          id: `${id}-h2`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
          }),
        },
        {
          id: `${id}-ab`,
          componentType: "about",
          order: 1,
          props: SEC("#fff", "#1a1a2e", accent, {
            fontFamily: font,
            hasImage: true,
            align: "left",
            cardBg,
          }),
        },
        {
          id: `${id}-svc`,
          componentType: "services",
          order: 2,
          props: SEC(cardBg, text, accent, { fontFamily: font, columns: 3 }),
        },
        {
          id: `${id}-f2`,
          componentType: "footer",
          order: 3,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
    {
      id: "clients",
      name: "Харилцагчид",
      path: "/clients",
      blocks: [
        {
          id: `${id}-h3`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
          }),
        },
        {
          id: `${id}-cl`,
          componentType: "clients",
          order: 1,
          props: SEC("#fff", "#1a1a2e", accent, {
            fontFamily: font,
            cardBg,
            cardRadius: 14,
          }),
        },
        {
          id: `${id}-f3`,
          componentType: "footer",
          order: 2,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
    {
      id: "pricing",
      name: "Үнийн санал",
      path: "/pricing",
      blocks: [
        {
          id: `${id}-h4`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
          }),
        },
        {
          id: `${id}-pr`,
          componentType: "pricing",
          order: 1,
          props: SEC("#fff", "#1a1a2e", accent, {
            fontFamily: font,
            cardBg,
            cardRadius: 20,
          }),
        },
        {
          id: `${id}-f4`,
          componentType: "footer",
          order: 2,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
    {
      id: "news",
      name: "Мэдэгдэл",
      path: "/news",
      blocks: [
        {
          id: `${id}-h5`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
          }),
        },
        {
          id: `${id}-news`,
          componentType: "features",
          order: 1,
          props: SEC("#fff", "#1a1a2e", accent, {
            fontFamily: font,
            columns: 3,
            cardBg,
            cardRadius: 16,
          }),
        },
        {
          id: `${id}-f5`,
          componentType: "footer",
          order: 2,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
    {
      id: "contact",
      name: "Санал хүсэлт",
      path: "/contact",
      blocks: [
        {
          id: `${id}-h6`,
          componentType: "header",
          order: 0,
          props: H(hBg, hText, accent, {
            fontFamily: font,
            borderColor: hBorder,
          }),
        },
        {
          id: `${id}-ct`,
          componentType: "contact",
          order: 1,
          props: SEC("#f8fafc", "#1a1a2e", accent, {
            fontFamily: font,
            cardBg,
            showForm: true,
            formTarget: "admin.zevtabs.mn",
          }),
        },
        {
          id: `${id}-vid`,
          componentType: "promo",
          order: 2,
          props: {
            bgColor: bg,
            textColor: text,
            accentColor: accent,
            fontFamily: font,
            paddingX: 48,
            paddingY: 80,
            titleSize: 32,
            btnRadius: 12,
            hasVideo: true,
          },
        },
        {
          id: `${id}-f6`,
          componentType: "footer",
          order: 3,
          props: F(bg, text, accent, { fontFamily: font }),
        },
      ],
    },
  ];
}

// ─── 1. FoodCity ──────────────────────────────────────────────────────────────
export const TEMPLATE_FOODCITY: Template = {
  id: "foodcity",
  name: "FoodCity Загвар",
  nameEn: "FoodCity Static",
  description: "Хоол хүргэлтийн үйлчилгээний вэб сайт.",
  category: "static",
  color: "#f97316",
  gradient: "linear-gradient(135deg,#f97316,#ea580c)",
  pages: [
    {
      id: "home",
      name: "Нүүр",
      path: "/",
      blocks: [
        {
          id: "fc-h1",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#f97316"),
        },
        {
          id: "fc-hero",
          componentType: "hero",
          order: 1,
          props: HERO("#fff7ed", "#1e293b", "#f97316", true, { titleSize: 58 }),
        },
        {
          id: "fc-svc",
          componentType: "services",
          order: 2,
          props: SEC("#fff", "#1e293b", "#f97316", { columns: 3 }),
        },
        {
          id: "fc-f1",
          componentType: "footer",
          order: 3,
          props: F("#1e1b18", "#f5f5f4", "#f97316"),
        },
      ],
    },
    {
      id: "about",
      name: "Бидний тухай",
      path: "/about",
      blocks: [
        {
          id: "fc-h2",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#f97316"),
        },
        {
          id: "fc-ab",
          componentType: "about",
          order: 1,
          props: SEC("#fff", "#1e293b", "#f97316", {
            align: "left",
            hasImage: true,
          }),
        },
        {
          id: "fc-f2",
          componentType: "footer",
          order: 2,
          props: F("#1e1b18", "#f5f5f4", "#f97316"),
        },
      ],
    },
    {
      id: "contact",
      name: "Холбоо барих",
      path: "/contact",
      blocks: [
        {
          id: "fc-h3",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#f97316"),
        },
        {
          id: "fc-ct",
          componentType: "contact",
          order: 1,
          props: SEC("#f8fafc", "#1e293b", "#f97316", {
            showForm: true,
            formTarget: "admin.zevtabs.mn",
          }),
        },
        {
          id: "fc-f3",
          componentType: "footer",
          order: 2,
          props: F("#1e1b18", "#f5f5f4", "#f97316"),
        },
      ],
    },
  ],
};

// ─── 2. E-Commerce ────────────────────────────────────────────────────────────
export const TEMPLATE_ECOMMERCE: Template = {
  id: "ecommerce",
  name: "Дэлгүүр Загвар",
  nameEn: "E-Commerce Store",
  description: "Онлайн дэлгүүрийн вэб сайт — бүтээгдэхүүн, захиалга.",
  category: "ecommerce",
  color: "#6366f1",
  gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
  pages: [
    {
      id: "home",
      name: "Нүүр",
      path: "/",
      blocks: [
        {
          id: "ec-h1",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#6366f1"),
        },
        {
          id: "ec-hero",
          componentType: "hero",
          order: 1,
          props: HERO("#eef2ff", "#1e293b", "#6366f1", true),
        },
        {
          id: "ec-prod",
          componentType: "products",
          order: 2,
          props: SEC("#fff", "#1e293b", "#6366f1", { columns: 4 }),
        },
        {
          id: "ec-promo",
          componentType: "promo",
          order: 3,
          props: SEC("#eef2ff", "#1e293b", "#6366f1"),
        },
        {
          id: "ec-f1",
          componentType: "footer",
          order: 4,
          props: F("#0f172a", "#e2e8f0", "#6366f1"),
        },
      ],
    },
    {
      id: "shop",
      name: "Дэлгүүр",
      path: "/shop",
      blocks: [
        {
          id: "ec-h2",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#6366f1"),
        },
        {
          id: "ec-prod2",
          componentType: "products",
          order: 1,
          props: SEC("#f8fafc", "#1e293b", "#6366f1", { columns: 3 }),
        },
        {
          id: "ec-f2",
          componentType: "footer",
          order: 2,
          props: F("#0f172a", "#e2e8f0", "#6366f1"),
        },
      ],
    },
    {
      id: "contact",
      name: "Холбоо",
      path: "/contact",
      blocks: [
        {
          id: "ec-h3",
          componentType: "header",
          order: 0,
          props: H("#fff", "#1e293b", "#6366f1"),
        },
        {
          id: "ec-ct",
          componentType: "contact",
          order: 1,
          props: SEC("#fff", "#1e293b", "#6366f1", {
            showForm: true,
            formTarget: "admin.zevtabs.mn",
          }),
        },
        {
          id: "ec-f3",
          componentType: "footer",
          order: 2,
          props: F("#0f172a", "#e2e8f0", "#6366f1"),
        },
      ],
    },
  ],
};

// ─── 3. Medeelel / Info ────────────────────────────────────────────────────────
export const TEMPLATE_MEDEELEL: Template = {
  id: "medeelel",
  name: "Мэдээлэл Загвар",
  nameEn: "Info / Corporate",
  description:
    "Танилцуулга, харилцагчид, үнийн санал, мэдэгдэл, санал хүсэлт.",
  category: "info",
  color: "#0ea5e9",
  gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)",
  pages: [
    {
      id: "home",
      name: "Нүүр",
      path: "/",
      blocks: [
        {
          id: "md-h1",
          componentType: "header",
          order: 0,
          props: H("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-hero",
          componentType: "hero",
          order: 1,
          props: HERO("#f0f9ff", "#0c1a2e", "#0ea5e9", false),
        },
        {
          id: "md-svc",
          componentType: "services",
          order: 2,
          props: SEC("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-f1",
          componentType: "footer",
          order: 3,
          props: F("#0c1a2e", "#e0f2fe", "#0ea5e9"),
        },
      ],
    },
    {
      id: "about",
      name: "Танилцуулга",
      path: "/about",
      blocks: [
        {
          id: "md-h2",
          componentType: "header",
          order: 0,
          props: H("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-ab",
          componentType: "about",
          order: 1,
          props: SEC("#fff", "#0c1a2e", "#0ea5e9", { hasImage: true }),
        },
        {
          id: "md-f2",
          componentType: "footer",
          order: 2,
          props: F("#0c1a2e", "#e0f2fe", "#0ea5e9"),
        },
      ],
    },
    {
      id: "clients",
      name: "Харилцагчид",
      path: "/clients",
      blocks: [
        {
          id: "md-h3",
          componentType: "header",
          order: 0,
          props: H("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-cl",
          componentType: "clients",
          order: 1,
          props: SEC("#f0f9ff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-f3",
          componentType: "footer",
          order: 2,
          props: F("#0c1a2e", "#e0f2fe", "#0ea5e9"),
        },
      ],
    },
    {
      id: "pricing",
      name: "Үнийн санал",
      path: "/pricing",
      blocks: [
        {
          id: "md-h4",
          componentType: "header",
          order: 0,
          props: H("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-pr",
          componentType: "pricing",
          order: 1,
          props: SEC("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-f4",
          componentType: "footer",
          order: 2,
          props: F("#0c1a2e", "#e0f2fe", "#0ea5e9"),
        },
      ],
    },
    {
      id: "contact",
      name: "Санал хүсэлт",
      path: "/contact",
      blocks: [
        {
          id: "md-h5",
          componentType: "header",
          order: 0,
          props: H("#fff", "#0c1a2e", "#0ea5e9"),
        },
        {
          id: "md-ct",
          componentType: "contact",
          order: 1,
          props: SEC("#f0f9ff", "#0c1a2e", "#0ea5e9", {
            showForm: true,
            formTarget: "admin.zevtabs.mn",
          }),
        },
        {
          id: "md-f5",
          componentType: "footer",
          order: 2,
          props: F("#0c1a2e", "#e0f2fe", "#0ea5e9"),
        },
      ],
    },
  ],
};

// ─── 4. Video Systems Promo ────────────────────────────────────────────────────
export const TEMPLATE_VIDEO: Template = {
  id: "video",
  name: "Видео Систем Загвар",
  nameEn: "Video Systems Promo",
  description: "Видео системийн харанхуй промо вэб — гоёлтой, орчин үеийн.",
  category: "video",
  color: "#a855f7",
  gradient: "linear-gradient(135deg,#a855f7,#7c3aed)",
  pages: brandedPages(
    "vs",
    "#a855f7",
    "#0a0014",
    "#f5f3ff",
    "#1a0a35",
    "Space Grotesk",
    true,
  ),
};

// ─── 5. Rently — Dark Green Rental Platform ───────────────────────────────────
export const TEMPLATE_RENTLY: Template = {
  id: "rently",
  name: "Rently",
  nameEn: "Rently — Rental Platform",
  description:
    "Түрээсийн платформ — орчин үеийн харанхуй ногоон загвар. Танилцуулга, харилцагчид, үнийн санал, санал хүсэлт, видео промо.",
  category: "rental",
  color: "#10b981",
  gradient: "linear-gradient(135deg,#10b981,#065f46)",
  pages: brandedPages(
    "rn",
    "#10b981",
    "#071a12",
    "#d1fae5",
    "#0d2b1e",
    "Outfit",
    true,
  ),
};

// ─── 6. AmarHome — Dark Green Real Estate ─────────────────────────────────────
export const TEMPLATE_AMARHOME: Template = {
  id: "amarhome",
  name: "AmarHome",
  nameEn: "AmarHome — Real Estate",
  description:
    "Үл хөдлөх хөрөнгийн агентлагийн вэб — гүн ногоон, хурдан, орчин үеийн. Бүх стандарт хуудастай.",
  category: "static",
  color: "#059669",
  gradient: "linear-gradient(135deg,#059669,#064e3b)",
  pages: brandedPages(
    "ah",
    "#059669",
    "#04271e",
    "#ecfdf5",
    "#083d2e",
    "Poppins",
    true,
  ),
};

// ─── 7. HiCar — Dark Blue Automotive ─────────────────────────────────────────
export const TEMPLATE_HICAR: Template = {
  id: "hicar",
  name: "HiCar",
  nameEn: "HiCar — Automotive",
  description:
    "Машины үйлчилгээ, авто дэлгүүрийн вэб — гүн цэнхэр, premium загвар. Видео промо, бүх хуудастай.",
  category: "automotive",
  color: "#1d4ed8",
  gradient: "linear-gradient(135deg,#1d4ed8,#1e3a8a)",
  pages: brandedPages(
    "hc",
    "#3b82f6",
    "#030d1a",
    "#eff6ff",
    "#0d1f3c",
    "Montserrat",
    true,
  ),
};

// ─── 8. PosEase — Pinkish POS System ─────────────────────────────────────────
export const TEMPLATE_POSEASE: Template = {
  id: "posease",
  name: "PosEase",
  nameEn: "PosEase — Point of Sale",
  description:
    "Кассын систем, худалдааны программ хангамжийн вэб — ягаан, цэвэр, орчин үеийн SaaS загвар.",
  category: "pos",
  color: "#ec4899",
  gradient: "linear-gradient(135deg,#ec4899,#be185d)",
  pages: brandedPages(
    "pe",
    "#ec4899",
    "#fff0f6",
    "#1a0011",
    "#fce7f3",
    "DM Sans",
    false,
  ),
};

// ─── 9. ParkEase — Yellow Parking ────────────────────────────────────────────
export const TEMPLATE_PARKEASE: Template = {
  id: "parkease",
  name: "ParkEase",
  nameEn: "ParkEase — Smart Parking",
  description:
    "Ухаалаг зогсоолын системийн вэб — шар, тод, энергитэй загвар. Видео промо, бүх хуудастай.",
  category: "parking",
  color: "#eab308",
  gradient: "linear-gradient(135deg,#eab308,#a16207)",
  pages: brandedPages(
    "pk",
    "#eab308",
    "#1a1400",
    "#fefce8",
    "#2a2100",
    "Space Grotesk",
    true,
  ),
};

// ─── 10. Zevtabs — Modern Corporate ───────────────────────────────────────────
export const TEMPLATE_ZEVTABS: Template = {
  id: "zevtabs",
  name: "Zevtabs",
  nameEn: "Zevtabs — Animated Premium",
  description:
    "Хамгийн орчин үеийн, динамик анимацтай, шилэн эффект бүхий дээд зэрэглэлийн харанхуй загвар.",
  category: "static",
  color: "#3b82f6",
  gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  pages: brandedPages(
    "zv",
    "#3b82f6", // Vibrant Blue Accent
    "#020617", // Deep midnight slate background
    "#f8fafc", // Pure white text
    "rgba(255, 255, 255, 0.04)", // Subtle glass card bg
    "Inter",   // Modern font
    true,      // Dark header
  ).map((page) => ({
    ...page,
    blocks: page.blocks.map((block, i) => {
      const p: Record<string, any> = { ...block.props };
      
      // Inject Premium Aesthetics & Animations
      p.animation = i === 0 ? "fade-in" : "fade-in-up"; 
      if (p.cardRadius !== undefined) p.cardRadius = 24;
      if (p.btnRadius !== undefined) p.btnRadius = 14;
      
      if (block.componentType === "header") {
        p.bgColor = "rgba(9, 9, 11, 0.8)";
        p.sticky = true;
        p.borderBottom = true;
        p.borderColor = "rgba(255, 255, 255, 0.08)";
      }
      
      if (block.componentType === "hero") {
        p.titleSize = 68;
        p.titleWeight = "800";
      }

      return { ...block, props: p };
    })
  })),
};

// ─── All templates list ────────────────────────────────────────────────────────
export const ALL_TEMPLATES: Template[] = [
  TEMPLATE_FOODCITY,
  TEMPLATE_ECOMMERCE,
  TEMPLATE_MEDEELEL,
  TEMPLATE_VIDEO,
  TEMPLATE_RENTLY,
  TEMPLATE_AMARHOME,
  TEMPLATE_HICAR,
  TEMPLATE_POSEASE,
  TEMPLATE_PARKEASE,
  TEMPLATE_ZEVTABS,
];

export const DEFAULT_EMPTY_PAGES: PageDef[] = [
  {
    id: "home",
    name: "Нүүр",
    path: "/",
    blocks: [
      {
        id: "h1",
        componentType: "header",
        order: 0,
        props: H("#fff", "#1e293b", "#6366f1"),
      },
      {
        id: "hero1",
        componentType: "hero",
        order: 1,
        props: HERO("#f8fafc", "#1e293b", "#6366f1", false),
      },
      {
        id: "f1",
        componentType: "footer",
        order: 2,
        props: F("#0f172a", "#e2e8f0", "#6366f1"),
      },
    ],
  },
];
