# Digital Twin

A small Next.js + AI SDK app that chats with you in your own voice.

You write notes about yourself (decisions, habits, preferences, patterns) into the **Memory** panel. The right panel is a chat that runs on Anthropic Claude Opus 4.6 via the Vercel AI Gateway. Every message is sent with your full memory as the system prompt, so the model is asked to predict what *you* would do — not what is objectively best.

## Run it

```bash
pnpm install
pnpm --filter example-digital-twin dev
```

Then open <http://localhost:3000>.

## Configuration

This app uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Anthropic models (including `anthropic/claude-opus-4.6`) are zero-config when deployed on Vercel. Locally, you may need an `AI_GATEWAY_API_KEY` environment variable.

## How it works

- `src/lib/system-prompt.ts` — builds the Digital Twin system prompt with your memory injected.
- `src/app/api/chat/route.ts` — `streamText` with `convertToModelMessages`, returns a UI message stream.
- `src/components/memory-editor.tsx` — left panel, persists memory in `localStorage` under `digital-twin:memory`.
- `src/components/chat-panel.tsx` — right panel, uses `useChat` with a custom transport that injects the latest memory into every request body.

Memory lives only in your browser. There is no backend storage and no account.
