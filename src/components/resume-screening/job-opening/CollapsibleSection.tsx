"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Collapse" : "Expand"}
            {open ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </CardAction>
      </CardHeader>
      {open ? <CardContent className="space-y-5 pt-2">{children}</CardContent> : null}
    </Card>
  );
}
