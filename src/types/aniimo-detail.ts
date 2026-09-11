export type AniimoDetail = {
  id: number;
  numero: number;
  nome: string;
  slug: string;
  descricao: string | null;
  imagemUrl: string | null;
  funcao: string;
  estagio: string | null;
  fonteUrl: string | null;
  formas: AniimoFormaDetail[];
  evoluiDe: EvolucaoDetail[];
  evoluiPara: EvolucaoDetail[];
};

export type AniimoFormaDetail = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  imagemUrl: string | null;
  fonteUrl: string | null;
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
    slug: string;
    principal: boolean;
  }>;
  traits: Array<{
    nome: string;
    slug: string;
    descricao: string | null;
  }>;
  mobilidades: Array<{
    nome: string;
    slug: string;
    descricao: string | null;
  }>;
  pathfindings: Array<{
    nome: string;
    slug: string;
    nivel: number;
    descricao: string | null;
  }>;
  regioes: Array<{
    nome: string;
    slug: string;
  }>;
  homeland: number[];
  habilidades: Array<{
    nome: string;
    slug: string;
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

export type EvolucaoDetail = {
  numero: number;
  nome: string;
  slug: string;
  nivel: number | null;
  requisito: string | null;
};
