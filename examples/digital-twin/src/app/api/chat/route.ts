import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    memory,
  }: { messages: UIMessage[]; memory?: string } = await req.json();

  const result = streamText({
    model: "anthropic/claude-opus-4.6",
    system: buildSystemPrompt(memory ?? ""),
    messages: convertToModelMessages(messages),
    temperature: 0.6,
  });

  return result.toUIMessageStreamResponse();
}
