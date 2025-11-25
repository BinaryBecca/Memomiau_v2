import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import z from "zod";

const topicSchema = z.string().min(5).max(100);

export async function POST() {
  try {
    const response = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `Generiere ein zufälliges Thema für das Erstellen von Lernkarten. Das Thema sollte interessant und ansprechend sein. Gib nur das Thema zurück, ohne zusätzliche Erklärungen.`,
    });

    console.log("KI-Response:", response);

    // Nutze nur response.text
    const topic = typeof response.text === "string" ? response.text : "";

    const parseResult = topicSchema.safeParse(topic);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Das generierte Thema ist ungültig.", debug: topic }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ topic }), {
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
