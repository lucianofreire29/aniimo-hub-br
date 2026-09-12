export type BuildFormItem = {
  aniimoNumero: number;
  aniimoNome: string;
  aniimoSlug: string;
  funcao: string;
  estagio: string | null;
  formaId: number;
  formaNome: string;
  formaSlug: string;
  imagemUrl: string | null;
  atributos: {
    hp: number | null;
    ataque: number | null;
    break: number | null;
    regen: number | null;
    mDef: number | null;
    pDef: number | null;
  } | null;
  elementos: Array<{
    nome: string;
    principal: boolean;
  }>;
  traits: Array<{
    nome: string;
    descricao: string | null;
  }>;
  habilidades: Array<{
    nome: string;
    descricao: string | null;
    elemento: string | null;
    poder: number | null;
    custo: number | null;
    cooldown: number | null;
    tipoAtaque: string | null;
    categoria: string | null;
    ordem: number | null;
  }>;
};

export type BuildStatKey = "hp" | "ataque" | "pDef" | "mDef" | "break" | "regen";

export type BuildPotential = Record<BuildStatKey, number>;

export type CarriedItem = {
  id: string;
  nome: string;
  slug: string;
  raridade: "Legendary";
  cp: number | null;
  bonusBase: string;
  efeitoCore: string;
  escalaPorNivel?: {
    atributo: BuildStatKey;
    rotulo: string;
    valor: number;
  };
  melhoria10?: {
    descricao: string;
    atributo?: BuildStatKey;
    rotulo?: string;
    valor?: number;
  };
  melhoria20?: string;
  fonte: {
    tipo: "DADOS_DO_JOGO_VIA_COMUNIDADE";
    url: string;
    verificadoEm: string;
  };
};
