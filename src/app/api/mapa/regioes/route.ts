import { NextResponse } from "next/server";

import { getMapRegions } from "@/lib/mapa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const regions = await getMapRegions();

    return NextResponse.json({
      total: regions.length,
      data: regions,
    });
  } catch (error) {
    console.error("Falha ao carregar regiões do mapa:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar as regiões do mapa." },
      { status: 500 },
    );
  }
}
