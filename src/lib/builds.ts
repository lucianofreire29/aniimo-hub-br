import { getSql } from "@/lib/db";
import { getItemsCatalog } from "@/lib/items";
import type { ItemCatalogItem } from "@/types/item";
import type { BuildFormItem } from "@/types/build";

type BuildFormRow = {
  aniimo_numero: number;
  aniimo_nome: string;
  aniimo_slug: string;
  funcao: string;
  estagio: string | null;
  forma_id: number;
  forma_nome: string;
  forma_slug: string;
  imagem_url: string | null;
  atributos: BuildFormItem["atributos"];
  elementos: BuildFormItem["elementos"] | null;
  traits: BuildFormItem["traits"] | null;
  habilidades: BuildFormItem["habilidades"] | null;
};

export async function getBuildPlannerData(): Promise<{
  forms: BuildFormItem[];
  items: ItemCatalogItem[];
}> {
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
      (
        SELECT json_build_object(
          'hp', fa.hp,
          'ataque', fa.ataque,
          'break', fa.break,
          'regen', fa.regen,
          'mDef', fa.m_def,
          'pDef', fa.p_def
        )
        FROM forma_atributos fa
        WHERE fa.forma_id = af.id
      ) AS atributos,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'nome', COALESCE(el.nome_pt_br, el.nome),
            'principal', fe.principal
          )
          ORDER BY fe.principal DESC, COALESCE(el.nome_pt_br, el.nome)
        )
        FROM forma_elementos fe
        JOIN elementos el ON el.id = fe.elemento_id
        WHERE fe.forma_id = af.id
      ), '[]'::json) AS elementos,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'nome', COALESCE(tr.nome_pt_br, tr.nome),
            'descricao', COALESCE(ft.descricao_override, tr.descricao_pt_br, tr.descricao)
          )
          ORDER BY COALESCE(tr.nome_pt_br, tr.nome)
        )
        FROM forma_traits ft
        JOIN traits tr ON tr.id = ft.trait_id
        WHERE ft.forma_id = af.id
      ), '[]'::json) AS traits,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'nome', COALESCE(hb.nome_pt_br, hb.nome),
            'descricao', COALESCE(hb.descricao_pt_br, hb.descricao),
            'elemento', COALESCE(hel.nome_pt_br, hel.nome),
            'poder', hb.poder::float8,
            'custo', hb.custo::float8,
            'cooldown', hb.cooldown::float8,
            'tipoAtaque', hb.tipo_ataque,
            'categoria', hb.categoria,
            'ordem', fh.ordem
          )
          ORDER BY fh.ordem NULLS LAST, COALESCE(hb.nome_pt_br, hb.nome)
        )
        FROM forma_habilidades fh
        JOIN habilidades hb ON hb.id = fh.habilidade_id
        LEFT JOIN elementos hel ON hel.id = hb.elemento_id
        WHERE fh.forma_id = af.id
      ), '[]'::json) AS habilidades
    FROM aniimos a
    JOIN funcoes f ON f.id = a.funcao_id
    LEFT JOIN estagios e ON e.id = a.estagio_id
    JOIN aniimo_formas af ON af.aniimo_id = a.id
    WHERE a.ativo = TRUE
    ORDER BY
      a.numero ASC,
      CASE WHEN af.nome = 'Basic Form' THEN 0 ELSE 1 END,
      COALESCE(af.nome_pt_br, af.nome) ASC
  `) as BuildFormRow[];

  const items = await getItemsCatalog();

  return {
    forms: rows.map((row) => ({
      aniimoNumero: row.aniimo_numero,
      aniimoNome: row.aniimo_nome,
      aniimoSlug: row.aniimo_slug,
      funcao: row.funcao,
      estagio: row.estagio,
      formaId: row.forma_id,
      formaNome: row.forma_nome,
      formaSlug: row.forma_slug,
      imagemUrl: row.imagem_url,
      atributos: row.atributos,
      elementos: row.elementos ?? [],
      traits: row.traits ?? [],
      habilidades: row.habilidades ?? [],
    })),
    items,
  };
}
