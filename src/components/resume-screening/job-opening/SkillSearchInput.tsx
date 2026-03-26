"use client";

import { Input } from "@/components/ui/input";
import { MOCK_SKILL_SUGGESTIONS } from "./mockSkillSuggestions";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SkillSearchInputProps = {
  /** Skill names already on the post — excluded from suggestions. */
  existingNames: string[];
  onSelectSkill: (skillName: string) => void;
  inputClassName: string;
};

export default function SkillSearchInput({
  existingNames,
  onSelectSkill,
  inputClassName,
}: SkillSearchInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const existingLower = useMemo(
    () => new Set(existingNames.map((n) => n.toLowerCase())),
    [existingNames],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = MOCK_SKILL_SUGGESTIONS.filter((s) => !existingLower.has(s.toLowerCase()));
    if (!q) return pool.slice(0, 12);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [query, existingLower]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [close]);

  const pick = (name: string) => {
    onSelectSkill(name);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative mb-1">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Type to search skills…"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        className={inputClassName}
      />
      {open && filtered.length > 0 ? (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md",
            "text-sm text-popover-foreground ring-1 ring-foreground/10",
          )}
        >
          {filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && filtered.length === 0 ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
          No matching skills in the catalog.
        </div>
      ) : null}
    </div>
  );
}
