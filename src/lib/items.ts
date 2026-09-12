import { getSql } from "@/lib/db";
import type {
  ItemCatalogItem,
  ItemChange,
  ItemContent,
  ItemDetail,
  ItemEffect,
  ItemObtainment,
  ItemSource,
  TranslationOrigin,
} from "@/types/item";

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
  raridade: string | null;
  qualidade: string | null;
  cp: number | string | null;
  empilhavel: boolean | null;
  fonte_url: string | null;
  ultima_verificacao: string | Date | null;
  tem_dados_comunitarios: boolean;
};

type SourceRow = {
  tipo: string;
  titulo: string | null;
  url: string;
  escopo: string | null;
  principal: boolean;
  verificado_em: string | Date | null;
};

type ObtainmentRow = {
  id: number | string;
  tipo: string;
  titulo: string | null;
  descricao: string | null;
  local_nome: string | null;
  npc_nome: string | null;
  requisito: string | null;
  quantidade_min: number | string | null;
  quantidade_max: number | string | null;
  custo_quantidade: number | string | null;
  moeda_nome: string | null;
  chance_percentual: number | string | null;
  fonte_url: string | null;
};

type EffectRow = {
  id: number | string;
  nivel_melhoria: number | string;
  ordem: number | string;
  tipo: string | null;
  atributo: string | null;
  valor_numerico: number | string | null;
  unidade: string | null;
  descricao: string;
  descricao_pt_br: string | null;
  condicao: string | null;
  fonte_url: string | null;
};

type ContentRow = {
  id: number | string;
  item_slug: string;
  item_nome: string;
  item_nome_pt_br: string | null;
  quantidade_min: number | string | null;
  quantidade_max: number | string | null;
  chance_percentual: number | string | null;
  condicao: string | null;
  fonte_url: string | null;
};

