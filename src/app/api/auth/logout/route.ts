import { TOKEN_COOKIE } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export async function POST() {
  const response = json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
