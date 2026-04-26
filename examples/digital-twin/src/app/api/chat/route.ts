import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    memory,
  }: { messages: UIMessage[]; memory?: string } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: buildSystemPrompt(memory ?? ""),
    messages: convertToModelMessages(messages),
    temperature: 0.6,
  });

  return result.toUIMessageStreamResponse();
}
