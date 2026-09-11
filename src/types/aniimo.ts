export type AniimoCatalogItem = {
  numero: number;
  nome: string;
  slug: string;
  funcao: string;
  estagio: string | null;
  formaId: string;
  formaNome: string;
  formaSlug: string;
  imagemUrl: string | null;
  hp: number | null;
  ataque: number | null;
  break: number | null;
  regen: number | null;
  mDef: number | null;
  pDef: number | null;
  elementos: string[];
};
