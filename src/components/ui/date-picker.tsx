"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseIsoDateString(value: string): Date | undefined {
  if (!value) return undefined;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = React.useMemo(() => parseIsoDateString(value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full min-w-0 shrink justify-start gap-2 overflow-hidden text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span className="min-w-0 flex-1 truncate text-left">
            {date ? format(date, "MMM d, yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