type ChangeRow = {
  id: number | string;
  tipo: string;
  resumo: string;
  detalhes: string | null;
  fonte_url: string | null;
  verificado_em: string | Date | null;
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
    i.raridade,
    i.qualidade,
    i.cp,
    i.empilhavel,
    f.url AS fonte_url,
    i.ultima_verificacao,
    EXISTS (
      SELECT 1
        FROM item_fontes ix
        JOIN fontes fx ON fx.id = ix.fonte_id
       WHERE ix.item_id = i.id
         AND fx.tipo LIKE 'COMUNIDADE%'
         AND fx.tipo <> 'COMUNIDADE_ASSET'
    ) AS tem_dados_comunitarios
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

function numberOrNull(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isoOrNull(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

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
    raridade: row.raridade,
    qualidade: row.qualidade,
    cp: numberOrNull(row.cp),
    empilhavel: row.empilhavel,
    fonteUrl: row.fonte_url,
    ultimaVerificacao: isoOrNull(row.ultima_verificacao),
    temDadosComunitarios: Boolean(row.tem_dados_comunitarios),
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
    if (getErrorCode(error) === "42P01") return [];
    throw error;
  }
}

export async function getItemBySlug(slug: string): Promise<ItemDetail | null> {
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

    if (!rows[0]) return null;

    const item = mapItem(rows[0]);

    const [sourceRows, obtainmentRows, effectRows, contentRows, changeRows] = await Promise.all([
      sql.query(
        `
          SELECT f.tipo, f.titulo, f.url, item_source.escopo,
                 item_source.principal, item_source.verificado_em
            FROM (
              SELECT x.fonte_id, x.escopo, x.principal, x.verificado_em
                FROM item_fontes x
               WHERE x.item_id = $1
              UNION ALL
              SELECT i.fonte_id, NULL::varchar AS escopo, TRUE AS principal,
                     i.ultima_verificacao AS verificado_em
                FROM itens i
               WHERE i.id = $1
                 AND i.fonte_id IS NOT NULL
                 AND NOT EXISTS (
                   SELECT 1
                     FROM item_fontes ix
                    WHERE ix.item_id = i.id
                      AND ix.fonte_id = i.fonte_id
                 )
            ) item_source
            JOIN fontes f ON f.id = item_source.fonte_id
           ORDER BY item_source.principal DESC, f.tipo, f.titulo
        `,
        [item.id],
      ),
      sql.query(
        `
          SELECT o.id, o.tipo, o.titulo, o.descricao, o.local_nome, o.npc_nome,
                 o.requisito, o.quantidade_min, o.quantidade_max, o.custo_quantidade,
                 COALESCE(m.nome_pt_br, m.nome) AS moeda_nome,
                 o.chance_percentual, f.url AS fonte_url
            FROM item_obtencoes o
            LEFT JOIN itens m ON m.id = o.moeda_item_id
            LEFT JOIN fontes f ON f.id = o.fonte_id
           WHERE o.item_id = $1
             AND o.ativo = TRUE
           ORDER BY o.tipo, o.titulo, o.id
        `,
        [item.id],
      ),
      sql.query(
        `
          SELECT e.id, e.nivel_melhoria, e.ordem, e.tipo, e.atributo,
                 e.valor_numerico, e.unidade, e.descricao, e.descricao_pt_br,
                 e.condicao, f.url AS fonte_url
            FROM item_efeitos e
            LEFT JOIN fontes f ON f.id = e.fonte_id
           WHERE e.item_id = $1
             AND e.ativo = TRUE
           ORDER BY e.nivel_melhoria, e.ordem, e.id
        `,
        [item.id],
      ),
      sql.query(
        `
          SELECT c.id, child.slug AS item_slug, child.nome AS item_nome,
                 child.nome_pt_br AS item_nome_pt_br, c.quantidade_min,
                 c.quantidade_max, c.chance_percentual, c.condicao,
                 f.url AS fonte_url
            FROM item_conteudos c
            JOIN itens child ON child.id = c.item_conteudo_id
            LEFT JOIN fontes f ON f.id = c.fonte_id
           WHERE c.item_origem_id = $1
           ORDER BY COALESCE(child.nome_pt_br, child.nome), c.id
        `,
        [item.id],
      ),
      sql.query(
        `
          SELECT a.id, a.tipo, a.resumo, a.detalhes,
                 f.url AS fonte_url, a.verificado_em
            FROM item_alteracoes a
            LEFT JOIN fontes f ON f.id = a.fonte_id
           WHERE a.item_id = $1
           ORDER BY a.verificado_em DESC NULLS LAST, a.id DESC
        `,
        [item.id],
      ),
    ]);

    const fontes: ItemSource[] = (sourceRows as SourceRow[]).map((row) => ({
      tipo: row.tipo,
      titulo: row.titulo,
      url: row.url,
      escopo: row.escopo,
      principal: Boolean(row.principal),
      verificadoEm: isoOrNull(row.verificado_em),
    }));

    const obtencoes: ItemObtainment[] = (obtainmentRows as ObtainmentRow[]).map((row) => ({
      id: Number(row.id),
      tipo: row.tipo,
      titulo: row.titulo,
      descricao: row.descricao,
      localNome: row.local_nome,
      npcNome: row.npc_nome,
      requisito: row.requisito,
      quantidadeMin: numberOrNull(row.quantidade_min),
      quantidadeMax: numberOrNull(row.quantidade_max),
      custoQuantidade: numberOrNull(row.custo_quantidade),
      moedaNome: row.moeda_nome,
      chancePercentual: numberOrNull(row.chance_percentual),
      fonteUrl: row.fonte_url,
    }));

    const efeitos: ItemEffect[] = (effectRows as EffectRow[]).map((row) => ({
      id: Number(row.id),
      nivelMelhoria: Number(row.nivel_melhoria),
      ordem: Number(row.ordem),
      tipo: row.tipo,
      atributo: row.atributo,
      valorNumerico: numberOrNull(row.valor_numerico),
      unidade: row.unidade,
      descricao: row.descricao,
      descricaoPtBr: row.descricao_pt_br,
      condicao: row.condicao,
      fonteUrl: row.fonte_url,
    }));

    const conteudos: ItemContent[] = (contentRows as ContentRow[]).map((row) => ({
      id: Number(row.id),
      itemSlug: row.item_slug,
      itemNome: row.item_nome,
      itemNomePtBr: row.item_nome_pt_br,
      quantidadeMin: numberOrNull(row.quantidade_min),
      quantidadeMax: numberOrNull(row.quantidade_max),
      chancePercentual: numberOrNull(row.chance_percentual),
      condicao: row.condicao,
      fonteUrl: row.fonte_url,
    }));

    const alteracoes: ItemChange[] = (changeRows as ChangeRow[]).map((row) => ({
      id: Number(row.id),
      tipo: row.tipo,
      resumo: row.resumo,
      detalhes: row.detalhes,
      fonteUrl: row.fonte_url,
      verificadoEm: isoOrNull(row.verificado_em),
    }));

    return { ...item, fontes, obtencoes, efeitos, conteudos, alteracoes };
  } catch (error) {
    if (getErrorCode(error) === "42P01") return null;
    throw error;
  }
}
