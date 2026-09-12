export type TranslationOrigin = "OFICIAL" | "ANIIMO_BRASIL";

export type ItemCategory = {
  nome: string;
  nomePtBr: string | null;
  slug: string;
};

export type ItemSource = {
  tipo: string;
  titulo: string | null;
  url: string;
  escopo: string | null;
  principal: boolean;
  verificadoEm: string | null;
};

export type ItemObtainment = {
  id: number;
  tipo: string;
  titulo: string | null;
  descricao: string | null;
  localNome: string | null;
  npcNome: string | null;
  requisito: string | null;
  quantidadeMin: number | null;
  quantidadeMax: number | null;
  custoQuantidade: number | null;
  moedaNome: string | null;
  chancePercentual: number | null;
  fonteUrl: string | null;
};

export type ItemEffect = {
  id: number;
  nivelMelhoria: number;
  ordem: number;
  tipo: string | null;
  atributo: string | null;
  valorNumerico: number | null;
  unidade: string | null;
  descricao: string;
  descricaoPtBr: string | null;
  condicao: string | null;
  fonteUrl: string | null;
};

export type ItemContent = {
  id: number;
  itemSlug: string;
  itemNome: string;
  itemNomePtBr: string | null;
  quantidadeMin: number | null;
  quantidadeMax: number | null;
  chancePercentual: number | null;
  condicao: string | null;
  fonteUrl: string | null;
};

export type ItemChange = {
  id: number;
  tipo: string;
  resumo: string;
  detalhes: string | null;
  fonteUrl: string | null;
  verificadoEm: string | null;
};

export type ItemCatalogItem = {
  id: number;
  nome: string;
  nomePtBr: string | null;
  nomePtBrOrigem: TranslationOrigin | null;
  slug: string;
  descricao: string | null;
  descricaoPtBr: string | null;
  descricaoPtBrOrigem: TranslationOrigin | null;
  imagemUrl: string | null;
  categoria: ItemCategory | null;
  raridade: string | null;
  qualidade: string | null;
  cp: number | null;
  empilhavel: boolean | null;
  fonteUrl: string | null;
  ultimaVerificacao: string | null;
  temDadosComunitarios: boolean;
};

export type ItemDetail = ItemCatalogItem & {
  fontes: ItemSource[];
  obtencoes: ItemObtainment[];
  efeitos: ItemEffect[];
  conteudos: ItemContent[];
  alteracoes: ItemChange[];
};
