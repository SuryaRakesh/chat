"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { MemoryEditor } from "@/components/memory-editor";

export default function Page() {
  const [memory, setMemory] = useState("");

  return (
    <main className="grid h-svh grid-rows-[auto_1fr] md:grid-cols-[minmax(280px,360px)_1fr] md:grid-rows-1">
      <MemoryEditor memory={memory} onChange={setMemory} />
      <ChatPanel memory={memory} />
    </main>
  );
}
