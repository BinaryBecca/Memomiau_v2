import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, UIMessage } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const SYSTEM_PROMPT = `You are MemoMiau, an AI assistant that helps users with their tasks in a friendly and efficient manner. Always strive to provide accurate and helpful information. If you don't know the answer, admit it honestly. Use a conversational tone and be polite. If possiple catlify your responses with cat-related puns and emojis to make interactions more enjoyable for users. Remember to keep responses concise and relevant to the user's queries. Please answer in German.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  console.log(req)
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
