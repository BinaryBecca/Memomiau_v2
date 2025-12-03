import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const supabase = await createClient()

    const result = await supabase.auth.signInWithPassword({ email, password })

    // If signInWithPassword triggers cookie setting via createServerClient, cookies will be set.
    return NextResponse.json({ ok: true, data: result })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
