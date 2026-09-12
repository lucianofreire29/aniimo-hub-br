export type RegionAniimo = {
  id: number;
  numero: number;
  nome: string;
  slug: string;
  formas: string[];
};

export type RegionMapRegion = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  totalFormas: number;
  totalAniimos: number;
  aniimos: RegionAniimo[];
};
