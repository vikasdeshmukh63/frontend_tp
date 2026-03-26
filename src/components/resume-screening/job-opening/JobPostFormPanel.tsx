"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatInrLpaRange } from "@/lib/format-salary-inr";
import { cn } from "@/lib/utils";
import type { JobPostDraft, SkillTag, WorkArrangement } from "@/types/job-post-draft";
import { Search, Star, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import CollapsibleSection from "./CollapsibleSection";
import {
  EMPLOYMENT_OPTIONS,
  SALARY_FREQUENCY_OPTIONS,
  SENIORITY_OPTIONS,
} from "./job-post-constants";
import SkillSearchInput from "./SkillSearchInput";
import SimpleRichTextField from "./SimpleRichTextField";

type JobPostFormPanelProps = {
  draft: JobPostDraft;
  onChange: (next: JobPostDraft) => void;
  /** Yup step-1 validation messages keyed by field name */
  fieldErrors?: Partial<Record<string, string>>;
};

const currencyOptions = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const labelBrand = "text-brand-700 dark:text-brand-400";
/** Multi-line label: column stack, left-aligned (MUI Stack–like), overrides shadcn Label’s row flex. */
const labelCompound = cn(
  labelBrand,
  "flex min-w-0 flex-col items-start gap-1 text-left",
);

/** Same height for label area in 2-col rows so inputs line up when only one field has helper text. */
const labelBand = "flex min-h-[3.75rem] flex-col justify-start sm:min-h-[4rem]";

export default function JobPostFormPanel({
  draft,
  onChange,
  fieldErrors,
}: JobPostFormPanelProps) {
  const fe = fieldErrors ?? {};
  const [cityDraft, setCityDraft] = useState("");

  const lpaSummary = useMemo(
    () => formatInrLpaRange(draft.salaryMin, draft.salaryMax),
    [draft.salaryMin, draft.salaryMax],
  );

  const patch = (p: Partial<JobPostDraft>) => onChange({ ...draft, ...p });

  const setSkillMandatory = (id: string, mandatory: boolean) => {
    const skills = draft.skills.map((s: SkillTag) =>
      s.id === id ? { ...s, mandatory } : s,
    );
    patch({ skills });
  };

  const removeSkill = (id: string) => {
    patch({ skills: draft.skills.filter((s) => s.id !== id) });
  };

  const addSkill = (name: string) => {
    const t = name.trim();
    if (!t) return;
    if (draft.skills.some((s) => s.name.toLowerCase() === t.toLowerCase())) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `skill-${Date.now()}`;
    patch({
      skills: [...draft.skills, { id, name: t, mandatory: false }],
    });
  };

  const addLocation = () => {
    const t = cityDraft.trim();
    if (!t) return;
    if (draft.locations.includes(t)) {
      setCityDraft("");
      return;
    }
    patch({ locations: [...draft.locations, t] });
    setCityDraft("");
  };

  /** Same height for Input + SelectTrigger; `min-w-0` avoids grid/flex overflow. */
  const inputFull = "h-11 w-full min-w-0";

  return (
    <div className="space-y-5 pr-1">
      <CollapsibleSection title="Important Fields">
        <div className="space-y-4">
          <div className="w-full space-y-2">
            <Label htmlFor="job-post-title" className={labelCompound}>
              <span>
                Job Title <span className="text-destructive">*</span>
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                (What candidates see advertised, and what you refer to it internally)
              </span>
            </Label>
            <Input
              id="job-post-title"
              value={draft.jobTitle}
              placeholder="&quot;Engineer (Platforms)&quot;,  &quot;Analyst - Payments&quot;,  &quot;Marketer L7&quot;"
              onChange={(e) => patch({ jobTitle: e.target.value })}
              className={cn(inputFull, fe.jobTitle && "border-destructive")}
              aria-invalid={!!fe.jobTitle}
            />
            {fe.jobTitle ? (
              <p className="text-xs text-destructive">{fe.jobTitle}</p>
            ) : null}
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <div className={labelBand}>
                <Label className={labelCompound}>
                  <span>Role</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    (Optional. What the industry calls it)
                  </span>
                </Label>
              </div>
              <div className="relative w-full">
                <Input
                  value={draft.role}
                  placeholder="&quot;Engineer&quot;,  &quot;Analyst&quot;, &quot;Marketer&quot;"
                  onChange={(e) => patch({ role: e.target.value })}
                  className={cn(inputFull, "pr-10", fe.role && "border-destructive")}
                  aria-invalid={!!fe.role}
                />
                {draft.role ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => patch({ role: "" })}
                    aria-label="Clear role"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className={labelBand}>
                <Label className={labelCompound}>
                  <span>
                    Seniority{" "}
                    <span className="text-destructive">*</span>
                  </span>
                </Label>
              </div>
              <Select
                value={draft.seniority}
                onValueChange={(v) => patch({ seniority: v })}
              >
                <SelectTrigger
                  className={cn(inputFull, fe.seniority && "border-destructive")}
                  aria-invalid={!!fe.seniority}
                >
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fe.seniority ? (
                <p className="text-xs text-destructive">{fe.seniority}</p>
              ) : null}
            </div>
          </div>

          <Separator className="my-2" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelBrand}>
                Experience <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={draft.experienceMin}
                  onChange={(e) => patch({ experienceMin: e.target.value })}
                  placeholder="Min"
                  className={cn("h-11 w-20", fe.experienceMin && "border-destructive")}
                  aria-invalid={!!fe.experienceMin}
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="number"
                  min={0}
                  value={draft.experienceMax}
                  onChange={(e) => patch({ experienceMax: e.target.value })}
                  placeholder="Max"
                  className={cn("h-11 w-20", fe.experienceMax && "border-destructive")}
                  aria-invalid={!!fe.experienceMax}
                />
                <span className="text-sm text-muted-foreground">years</span>
              </div>
              {fe.experienceMin || fe.experienceMax ? (
                <p className="text-xs text-destructive">
                  {fe.experienceMin ?? fe.experienceMax}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className={labelBrand}>
                Employment type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={draft.employmentType}
                onValueChange={(v) => patch({ employmentType: v })}
              >
                <SelectTrigger
                  className={cn(inputFull, fe.employmentType && "border-destructive")}
                  aria-invalid={!!fe.employmentType}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fe.employmentType ? (
                <p className="text-xs text-destructive">{fe.employmentType}</p>
              ) : null}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Job Details">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Label className={cn(labelBrand, "leading-snug")}>
              Salary range{" "}
              <span className="font-normal text-muted-foreground">(set min = max for fixed)</span>
            </Label>
            <Select
              value={draft.salaryFrequency}
              onValueChange={(v) => patch({ salaryFrequency: v })}
            >
              <SelectTrigger
                className={cn(
                  "h-11 w-[min(100%,120px)]",
                  fe.salaryFrequency && "border-destructive",
                )}
                aria-invalid={!!fe.salaryFrequency}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALARY_FREQUENCY_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fe.salaryFrequency ? (
              <p className="text-xs text-destructive">{fe.salaryFrequency}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Select
              value={draft.salaryCurrency}
              onValueChange={(v) => patch({ salaryCurrency: v })}
            >
              <SelectTrigger className="h-11 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              inputMode="numeric"
              value={draft.salaryMin}
              placeholder="Min"
              onChange={(e) => patch({ salaryMin: e.target.value })}
              className={cn("h-11 min-w-[120px] flex-1", fe.salaryMin && "border-destructive")}
              aria-invalid={!!fe.salaryMin}
            />
            <Input
              type="text"
              inputMode="numeric"
              value={draft.salaryMax}
              placeholder="Max"
              onChange={(e) => patch({ salaryMax: e.target.value })}
              className={cn("h-11 min-w-[120px] flex-1", fe.salaryMax && "border-destructive")}
              aria-invalid={!!fe.salaryMax}
            />
            <Button
              type="button"
              variant="link"
              className="mb-2 h-auto px-0 text-brand-600 dark:text-brand-400"
              onClick={() => patch({ salaryMin: "", salaryMax: "" })}
            >
              X Clear
            </Button>
          </div>
         {(draft.salaryMin && draft.salaryMax) && <p className="text-sm font-medium text-foreground">{lpaSummary}</p>}
          {(fe.salaryMin || fe.salaryMax) && (
            <p className="text-xs text-destructive">{fe.salaryMin ?? fe.salaryMax}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Salary range helps candidates filter roles. Required for better sourcing quality.
          </p>

          <Separator className="my-2" />

          <div className="space-y-3">
            <Label className={labelBrand}>
              Work arrangement <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={draft.workArrangement}
              onValueChange={(v) => patch({ workArrangement: v as WorkArrangement })}
              className={cn("flex flex-wrap gap-4", fe.workArrangement && "rounded-md ring-1 ring-destructive")}
              aria-invalid={!!fe.workArrangement}
            >
              {(
                [
                  ["on-site", "On-site"],
                  ["hybrid", "Hybrid"],
                  ["remote", "Remote"],
                ] as const
              ).map(([val, lab]) => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`work-${val}`} />
                  <Label htmlFor={`work-${val}`} className="cursor-pointer font-normal">
                    {lab}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {fe.workArrangement ? (
              <p className="text-xs text-destructive">{fe.workArrangement}</p>
            ) : null}
          </div>

          {draft.workArrangement === "hybrid" ? (
            <div className="ml-0 space-y-4 border-l-2 border-brand-200 pl-4 dark:border-brand-800">
              <div className="space-y-2">
                <Label className={labelBrand}>Policy</Label>
                <Input
                  placeholder="Ex. 3 days/week WFH"
                  value={draft.hybridPolicy}
                  onChange={(e) => patch({ hybridPolicy: e.target.value })}
                  className={inputFull}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelBrand}>
                  Location(s) <span className="text-destructive">*</span>
                </Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-xs">
                    India
                  </span>
                  {draft.locations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-900 dark:border-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    >
                      {loc}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="h-5 w-5 hover:bg-brand-100 dark:hover:bg-brand-500/30"
                        onClick={() =>
                          patch({
                            locations: draft.locations.filter((l) => l !== loc),
                          })
                        }
                        aria-label={`Remove ${loc}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={cityDraft}
                    onChange={(e) => setCityDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                    placeholder="Add city..."
                    className={cn(inputFull, "pl-10", fe.locations && "border-destructive")}
                    aria-invalid={!!fe.locations}
                  />
                </div>
                {fe.locations ? (
                  <p className="text-xs text-destructive">{fe.locations}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Job content">
        <div className="space-y-6">
          <SimpleRichTextField
            required
            label="Job summary"
            value={draft.jobSummary}
            onChange={(v) => patch({ jobSummary: v })}
            rows={5}
            error={fe.jobSummary}
          />
          <SimpleRichTextField
            label="Responsibilities"
            value={draft.responsibilities}
            onChange={(v) => patch({ responsibilities: v })}
            rows={7}
          />
          <SimpleRichTextField
            label="Perks & benefits"
            value={draft.perks}
            onChange={(v) => patch({ perks: v })}
            rows={8}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Candidate Requirements">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={labelBrand}>
              Skills <span className="text-destructive">*</span>
            </Label>
            <SkillSearchInput
              existingNames={draft.skills.map((s) => s.name)}
              onSelectSkill={addSkill}
              inputClassName={cn(inputFull, fe.skills && "border-destructive")}
            />
            {fe.skills ? (
              <p className="text-xs text-destructive">{fe.skills}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Click the star icon to mark the skill as mandatory. Else, it is good-to-have.
            </p>
            <div className="flex flex-wrap gap-2">
              {draft.skills.map((s) => (
                <span
                  key={s.id}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    s.mandatory
                      ? "border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-600 dark:bg-brand-500/15 dark:text-brand-100"
                      : "border-border bg-muted text-foreground"
                  }`}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="h-5 w-5"
                    onClick={() => setSkillMandatory(s.id, !s.mandatory)}
                    title={s.mandatory ? "Mandatory" : "Good-to-have"}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${s.mandatory ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`}
                    />
                  </Button>
                  {s.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="h-5 w-5"
                    onClick={() => removeSkill(s.id)}
                    aria-label={`Remove ${s.name}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelBrand}>Minimum education qualification</Label>
              <Select
                value={draft.minEducation === "" ? "__none__" : draft.minEducation}
                onValueChange={(v) => patch({ minEducation: v === "__none__" ? "" : v })}
              >
                <SelectTrigger className={inputFull}>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select qualification</SelectItem>
                  <SelectItem value="High school">High school</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={labelBrand}>Course / Specialization</Label>
              <Input
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={draft.courseSpecialization}
                onChange={(e) => patch({ courseSpecialization: e.target.value })}
                className={inputFull}
              />
            </div>
          </div>

          <SimpleRichTextField
            label="Additional requirements"
            value={draft.additionalRequirements}
            onChange={(v) => patch({ additionalRequirements: v })}
            rows={5}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Additional Info">
        <div className="space-y-4">
          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            <div className="min-w-0 space-y-2">
              <Label className={labelBrand}>Status</Label>
              <Select value={draft.status} onValueChange={(v) => patch({ status: v })}>
                <SelectTrigger className={inputFull}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <Label className={labelBrand}>Application deadline</Label>
              <DatePicker
                value={draft.applicationDeadline ?? ""}
                onChange={(v) => patch({ applicationDeadline: v })}
                className={inputFull}
                placeholder="Pick a date"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label className={labelBrand}>Employment start date</Label>
              <DatePicker
                value={draft.employmentStartDate ?? ""}
                onChange={(v) => patch({ employmentStartDate: v })}
                className={inputFull}
                placeholder="Pick a date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={labelBrand}>
              Key callout  <span className="text-sm font-normal text-muted-foreground">(will be highlighted at the top of the post)</span>
            </Label>
            <Input
              value={draft.keyCallout}
              placeholder="Do not contact us via LinkedIn or email. Just apply here"
              onChange={(e) => patch({ keyCallout: e.target.value })}
              className={inputFull}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelBrand}>Google Maps URL of office location</Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={draft.mapsUrl}
              onChange={(e) => patch({ mapsUrl: e.target.value })}
              className={cn(inputFull, fe.mapsUrl && "border-destructive")}
              aria-invalid={!!fe.mapsUrl}
            />
            {fe.mapsUrl ? (
              <p className="text-xs text-destructive">{fe.mapsUrl}</p>
            ) : null}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
