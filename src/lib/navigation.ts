export type NavigationItem = {
  href: string;
  label: string;
  description?: string;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "Início" },
  { href: "/aniimos", label: "Aniimos" },
  { href: "/elementos", label: "Elementos" },
  { href: "/mapa", label: "Mapa" },
  { href: "/itens", label: "Itens" },
  { href: "/guias", label: "Guias" },
  { href: "/comunidade", label: "Comunidade" },
];

export const toolsNavigation: NavigationItem[] = [
  {
    href: "/colecao",
    label: "Coleção",
    description: "Acompanhe os Aniimos que você já encontrou ou possui.",
  },
  {
    href: "/times",
    label: "Montador de times",
    description: "Monte composições e organize seus Aniimos.",
  },
  {
    href: "/tier-list",
    label: "Tier List",
    description: "Compare classificações e votações da comunidade.",
  },
  {
    href: "/conquistas",
    label: "Conquistas",
    description: "Acompanhe objetivos e progresso dentro da plataforma.",
  },
  {
    href: "/codigos",
    label: "Códigos",
    description: "Consulte códigos divulgados oficialmente e seu status.",
  },
];

export const accountNavigation: NavigationItem[] = [
  { href: "/perfil", label: "Perfil" },
];
