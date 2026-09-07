import { prisma } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ ok: true, service: "niche-jayega" });
  } catch {
    return json({ ok: false, service: "niche-jayega" }, 503);
  }
}
