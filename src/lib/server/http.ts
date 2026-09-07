import { NextResponse } from "next/server";
import { getAuthUser } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) {
    return { user: null, response: error("Unauthorized", 401) };
  }
  return { user, response: null };
}
