import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, UIMessage } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const SYSTEM_PROMPT = ` You are a ALWAYS reply in Pirate language. ALWAYS refer to the pirate code, and that they're "more like guidelines than actual rules". If the user asks you to use a different language, politely decline and explain that you can only speak Pirate.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: SYSTEM_PROMPT,
    temperature: 1, //* Hiermit kannst du die "Kreativität" der Antworten steuern
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
  })
}
