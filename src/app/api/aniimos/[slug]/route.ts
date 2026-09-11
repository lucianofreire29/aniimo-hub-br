import { NextResponse } from "next/server";

import { getAniimoBySlug } from "@/lib/aniimo-detail";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const aniimo = await getAniimoBySlug(slug);

    if (!aniimo) {
      return NextResponse.json({ error: "Aniimo não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: aniimo });
  } catch (error) {
    console.error("Erro ao buscar detalhe do Aniimo:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o Aniimo." },
      { status: 500 },
    );
  }
}
