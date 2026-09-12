import { getSql } from "@/lib/db";
import type { ItemCatalogItem, TranslationOrigin } from "@/types/item";

type ItemRow = {
  id: number | string;
  nome: string;
  nome_pt_br: string | null;
  nome_pt_br_origem: TranslationOrigin | null;
  slug: string;
  descricao: string | null;
  descricao_pt_br: string | null;
  descricao_pt_br_origem: TranslationOrigin | null;
  imagem_url: string | null;
  categoria_nome: string | null;
  categoria_nome_pt_br: string | null;
  categoria_slug: string | null;
  fonte_url: string | null;
  ultima_verificacao: string | Date | null;
};

const ITEM_SELECT = `
  SELECT
    i.id,
    i.nome,
    i.nome_pt_br,
    tn.origem AS nome_pt_br_origem,
    i.slug,
    i.descricao,
    i.descricao_pt_br,
    td.origem AS descricao_pt_br_origem,
    i.imagem_url,
    c.nome AS categoria_nome,
    c.nome_pt_br AS categoria_nome_pt_br,
    c.slug AS categoria_slug,
    f.url AS fonte_url,
    i.ultima_verificacao
  FROM itens i
  LEFT JOIN item_categorias c ON c.id = i.categoria_id
  LEFT JOIN fontes f ON f.id = i.fonte_id
  LEFT JOIN traducoes_pt_br tn
    ON tn.entidade = 'itens'
   AND tn.entidade_id = i.id
   AND tn.campo = 'nome'
  LEFT JOIN traducoes_pt_br td
    ON td.entidade = 'itens'
   AND td.entidade_id = i.id
   AND td.campo = 'descricao'
`;

function mapItem(row: ItemRow): ItemCatalogItem {
  return {
    id: Number(row.id),
    nome: row.nome,
    nomePtBr: row.nome_pt_br,
    nomePtBrOrigem: row.nome_pt_br_origem,
    slug: row.slug,
    descricao: row.descricao,
    descricaoPtBr: row.descricao_pt_br,
    descricaoPtBrOrigem: row.descricao_pt_br_origem,
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
  };
}

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : null;
}

export async function getItemsCatalog(): Promise<ItemCatalogItem[]> {
  const sql = getSql();

  try {
    const rows = (await sql.query(`
      ${ITEM_SELECT}
      WHERE i.ativo = TRUE
      ORDER BY COALESCE(i.nome_pt_br, i.nome), i.nome
    `)) as ItemRow[];

    return rows.map(mapItem);
  } catch (error) {
    if (getErrorCode(error) === "42P01") {
      return [];
    }

    throw error;
  }
}

export async function getItemBySlug(slug: string): Promise<ItemCatalogItem | null> {
  const sql = getSql();

  try {
    const rows = (await sql.query(
      `
        ${ITEM_SELECT}
        WHERE i.ativo = TRUE
          AND i.slug = $1
        LIMIT 1
      `,
      [slug],
    )) as ItemRow[];

    return rows[0] ? mapItem(rows[0]) : null;
  } catch (error) {
    if (getErrorCode(error) === "42P01") {
      return null;
    }

    throw error;
  }
}
