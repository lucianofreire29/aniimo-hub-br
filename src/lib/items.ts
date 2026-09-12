import { getSql } from "@/lib/db";
import type { ItemCatalogItem } from "@/types/item";

type ItemRow = {
  id: number | string;
  nome: string;
  nome_pt_br: string | null;
  slug: string;
  descricao: string | null;
  descricao_pt_br: string | null;
  imagem_url: string | null;
  categoria_nome: string | null;
  categoria_nome_pt_br: string | null;
  categoria_slug: string | null;
  fonte_url: string | null;
  ultima_verificacao: string | Date | null;
};

export async function getItemsCatalog(): Promise<ItemCatalogItem[]> {
  const sql = getSql();

  try {
    const rows = (await sql`
      SELECT
        i.id,
        i.nome,
        i.nome_pt_br,
        i.slug,
        i.descricao,
        i.descricao_pt_br,
        i.imagem_url,
        c.nome AS categoria_nome,
        c.nome_pt_br AS categoria_nome_pt_br,
        c.slug AS categoria_slug,
        f.url AS fonte_url,
        i.ultima_verificacao
      FROM itens i
      LEFT JOIN item_categorias c ON c.id = i.categoria_id
      LEFT JOIN fontes f ON f.id = i.fonte_id
      WHERE i.ativo = TRUE
      ORDER BY COALESCE(i.nome_pt_br, i.nome), i.nome
    `) as ItemRow[];

    return rows.map((row) => ({
      id: Number(row.id),
      nome: row.nome,
      nomePtBr: row.nome_pt_br,
      slug: row.slug,
      descricao: row.descricao,
      descricaoPtBr: row.descricao_pt_br,
      imagemUrl: row.imagem_url,
      categoria:
        row.categoria_nome && row.categoria_slug
          ? {
              nome: row.categoria_nome,
              nomePtBr: row.categoria_nome_pt_br,
              slug: row.categoria_slug,
            }
          : null,
      fonteUrl: row.fonte_url,
      ultimaVerificacao:
        row.ultima_verificacao instanceof Date
          ? row.ultima_verificacao.toISOString()
          : row.ultima_verificacao,
    }));
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : null;

    if (code === "42P01") {
      return [];
    }

    throw error;
  }
}
