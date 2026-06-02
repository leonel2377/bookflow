import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/password-reset";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; password?: string };
    const token = body.token?.trim();
    const password = body.password;

    if (!token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const result = await resetPasswordWithToken(token, password);

    if (result === "invalid") {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
    if (result === "expired") {
      return NextResponse.json({ error: "expired_token" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
