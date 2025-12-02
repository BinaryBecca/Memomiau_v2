import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Verwende Public/Anon Key für Zugriff auf öffentliche Tabelle
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL or Anon Key is missing");
      return NextResponse.json(
        { error: "Server-Konfigurationsfehler" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Hole alle Avatar-URLs aus der Tabelle
    const { data: avatars, error: queryError } = await supabase
      .from("avatar_images")
      .select("filename, url")
      .order("created_at", { ascending: true });

    if (queryError) {
      console.error("Query error:", queryError);
      return NextResponse.json(
        { error: "Fehler beim Abrufen der Avatare", debug: queryError.message },
        { status: 500 }
      );
    }

    if (!avatars || avatars.length === 0) {
      return NextResponse.json(
        { error: "Keine Avatare gefunden" },
        { status: 404 }
      );
    }

    // Wähle zufällig ein Avatar aus
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    return NextResponse.json({
      url: randomAvatar.url,
      filename: randomAvatar.filename,
    });
  } catch (error) {
    console.error("Random avatar error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}
