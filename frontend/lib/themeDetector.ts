export type SpeciesTheme = 
  | "default"
  | "fauna"
  | "avian"
  | "flora"
  | "insect"
  | "aquatic"
  | "reptile";

export interface ThemeMeta {
  theme: SpeciesTheme;
  title: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  code: string;
}

export const THEME_REGISTRY: Record<SpeciesTheme, ThemeMeta> = {
  default: {
    theme: "default",
    title: "Laboratory Standard / Neutral",
    primaryColor: "#d4af37",
    secondaryColor: "#e5c158",
    glowColor: "rgba(212, 175, 55, 0.25)",
    code: "STD-GOLD",
  },
  fauna: {
    theme: "fauna",
    title: "Fauna / Mammalia",
    primaryColor: "#e11d48",
    secondaryColor: "#f43f5e",
    glowColor: "rgba(225, 29, 72, 0.3)",
    code: "MAM-CRIMSON",
  },
  avian: {
    theme: "avian",
    title: "Aves / Ornithological",
    primaryColor: "#0ea5e9",
    secondaryColor: "#38bdf8",
    glowColor: "rgba(14, 165, 233, 0.3)",
    code: "AVS-CYAN",
  },
  flora: {
    theme: "flora",
    title: "Flora / Botanical",
    primaryColor: "#10b981",
    secondaryColor: "#34d399",
    glowColor: "rgba(16, 185, 129, 0.3)",
    code: "BOT-EMERALD",
  },
  insect: {
    theme: "insect",
    title: "Arthropoda / Chitin",
    primaryColor: "#f59e0b",
    secondaryColor: "#fbbf24",
    glowColor: "rgba(245, 158, 11, 0.3)",
    code: "ART-AMBER",
  },
  aquatic: {
    theme: "aquatic",
    title: "Pisces / Marine",
    primaryColor: "#06b6d4",
    secondaryColor: "#22d3ee",
    glowColor: "rgba(6, 182, 212, 0.3)",
    code: "PSC-AQUAMARINE",
  },
  reptile: {
    theme: "reptile",
    title: "Reptilia / Sauria",
    primaryColor: "#84cc16",
    secondaryColor: "#a3e635",
    glowColor: "rgba(132, 204, 22, 0.3)",
    code: "REP-JADE",
  },
};

export function detectSpeciesTheme(prediction: any): ThemeMeta {
  if (!prediction || !prediction.label) {
    return THEME_REGISTRY.default;
  }

  const taxonomy = prediction.taxonomy || {};
  const kingdom = String(taxonomy.kingdom || "").toLowerCase();
  const phylum = String(taxonomy.phylum || "").toLowerCase();
  const taxClass = String(taxonomy.class || "").toLowerCase();
  const order = String(taxonomy.order || "").toLowerCase();
  const label = String(prediction.label || "").toLowerCase();
  const common = String(prediction.common_name || "").toLowerCase();
  const sci = String(prediction.scientific_name || "").toLowerCase();

  const combined = `${kingdom} ${phylum} ${taxClass} ${order} ${label} ${common} ${sci}`;

  // 1. Flora / Plants / Fungi
  if (
    kingdom.includes("plantae") ||
    kingdom.includes("fungi") ||
    combined.includes("plant") ||
    combined.includes("flower") ||
    combined.includes("tree") ||
    combined.includes("sunflower") ||
    combined.includes("rose") ||
    combined.includes("orchid") ||
    combined.includes("cactus") ||
    combined.includes("botanical")
  ) {
    return THEME_REGISTRY.flora;
  }

  // 2. Avian / Birds
  if (
    taxClass.includes("aves") ||
    combined.includes("bird") ||
    combined.includes("eagle") ||
    combined.includes("hawk") ||
    combined.includes("falcon") ||
    combined.includes("parrot") ||
    combined.includes("owl") ||
    combined.includes("penguin") ||
    combined.includes("crow") ||
    combined.includes("sparrow") ||
    combined.includes("avian")
  ) {
    return THEME_REGISTRY.avian;
  }

  // 3. Insects / Arthropods / Arachnids
  if (
    phylum.includes("arthropoda") ||
    taxClass.includes("insecta") ||
    taxClass.includes("arachnida") ||
    combined.includes("insect") ||
    combined.includes("spider") ||
    combined.includes("beetle") ||
    combined.includes("butterfly") ||
    combined.includes("moth") ||
    combined.includes("ant") ||
    combined.includes("bee") ||
    combined.includes("wasp") ||
    combined.includes("scorpion") ||
    combined.includes("dragonfly")
  ) {
    return THEME_REGISTRY.insect;
  }

  // 4. Fish / Aquatic / Marine / Amphibians
  if (
    taxClass.includes("actinopterygii") ||
    taxClass.includes("chondrichthyes") ||
    taxClass.includes("amphibia") ||
    combined.includes("fish") ||
    combined.includes("shark") ||
    combined.includes("whale") ||
    combined.includes("dolphin") ||
    combined.includes("coral") ||
    combined.includes("jellyfish") ||
    combined.includes("octopus") ||
    combined.includes("frog") ||
    combined.includes("salmon") ||
    combined.includes("trout") ||
    combined.includes("aquatic")
  ) {
    return THEME_REGISTRY.aquatic;
  }

  // 5. Reptiles / Sauria
  if (
    taxClass.includes("reptilia") ||
    combined.includes("snake") ||
    combined.includes("lizard") ||
    combined.includes("crocodile") ||
    combined.includes("alligator") ||
    combined.includes("turtle") ||
    combined.includes("tortoise") ||
    combined.includes("gecko") ||
    combined.includes("iguana") ||
    combined.includes("chameleon")
  ) {
    return THEME_REGISTRY.reptile;
  }

  // 6. Mammals / Fauna (Default animal)
  if (
    kingdom.includes("animalia") ||
    taxClass.includes("mammalia") ||
    combined.includes("lion") ||
    combined.includes("tiger") ||
    combined.includes("bear") ||
    combined.includes("wolf") ||
    combined.includes("dog") ||
    combined.includes("cat") ||
    combined.includes("elephant") ||
    combined.includes("human") ||
    combined.includes("primate") ||
    combined.includes("fauna")
  ) {
    return THEME_REGISTRY.fauna;
  }

  return THEME_REGISTRY.default;
}
