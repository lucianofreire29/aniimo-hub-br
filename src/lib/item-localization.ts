const RARITY_PT_BR: Record<string, string> = {
  Common: "Comum",
  Uncommon: "Incomum",
  Rare: "Raro",
  Epic: "Épico",
  Legendary: "Lendário",
  Prismatic: "Prismático",
};

const QUALITY_PT_BR: Record<string, string> = {
  "Carried Item": "Item carregado",
  "Carried Item - Rune": "Item carregado - Runa",
  Aniipod: "Aniicápsula",
  Currency: "Moeda",
  Materials: "Materiais",
  "Home materials": "Materiais da Casa",
  Equipment: "Equipamento",
  Food: "Comida",
  "Aniimo Food": "Comida para Aniimo",
  Chest: "Baú",
  Giftbox: "Caixa de presente",
  Egg: "Ovo",
  "Evolution Material": "Material de evolução",
  "Resonance Material": "Material de ressonância",
  "Skill Material": "Material de habilidade",
  "Trait Item": "Item de trait",
  "Trait Mark": "Marca de trait",
};

const ACQUISITION_TYPE_PT_BR: Record<string, string> = {
  ALPHA: "Alpha",
  SHOP: "Loja",
  BATTLE_PASS: "Passe de batalha",
  HANDBOOK: "Manual de companheiro",
  ITEM_EXCHANGE: "Troca de itens",
  OTHER: "Outra fonte",
  EXPLORATION: "Exploração",
  CHEST: "Baú",
  RIFT: "Fenda",
  CRAFTING: "Criação",
  ADVENTURE_RANK: "Nível de aventura",
  EVENT: "Evento",
  HOME: "Casa",
  DROP: "Drop",
  MISSION: "Missão",
  QUEST: "Missão",
  REWARD: "Recompensa",
};

const ATTRIBUTE_PT_BR: Record<string, string> = {
  REGEN: "Regeneração",
  ATK: "Ataque",
  BREAK: "Quebra",
  HP: "Vida",
  "P.DEF": "Defesa física",
  "M.DEF": "Defesa mágica",
  EP: "EP",
  "EP/Luck": "EP / Sorte",
  Luck: "Sorte",
  "Damage Amp": "Amplificação de dano",
  "Enhanced Healing": "Cura aprimorada",
  CDR: "Redução de recarga",
  UP: "UP",
};

const SOURCE_SCOPE_PT_BR: Record<string, string> = {
  CATALOGO_COMUNITARIO: "Catálogo comunitário",
  DESCRICAO: "Descrição",
  EFEITOS: "Efeitos",
  OBTENCAO: "Obtenção",
  IMAGEM: "Imagem",
};

function fallbackLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

export function localizeItemRarity(value: string | null) {
  if (!value) return null;
  return RARITY_PT_BR[value] ?? value;
}

export function localizeItemQuality(value: string | null) {
  if (!value) return null;
  return QUALITY_PT_BR[value] ?? value;
}

export function localizeAcquisitionType(value: string) {
  return ACQUISITION_TYPE_PT_BR[value] ?? fallbackLabel(value);
}

export function localizeEffectAttribute(value: string | null) {
  if (!value) return null;
  return ATTRIBUTE_PT_BR[value] ?? value;
}

export function localizeSourceScope(value: string | null) {
  if (!value) return null;
  return SOURCE_SCOPE_PT_BR[value] ?? fallbackLabel(value);
}
