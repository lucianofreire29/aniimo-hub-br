import { getSql } from "@/lib/db";
import type { AniimoCatalogItem } from "@/types/aniimo";

type AniimoCatalogRow = {
  numero: number;
  nome: string;
  slug: string;
  funcao: string;
  estagio: string | null;
  forma_id: string;
  forma_nome: string;
  forma_slug: string;
  imagem_url: string | null;
  hp: number | null;
  ataque: number | null;
  break: number | null;
  regen: number | null;
  m_def: number | null;
  p_def: number | null;
  elementos: string[] | null;
};

export async function getAniimosCatalog(): Promise<AniimoCatalogItem[]> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      a.numero,
      COALESCE(a.nome_pt_br, a.nome) AS nome,
      a.slug,
      COALESCE(f.nome_pt_br, f.nome) AS funcao,
      COALESCE(e.nome_pt_br, e.nome) AS estagio,
      af.id::text AS forma_id,
      COALESCE(af.nome_pt_br, af.nome) AS forma_nome,
      af.slug AS forma_slug,
      af.imagem_url,
      fa.hp,
      fa.ataque,
      fa.break,
      fa.regen,
      fa.m_def,
      fa.p_def,
      COALESCE(
        array_agg(DISTINCT COALESCE(el.nome_pt_br, el.nome) ORDER BY COALESCE(el.nome_pt_br, el.nome))
          FILTER (WHERE el.nome IS NOT NULL),
        ARRAY[]::varchar[]
      ) AS elementos
    FROM aniimos a
    JOIN funcoes f ON f.id = a.funcao_id
    LEFT JOIN estagios e ON e.id = a.estagio_id
    JOIN LATERAL (
      SELECT forma.*
      FROM aniimo_formas forma
      WHERE forma.aniimo_id = a.id
      ORDER BY (forma.nome = 'Basic Form') DESC, forma.id ASC
      LIMIT 1
    ) af ON TRUE
    LEFT JOIN forma_atributos fa ON fa.forma_id = af.id
    LEFT JOIN forma_elementos fe ON fe.forma_id = af.id
    LEFT JOIN elementos el ON el.id = fe.elemento_id
    WHERE a.ativo = TRUE
    GROUP BY
      a.numero,
      a.nome,
      a.nome_pt_br,
      a.slug,
      f.nome,
      f.nome_pt_br,
      e.nome,
      e.nome_pt_br,
      af.id,
      af.nome,
      af.nome_pt_br,
      af.slug,
      af.imagem_url,
      fa.hp,
      fa.ataque,
      fa.break,
      fa.regen,
      fa.m_def,
      fa.p_def
    ORDER BY a.numero ASC
  `) as AniimoCatalogRow[];

  return rows.map((row) => ({
    numero: row.numero,
    nome: row.nome,
    slug: row.slug,
    funcao: row.funcao,
    estagio: row.estagio,
    formaId: row.forma_id,
    formaNome: row.forma_nome,
    formaSlug: row.forma_slug,
    imagemUrl: row.imagem_url,
    hp: row.hp,
    ataque: row.ataque,
    break: row.break,
    regen: row.regen,
    mDef: row.m_def,
    pDef: row.p_def,
    elementos: row.elementos ?? [],
  }));
}
