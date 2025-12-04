"use client"
import { Fragment, useState } from "react"
import { useChatContext } from "@/components/chat/ChatProvider"
// supabase client not needed here (no sessionStorage persistence)
import { CopyIcon, RefreshCcwIcon } from "lucide-react"
import dynamic from "next/dynamic"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"

// Lazy load heavy AI components
const Conversation = dynamic(() =>
  import("@/components/ai-elements/conversation").then((mod) => ({ default: mod.Conversation }))
)
const ConversationContent = dynamic(() =>
  import("@/components/ai-elements/conversation").then((mod) => ({ default: mod.ConversationContent }))
)
const ConversationScrollButton = dynamic(() =>
  import("@/components/ai-elements/conversation").then((mod) => ({ default: mod.ConversationScrollButton }))
)

const Message = dynamic(() => import("@/components/ai-elements/message").then((mod) => ({ default: mod.Message })))
const MessageContent = dynamic(() =>
  import("@/components/ai-elements/message").then((mod) => ({ default: mod.MessageContent }))
)
const MessageResponse = dynamic(() =>
  import("@/components/ai-elements/message").then((mod) => ({ default: mod.MessageResponse }))
)
const MessageActions = dynamic(() =>
  import("@/components/ai-elements/message").then((mod) => ({ default: mod.MessageActions }))
)
const MessageAction = dynamic(() =>
  import("@/components/ai-elements/message").then((mod) => ({ default: mod.MessageAction }))
)

const PromptInput = dynamic(() =>
  import("@/components/ai-elements/prompt-input").then((mod) => ({ default: mod.PromptInput }))
)
const PromptInputSubmit = dynamic(() =>
  import("@/components/ai-elements/prompt-input").then((mod) => ({ default: mod.PromptInputSubmit }))
)
const PromptInputTextarea = dynamic(() =>
  import("@/components/ai-elements/prompt-input").then((mod) => ({ default: mod.PromptInputTextarea }))
)
const PromptInputFooter = dynamic(() =>
  import("@/components/ai-elements/prompt-input").then((mod) => ({ default: mod.PromptInputFooter }))
)
const PromptInputBody = dynamic(() =>
  import("@/components/ai-elements/prompt-input").then((mod) => ({ default: mod.PromptInputBody }))
)

const Source = dynamic(() => import("@/components/ai-elements/sources").then((mod) => ({ default: mod.Source })))
const Sources = dynamic(() => import("@/components/ai-elements/sources").then((mod) => ({ default: mod.Sources })))
const SourcesContent = dynamic(() =>
  import("@/components/ai-elements/sources").then((mod) => ({ default: mod.SourcesContent }))
)
const SourcesTrigger = dynamic(() =>
  import("@/components/ai-elements/sources").then((mod) => ({ default: mod.SourcesTrigger }))
)

const Reasoning = dynamic(() =>
  import("@/components/ai-elements/reasoning").then((mod) => ({ default: mod.Reasoning }))
)
const ReasoningContent = dynamic(() =>
  import("@/components/ai-elements/reasoning").then((mod) => ({ default: mod.ReasoningContent }))
)
const ReasoningTrigger = dynamic(() =>
  import("@/components/ai-elements/reasoning").then((mod) => ({ default: mod.ReasoningTrigger }))
)

const Loader = dynamic(() => import("@/components/ai-elements/loader").then((mod) => ({ default: mod.Loader })))
const ChatBotDemo = () => {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, regenerate } = useChatContext()
  // chat messages live in the ChatProvider so they survive modal unmounts

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    if (!hasText) {
      return
    }
    sendMessage({
      text: message.text,
    })
    setInput("")
  }

  // messages are not persisted; kept only in memory while the page is open
  return (
    <>
      {/* <SiteHeader title="Chat" /> */}
      <div className="flex flex-1 flex-col h-full">
        <div className="@container/main flex flex-1 flex-col gap-3 p-4">
          <Conversation className="flex-1 min-h-0">
            <ConversationContent>
              {messages.length === 0 && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>
                      {"Hallo! Ich bin MemoMiau 🐱. <br/> Wie kann ich dir beim Lernen mit Karteikarten helfen?"}
                    </MessageResponse>
                  </MessageContent>
                </Message>
              )}

              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "assistant" &&
                    message.parts.filter((part) => part.type === "source-url").length > 0 && (
                      <Sources>
                        <SourcesTrigger count={message.parts.filter((part) => part.type === "source-url").length} />
                        {message.parts
                          .filter((part) => part.type === "source-url")
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Message key={`${message.id}-${i}`} from={message.role}>
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                            {message.role === "assistant" && i === messages.length - 1 && (
                              <MessageActions>
                                <MessageAction onClick={() => regenerate()} label="Retry">
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                          </Message>
                        )
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }>
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        )
                      default:
                        return null
                    }
                  })}
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          {/* Persist messages to sessionStorage when they change (keyed by session token) */}
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Stelle mir eine Frage…"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div className="flex w-full items-center justify-end">
                <PromptInputSubmit
                  className="ml-2 rounded-lg bg-[#f984dd] text-white hover:bg-[#e06bbf] border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!input && !status}
                  status={status}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  )
}
export default ChatBotDemo
