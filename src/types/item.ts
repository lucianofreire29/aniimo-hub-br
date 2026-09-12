export type TranslationOrigin = "OFICIAL" | "ANIIMO_BRASIL";

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
  categoria: {
    nome: string;
    nomePtBr: string | null;
    slug: string;
  } | null;
  fonteUrl: string | null;
  ultimaVerificacao: string | null;
};
