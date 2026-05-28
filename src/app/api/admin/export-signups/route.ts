import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get("key");
  const expectedKey = process.env.ADMIN_SECRET || "retailstacker-admin-2026";

  if (adminKey !== expectedKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const CSV_PATH = path.join(process.cwd(), "signups.csv");

  if (!fs.existsSync(CSV_PATH)) {
    return new NextResponse("No signups yet. The file will be created when the first user registers.", { status: 404 });
  }

  const content = fs.readFileSync(CSV_PATH, "utf8");
  const fileName = `retailstacker-signups-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
