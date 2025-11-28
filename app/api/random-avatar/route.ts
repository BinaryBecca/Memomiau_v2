import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Prüfe ob User eingeloggt ist
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

    // Liste alle Dateien im Bucket auf
    const { data: files, error: listError } = await supabase.storage
      .from("profile-avatars")
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    console.log("Storage list result:", { files, error: listError });

    if (listError) {
      console.error("Storage list error:", listError);
      return NextResponse.json(
        { error: "Fehler beim Abrufen der Bilder", debug: listError.message },
        { status: 500 }
      );
    }

    console.log("Files found:", files);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Keine Bilder im Storage gefunden", debug: "files array is empty or null" },
        { status: 404 }
      );
    }

    // Filtere nur Bilddateien (png, jpg, jpeg)
    const imageFiles = files.filter((file) =>
      /\.(png|jpg|jpeg)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "Keine Bilddateien gefunden" },
        { status: 404 }
      );
    }

    // Wähle zufällig ein Bild aus
    const randomFile =
      imageFiles[Math.floor(Math.random() * imageFiles.length)];

    // Generiere Public URL
    const { data: urlData } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(randomFile.name);

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: randomFile.name,
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
