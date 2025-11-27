import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import z from "zod";

const cardSchema = z.object({
  front: z.string().min(2).max(200),
  back: z.string().min(2).max(400)
});
const cardsArraySchema = z.array(cardSchema).min(1).max(500);

export async function POST(req: Request) {
  const { topic, cardCount } = await req.json();
  try {
    const response = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `Erstelle ${cardCount} Lernkarten zum Thema: ${topic}. Gib ausschließlich ein JSON-Array aus, wobei jedes Element ein Objekt mit den Feldern 'front' (max. 200 Zeichen, min. 2 Zeichen) und 'back' (max. 400 Zeichen, min. 2 Zeichen) ist. Keine Einleitung, keine Formatierung, keine Erklärungen, nur das Array.`,
    });

    // Logging für Debug
    console.log("KI-Response:", response.text);

    let cards;
    try {
      // Extrahiere das erste JSON-Array aus der KI-Antwort
      const match = response.text.match(/\[([\s\S]*?)\]/);
      if (match) {
        cards = JSON.parse(match[0]);
      } else {
        cards = JSON.parse(response.text);
      }
      console.log("Parsed Cards:", cards);
    } catch (err) {
      console.log("JSON Parse Error:", err);
      return new Response(
        JSON.stringify({ error: "Antwort konnte nicht als JSON geparst werden.", debug: response.text }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const parseResult = cardsArraySchema.safeParse(cards);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Die generierten Karten sind ungültig.", debug: cards }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ cards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
