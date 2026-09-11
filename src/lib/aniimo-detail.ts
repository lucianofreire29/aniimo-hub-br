import { getSql } from "@/lib/db";
import type { AniimoDetail } from "@/types/aniimo-detail";

type DetailRow = {
  data: AniimoDetail;
};

export async function getAniimoBySlug(slug: string): Promise<AniimoDetail | null> {
  const sql = getSql();

  const rows = await sql`
    WITH alvo AS (
      SELECT
        an.id,
        an.numero,
        an.nome,
        an.slug,
        an.descricao,
        an.imagem_url,
        fn.nome AS funcao,
        es.nome AS estagio,
        fo.url AS fonte_url
      FROM aniimos an
      LEFT JOIN funcoes fn ON fn.id = an.funcao_id
      LEFT JOIN estagios es ON es.id = an.estagio_id
      LEFT JOIN fontes fo ON fo.id = an.fonte_id
      WHERE an.slug = ${slug}
        AND an.ativo = TRUE
      LIMIT 1
    )
    SELECT json_build_object(
      'id', a.id::int,
      'numero', a.numero,
      'nome', a.nome,
      'slug', a.slug,
      'descricao', a.descricao,
      'imagemUrl', a.imagem_url,
      'funcao', a.funcao,
      'estagio', a.estagio,
      'fonteUrl', a.fonte_url,
      'formas', COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', af.id::int,
            'nome', af.nome,
            'slug', af.slug,
            'descricao', af.descricao,
            'imagemUrl', af.imagem_url,
            'fonteUrl', ff.url,
            'atributos', (
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
            ),
            'elementos', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', el.nome,
                  'slug', el.slug,
                  'principal', fe.principal
                )
                ORDER BY fe.principal DESC, el.nome
              )
              FROM forma_elementos fe
              JOIN elementos el ON el.id = fe.elemento_id
              WHERE fe.forma_id = af.id
            ), '[]'::json),
            'traits', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', tr.nome,
                  'slug', tr.slug,
                  'descricao', COALESCE(ft.descricao_override, tr.descricao)
                )
                ORDER BY tr.nome
              )
              FROM forma_traits ft
              JOIN traits tr ON tr.id = ft.trait_id
              WHERE ft.forma_id = af.id
            ), '[]'::json),
            'mobilidades', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', mo.nome,
                  'slug', mo.slug,
                  'descricao', mo.descricao
                )
                ORDER BY mo.nome
              )
              FROM forma_mobilidades fm
              JOIN mobilidades mo ON mo.id = fm.mobilidade_id
              WHERE fm.forma_id = af.id
            ), '[]'::json),
            'pathfindings', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', pf.nome,
                  'slug', pf.slug,
                  'nivel', fp.nivel,
                  'descricao', pf.descricao
                )
                ORDER BY pf.nome
              )
              FROM forma_pathfindings fp
              JOIN pathfindings pf ON pf.id = fp.pathfinding_id
              WHERE fp.forma_id = af.id
            ), '[]'::json),
            'regioes', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', rg.nome,
                  'slug', rg.slug
                )
                ORDER BY rg.nome
              )
              FROM forma_regioes fr
              JOIN regioes rg ON rg.id = fr.regiao_id
              WHERE fr.forma_id = af.id
            ), '[]'::json),
            'homeland', COALESCE((
              SELECT json_agg(fhv.valor ORDER BY fhv.ordem)
              FROM forma_homeland_valores fhv
              WHERE fhv.forma_id = af.id
            ), '[]'::json),
            'habilidades', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'nome', hb.nome,
                  'slug', hb.slug,
                  'descricao', hb.descricao,
                  'elemento', hel.nome,
                  'poder', hb.poder::float8,
                  'custo', hb.custo::float8,
                  'cooldown', hb.cooldown::float8,
                  'tipoAtaque', hb.tipo_ataque,
                  'categoria', hb.categoria,
                  'ordem', fh.ordem
                )
                ORDER BY fh.ordem NULLS LAST, hb.nome
              )
              FROM forma_habilidades fh
              JOIN habilidades hb ON hb.id = fh.habilidade_id
              LEFT JOIN elementos hel ON hel.id = hb.elemento_id
              WHERE fh.forma_id = af.id
            ), '[]'::json)
          )
          ORDER BY CASE WHEN af.nome = 'Basic Form' THEN 0 ELSE 1 END, af.nome
        )
        FROM aniimo_formas af
        LEFT JOIN fontes ff ON ff.id = af.fonte_id
        WHERE af.aniimo_id = a.id
      ), '[]'::json),
      'evoluiDe', COALESCE((
        SELECT json_agg(
          json_build_object(
            'numero', origem.numero,
            'nome', origem.nome,
            'slug', origem.slug,
            'nivel', ev.nivel,
            'requisito', ev.requisito
          )
          ORDER BY origem.numero
        )
        FROM evolucoes ev
        JOIN aniimos origem ON origem.id = ev.aniimo_origem_id
        WHERE ev.aniimo_destino_id = a.id
      ), '[]'::json),
      'evoluiPara', COALESCE((
        SELECT json_agg(
          json_build_object(
            'numero', destino.numero,
            'nome', destino.nome,
            'slug', destino.slug,
            'nivel', ev.nivel,
            'requisito', ev.requisito
          )
          ORDER BY destino.numero
        )
        FROM evolucoes ev
        JOIN aniimos destino ON destino.id = ev.aniimo_destino_id
        WHERE ev.aniimo_origem_id = a.id
      ), '[]'::json)
    ) AS data
    FROM alvo a;
  `;

  const row = rows[0] as DetailRow | undefined;
  return row?.data ?? null;
}
