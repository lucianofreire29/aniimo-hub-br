import { NextResponse } from "next/server";

import { getItemBySlug } from "@/lib/items";

export const dynamic = "force-dynamic";

type ItemRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: ItemRouteContext) {
  try {
    const { slug } = await params;
    const item = await getItemBySlug(slug);

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Falha ao carregar item:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar o item." },
      { status: 500 },
    );
  }
}
