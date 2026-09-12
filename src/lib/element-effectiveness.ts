export type ElementKey =
  | "ice"
  | "light"
  | "fire"
  | "dark"
  | "lightning"
  | "wind"
  | "earth"
  | "water"
  | "grass";

export type ElementInfo = {
  key: ElementKey;
  nome: string;
  nomeFonte: string;
  nomeBanco: string;
  simbolo: string;
};

export const ELEMENT_SOURCE = {
  tipo: "COMUNIDADE_ANIIDEX" as const,
  url: "https://aniidex.com/aniimo/elements/",
  verificadoEm: "2026-09-12",
  observacao:
    "Matriz comunitária de efetividade. Os nomes exibidos seguem o glossário atual do Aniimo Brasil; Light/Lightning/Earth são mapeados editorialmente para Sagrado/Elétrico/Rocha.",
};

export const ELEMENTS: ElementInfo[] = [
  { key: "ice", nome: "Gelo", nomeFonte: "Ice", nomeBanco: "Ice", simbolo: "GE" },
  { key: "light", nome: "Sagrado", nomeFonte: "Light", nomeBanco: "Holy", simbolo: "SA" },
  { key: "fire", nome: "Fogo", nomeFonte: "Fire", nomeBanco: "Fire", simbolo: "FO" },
  { key: "dark", nome: "Sombrio", nomeFonte: "Dark", nomeBanco: "Dark", simbolo: "SO" },
  { key: "lightning", nome: "Elétrico", nomeFonte: "Lightning", nomeBanco: "Electric", simbolo: "EL" },
  { key: "wind", nome: "Vento", nomeFonte: "Wind", nomeBanco: "Wind", simbolo: "VE" },
  { key: "earth", nome: "Rocha", nomeFonte: "Earth", nomeBanco: "Rock", simbolo: "RO" },
  { key: "water", nome: "Água", nomeFonte: "Water", nomeBanco: "Water", simbolo: "AG" },
  { key: "grass", nome: "Planta", nomeFonte: "Grass", nomeBanco: "Grass", simbolo: "PL" },
];

export type EffectivenessMultiplier = 0.625 | 1 | 1.6;

export const ELEMENT_EFFECTIVENESS: Record<
  ElementKey,
  Record<ElementKey, EffectivenessMultiplier>
> = {
  ice: {
    ice: 0.625,
    light: 1,
    fire: 0.625,
    dark: 1,
    lightning: 1.6,
    wind: 0.625,
    earth: 0.625,
    water: 1.6,
    grass: 1,
  },
  light: {
    ice: 1,
    light: 0.625,
    fire: 1,
    dark: 1.6,
    lightning: 0.625,
    wind: 1.6,
    earth: 1,
    water: 1,
    grass: 1,
  },
  fire: {
    ice: 1.6,
    light: 0.625,
    fire: 0.625,
    dark: 1,
    lightning: 1,
    wind: 1,
    earth: 0.625,
    water: 0.625,
    grass: 1.6,
  },
  dark: {
    ice: 1,
    light: 1.6,
    fire: 1.6,
    dark: 1,
    lightning: 1,
    wind: 0.625,
    earth: 1,
    water: 0.625,
    grass: 1.6,
  },
  lightning: {
    ice: 0.625,
    light: 1,
    fire: 1,
    dark: 1,
    lightning: 0.625,
    wind: 1.6,
    earth: 0.625,
    water: 1.6,
    grass: 1,
  },
  wind: {
    ice: 1,
    light: 1,
    fire: 1,
    dark: 1.6,
    lightning: 0.625,
    wind: 0.625,
    earth: 1,
    water: 1,
    grass: 1.6,
  },
  earth: {
    ice: 1.6,
    light: 1,
    fire: 1,
    dark: 0.625,
    lightning: 1.6,
    wind: 1,
    earth: 0.625,
    water: 0.625,
    grass: 0.625,
  },
  water: {
    ice: 0.625,
    light: 0.625,
    fire: 1.6,
    dark: 1,
    lightning: 1,
    wind: 1,
    earth: 1.6,
    water: 0.625,
    grass: 0.625,
  },
  grass: {
    ice: 1,
    light: 0.625,
    fire: 0.625,
    dark: 1,
    lightning: 1,
    wind: 1,
    earth: 1.6,
    water: 1.6,
    grass: 0.625,
  },
};

export function getElement(key: ElementKey) {
  return ELEMENTS.find((element) => element.key === key) ?? ELEMENTS[0];
}

export function getEffectivenessLabel(multiplier: EffectivenessMultiplier) {
  if (multiplier === 1.6) return "Excelente";
  if (multiplier === 0.625) return "Ruim";
  return "Normal";
}
