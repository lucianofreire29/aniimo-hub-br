import { getSql } from "@/lib/db";
import type { RegionMapRegion } from "@/types/mapa";

type RegionRow = {
  regiao_id: number | string;
  regiao_nome: string;
  regiao_slug: string;
  regiao_descricao: string | null;
  forma_id: number | string | null;
  forma_nome: string | null;
  aniimo_id: number | string | null;
  aniimo_numero: number | null;
  aniimo_nome: string | null;
  aniimo_slug: string | null;
};

export async function getMapRegions(): Promise<RegionMapRegion[]> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      rg.id AS regiao_id,
      COALESCE(rg.nome_pt_br, rg.nome) AS regiao_nome,
      rg.slug AS regiao_slug,
      COALESCE(rg.descricao_pt_br, rg.descricao) AS regiao_descricao,
      af.id AS forma_id,
      COALESCE(af.nome_pt_br, af.nome) AS forma_nome,
      an.id AS aniimo_id,
      an.numero AS aniimo_numero,
      COALESCE(an.nome_pt_br, an.nome) AS aniimo_nome,
      an.slug AS aniimo_slug
    FROM regioes rg
    LEFT JOIN forma_regioes fr ON fr.regiao_id = rg.id
    LEFT JOIN aniimo_formas af ON af.id = fr.forma_id
    LEFT JOIN aniimos an ON an.id = af.aniimo_id AND an.ativo = TRUE
    ORDER BY COALESCE(rg.nome_pt_br, rg.nome), an.numero, COALESCE(af.nome_pt_br, af.nome)
  `) as RegionRow[];

  const regionMap = new Map<number, RegionMapRegion>();
  const aniimoMaps = new Map<number, Map<number, RegionMapRegion["aniimos"][number]>>();

  for (const row of rows) {
    const regionId = Number(row.regiao_id);
    let region = regionMap.get(regionId);

    if (!region) {
      region = {
        id: regionId,
        nome: row.regiao_nome,
        slug: row.regiao_slug,
        descricao: row.regiao_descricao,
        totalFormas: 0,
        totalAniimos: 0,
        aniimos: [],
      };
      regionMap.set(regionId, region);
      aniimoMaps.set(regionId, new Map());
    }

    if (!row.forma_id || !row.aniimo_id || !row.aniimo_nome || !row.aniimo_slug) {
      continue;
    }

    region.totalFormas += 1;

    const aniimoId = Number(row.aniimo_id);
    const aniimos = aniimoMaps.get(regionId)!;
    let aniimo = aniimos.get(aniimoId);

    if (!aniimo) {
      aniimo = {
        id: aniimoId,
        numero: row.aniimo_numero ?? 0,
        nome: row.aniimo_nome,
        slug: row.aniimo_slug,
        formas: [],
      };
      aniimos.set(aniimoId, aniimo);
      region.aniimos.push(aniimo);
      region.totalAniimos += 1;
    }

    if (row.forma_nome && !aniimo.formas.includes(row.forma_nome)) {
      aniimo.formas.push(row.forma_nome);
    }
  }

  return Array.from(regionMap.values());
}
