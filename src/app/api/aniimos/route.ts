import { NextResponse } from "next/server";

import { getAniimosCatalog } from "@/lib/aniimos";

export async function GET() {
  try {
    const aniimos = await getAniimosCatalog();

    return NextResponse.json({
      total: aniimos.length,
      data: aniimos,
    });
  } catch (error) {
    console.error("Erro ao carregar catálogo de Aniimos:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar o catálogo de Aniimos.",
      },
      { status: 500 },
    );
  }
}
