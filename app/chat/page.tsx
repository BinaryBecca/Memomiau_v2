"use client"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputBody,
} from "@/components/ai-elements/prompt-input"
import { Fragment, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { CopyIcon, RefreshCcwIcon } from "lucide-react"
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning"
import { Loader } from "@/components/ai-elements/loader"
// import { SiteHeader } from "@/components/site-header"
const ChatBotDemo = () => {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, regenerate } = useChat()
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
