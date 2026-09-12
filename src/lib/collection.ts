import { getSql } from "@/lib/db";
import type { CollectionCatalogItem } from "@/types/collection";

type CollectionCatalogRow = {
  aniimo_numero: number;
  aniimo_nome: string;
  aniimo_slug: string;
  funcao: string;
  estagio: string | null;
  forma_id: number;
  forma_nome: string;
  forma_slug: string;
  imagem_url: string | null;
  elementos: string[] | null;
};

export async function getCollectionCatalog(): Promise<CollectionCatalogItem[]> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      a.numero AS aniimo_numero,
      COALESCE(a.nome_pt_br, a.nome) AS aniimo_nome,
      a.slug AS aniimo_slug,
      COALESCE(f.nome_pt_br, f.nome) AS funcao,
      COALESCE(e.nome_pt_br, e.nome) AS estagio,
      af.id::int AS forma_id,
      COALESCE(af.nome_pt_br, af.nome) AS forma_nome,
      af.slug AS forma_slug,
      af.imagem_url,
      COALESCE(
        array_agg(DISTINCT COALESCE(el.nome_pt_br, el.nome) ORDER BY COALESCE(el.nome_pt_br, el.nome))
          FILTER (WHERE el.nome IS NOT NULL),
        ARRAY[]::varchar[]
      ) AS elementos
    FROM aniimos a
    JOIN funcoes f ON f.id = a.funcao_id
    LEFT JOIN estagios e ON e.id = a.estagio_id
    JOIN aniimo_formas af ON af.aniimo_id = a.id
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
      af.imagem_url
    ORDER BY
      a.numero ASC,
      CASE WHEN af.nome = 'Basic Form' THEN 0 ELSE 1 END,
      COALESCE(af.nome_pt_br, af.nome) ASC
  `) as CollectionCatalogRow[];

  return rows.map((row) => ({
    aniimoNumero: row.aniimo_numero,
    aniimoNome: row.aniimo_nome,
    aniimoSlug: row.aniimo_slug,
    funcao: row.funcao,
    estagio: row.estagio,
    formaId: row.forma_id,
    formaNome: row.forma_nome,
    formaSlug: row.forma_slug,
    imagemUrl: row.imagem_url,
    elementos: row.elementos ?? [],
  }));
}
