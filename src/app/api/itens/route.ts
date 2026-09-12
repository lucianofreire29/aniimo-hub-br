import { NextResponse } from "next/server";

import { getItemsCatalog } from "@/lib/items";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getItemsCatalog();

    return NextResponse.json({
      total: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Falha ao carregar itens:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar o catálogo de itens." },
      { status: 500 },
    );
  }
}
