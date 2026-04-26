"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "digital-twin:memory";

const SAMPLE_MEMORY = `# Habits
- I wake up at 6:30am on weekdays and run 5km before work.
- I prefer black coffee, no sugar.
- I go to bed by 11pm. I do not check my phone after 10pm.

# Decisions
- I declined a higher-paying job last year because it required relocating away from my family.
- I drive a 10-year-old car and refuse to upgrade as long as it runs.
- I cook at home 5 nights a week.

# Preferences
- I read non-fiction (history, biographies). Skeptical of self-help books.
- I avoid crowded places. Prefer one-on-one over group hangs.
- I save 30% of every paycheck before spending anything.

# Patterns
- When unsure, I sleep on it for one night before deciding.
- I say no to things that don't align with my long-term goals, even when it's uncomfortable.
- I ask "what's the worst case?" before any big purchase.`;

type Props = {
  memory: string;
  onChange: (next: string) => void;
};

export function MemoryEditor({ memory, onChange }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      onChange(stored);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (debounced)
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, memory);
      setSavedAt(new Date());
    }, 400);
    return () => window.clearTimeout(id);
  }, [memory, hydrated]);

  return (
    <aside className="flex h-full min-h-0 flex-col border-border bg-card md:border-r">
      <header className="flex items-center justify-between border-border border-b px-5 py-4">
        <div>
          <h2 className="font-serif font-semibold text-base text-foreground tracking-tight">
            Your Memory
          </h2>
          <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
            Decisions, habits, preferences. Your twin reads this before every
            answer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_MEMORY)}
          className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 font-medium text-foreground text-xs transition-colors hover:bg-muted"
        >
          Load sample
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <textarea
          value={memory}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "Write notes about yourself...\n\n# Habits\n- I always order the same drink.\n\n# Decisions\n- I quit social media in 2023.\n\n# Patterns\n- I sleep on big choices for a night."
          }
          spellCheck={false}
          className="thin-scroll min-h-0 flex-1 resize-none bg-transparent px-5 py-4 font-serif text-[15px] text-foreground leading-relaxed outline-none placeholder:text-muted-foreground/60"
        />

        <div className="flex items-center justify-between border-border border-t bg-muted/40 px-5 py-2.5 text-muted-foreground text-xs">
          <span>{memory.trim().length} chars</span>
          <span>
            {savedAt
              ? `Saved ${savedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Saves automatically"}
          </span>
        </div>
      </div>
    </aside>
  );
}
