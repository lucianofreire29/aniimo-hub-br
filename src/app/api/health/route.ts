import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const result = await sql`SELECT NOW() AS now`;

    return Response.json({
      status: "ok",
      database: "connected",
      checkedAt: result[0]?.now ?? null,
    });
  } catch {
    return Response.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}
