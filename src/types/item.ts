export type ItemCatalogItem = {
  id: number;
  nome: string;
  nomePtBr: string | null;
  slug: string;
  descricao: string | null;
  descricaoPtBr: string | null;
  imagemUrl: string | null;
  categoria: {
    nome: string;
    nomePtBr: string | null;
    slug: string;
  } | null;
  fonteUrl: string | null;
  ultimaVerificacao: string | null;
};
