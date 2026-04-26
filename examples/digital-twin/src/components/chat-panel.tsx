"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  memory: string;
};

const SUGGESTIONS = [
  "Should I take a new job offer that pays 30% more but requires relocating?",
  "A friend invited me to a 50-person party tonight. Do I go?",
  "Should I buy a new laptop this year or wait?",
];

export function ChatPanel({ memory }: Props) {
  const memoryRef = useRef(memory);
  useEffect(() => {
    memoryRef.current = memory;
  }, [memory]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            memory: memoryRef.current,
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages / streaming chunks
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    sendMessage({ text: trimmed });
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between border-border border-b bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="font-serif font-semibold text-sm">DT</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm leading-tight">
              Digital Twin
            </h1>
            <p className="text-muted-foreground text-xs leading-tight">
              {messages.length === 0
                ? "Ready when you are"
                : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="rounded-md border border-border bg-background px-2.5 py-1 font-medium text-foreground text-xs transition-colors hover:bg-muted"
          >
            Clear chat
          </button>
        )}
      </header>

      <div
        ref={scrollRef}
        className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 ? (
            <EmptyState
              hasMemory={memory.trim().length > 0}
              onPick={(s) => submit(s)}
            />
          ) : (
            messages.map((m) => <Message key={m.id} message={m} />)
          )}

          {error && (
            <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-foreground text-sm">
              <p className="font-medium">Something went wrong.</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {error.message ||
                  "Check that AI Gateway is configured for this project."}
              </p>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-border border-t bg-card px-4 py-4 md:px-8"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <div className="flex-1 rounded-lg border border-border bg-background focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Ask what you would do..."
              className="thin-scroll block max-h-40 w-full resize-none bg-transparent px-3.5 py-2.5 text-[15px] text-foreground leading-relaxed outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="h-10 shrink-0 rounded-lg border border-border bg-background px-4 font-medium text-foreground text-sm transition-colors hover:bg-muted"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 shrink-0 rounded-lg bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground text-xs">
          Enter to send, Shift+Enter for newline.
        </p>
      </form>
    </section>
  );
}

function EmptyState({
  hasMemory,
  onPick,
}: {
  hasMemory: boolean;
  onPick: (s: string) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-6 py-6">
      <div>
        <h2 className="font-serif font-semibold text-2xl text-foreground tracking-tight">
          What would you do?
        </h2>
        <p className="mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          {hasMemory
            ? "Your twin has read your memory. Ask a decision and get an answer in your voice."
            : "Add some notes about yourself in the Memory panel, then ask a question. The more your twin knows, the more it sounds like you."}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs uppercase tracking-wider">
          Try asking
        </span>
        <div className="flex flex-col gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="max-w-md rounded-md border border-border bg-card px-3.5 py-2.5 text-left text-foreground text-sm transition-colors hover:border-primary/40 hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type ChatMessage = ReturnType<typeof useChat>["messages"][number];

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  return (
    <div
      className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
    >
      <span className="text-muted-foreground text-xs">
        {isUser ? "You" : "Your Twin"}
      </span>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-[15px] text-primary-foreground leading-relaxed"
            : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 font-serif text-[15px] text-foreground leading-relaxed"
        }
      >
        {text || (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Dot />
            <Dot delay={150} />
            <Dot delay={300} />
          </span>
        )}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block size-1.5 animate-pulse rounded-full bg-current"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
