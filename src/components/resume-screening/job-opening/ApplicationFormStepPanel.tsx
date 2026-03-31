"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  applicationFormSchema,
  customFieldItemSchema,
  screeningItemSchema,
} from "@/features/job-opening/schemas/application-form.schema";
import type {
  ApplicationFormState,
  AppFieldToggle,
  CustomFieldType,
  ScreeningQuestionType,
} from "@/types/application-form";
import {
  APPLICATION_FORM_CUSTOM_FIELDS_MAX,
  APPLICATION_FORM_SCREENING_MAX,
  newEntityId,
  SCREENING_OBJECTIVE_OPTIONS_MAX,
} from "@/types/application-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChevronDown, Plus, Star, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldPath,
  type Resolver,
} from "react-hook-form";
import type { ValidationError } from "yup";

const BASIC_LABELS: Record<keyof ApplicationFormState["basicInfo"], string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone Number",
  currentCity: "Current City",
  linkedIn: "LinkedIn Profile",
  yearOfBirth: "Year of Birth",
};

const PRO_LABELS: Record<keyof ApplicationFormState["professionalInfo"], string> = {
  workExperience: "Work Experience",
  education: "Educational Background",
  skills: "Skills",
  projectsCertifications: "Projects/Certifications",
};

const ADD_LABELS: Record<keyof ApplicationFormState["additionalInfo"], string> = {
  cvResume: "CV/Resume",
  noticePeriod: "Notice Period",
  salaryExpectation: "Salary Expectation Range",
  portfolioUrls: "Portfolio URLs",
  languagesKnown: "Languages Known",
  locationsOpenTo: "Locations Open To",
};

function FieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AppFieldToggle;
  onChange: (next: AppFieldToggle) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-transparent py-1.5 pr-2 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={value.enabled}
        onCheckedChange={(c) => {
          const enabled = c === true;
          onChange({ enabled, mandatory: enabled ? value.mandatory : false });
        }}
      />
      <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
      <button
        type="button"
        disabled={!value.enabled}
        onClick={() => onChange({ ...value, mandatory: !value.mandatory })}
        className="shrink-0 rounded p-0.5 text-amber-500 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        title={value.mandatory ? "Mandatory for candidates" : "Mark as mandatory"}
        aria-label={value.mandatory ? "Mandatory" : "Optional"}
      >
        <Star
          className={cn(
            "h-4 w-4",
            value.enabled && value.mandatory
              ? "fill-amber-500 text-amber-500"
              : "text-muted-foreground",
          )}
        />
      </button>
    </div>
  );
}

function CollapsibleBlock({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-xs">{description}</CardDescription>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {open ? "Collapse" : "Expand"}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
            />
          </button>
        </div>
      </CardHeader>
      {open ? <CardContent className="space-y-1 pt-0">{children}</CardContent> : null}
    </Card>
  );
}

function formErrorText(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  if ("message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return null;
}

type ApplicationFormStepPanelProps = {
  applicationForm: ApplicationFormState;
  onChange: (next: ApplicationFormState) => void;
};

export default function ApplicationFormStepPanel({
  applicationForm,
  onChange,
}: ApplicationFormStepPanelProps) {
  const [customDraft, setCustomDraft] = useState<{
    name: string;
    type: CustomFieldType;
    placeholder: string;
  } | null>(null);
  const [customDraftError, setCustomDraftError] = useState<string | null>(null);
  const [screenDraft, setScreenDraft] = useState<{
    question: string;
    type: ScreeningQuestionType;
    placeholder: string;
    objectiveOptions: string[];
  } | null>(null);
  const [screenDraftError, setScreenDraftError] = useState<string | null>(null);

  const lastEmitted = useRef<string | null>(null);

  const form = useForm<ApplicationFormState>({
    defaultValues: applicationForm,
    resolver: yupResolver(applicationFormSchema) as Resolver<ApplicationFormState>,
    mode: "onChange",
  });

  const { control, reset, watch, getValues, formState } = form;
  const { errors } = formState;

  const customFA = useFieldArray({ control, name: "customFields" });
  const screeningFA = useFieldArray({ control, name: "screeningQuestions" });

  const customFieldsW = useWatch({ control, name: "customFields" });
  const screeningW = useWatch({ control, name: "screeningQuestions" });

  useEffect(() => {
    const sub = watch((data) => {
      const s = JSON.stringify(data);
      lastEmitted.current = s;
      onChange(data as ApplicationFormState);
    });
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  useEffect(() => {
    const incoming = JSON.stringify(applicationForm);
    const current = JSON.stringify(getValues());
    if (incoming === current) return;
    if (lastEmitted.current === incoming) return;
    reset(applicationForm);
  }, [applicationForm, reset, getValues]);

  const saveCustomField = () => {
    setCustomDraftError(null);
    if (!customDraft) return;
    if ((customFieldsW?.length ?? 0) >= APPLICATION_FORM_CUSTOM_FIELDS_MAX) return;
    const row = {
      id: newEntityId("cf"),
      name: customDraft.name.trim(),
      type: customDraft.type,
      placeholder: customDraft.placeholder.trim() || undefined,
    };
    try {
      customFieldItemSchema.validateSync(row);
      customFA.append(row);
      setCustomDraft(null);
    } catch (e) {
      const msg = (e as ValidationError).message ?? "Invalid custom field";
      setCustomDraftError(msg);
    }
  };

  const saveScreening = () => {
    setScreenDraftError(null);
    if (!screenDraft) return;
    if ((screeningW?.length ?? 0) >= APPLICATION_FORM_SCREENING_MAX) return;
    const objectiveOptionsFiltered =
      screenDraft.type === "objective"
        ? screenDraft.objectiveOptions.map((s) => s.trim()).filter(Boolean)
        : [];
    const row = {
      id: newEntityId("sq"),
      question: screenDraft.question.trim(),
      type: screenDraft.type,
      placeholder: screenDraft.placeholder.trim() || undefined,
      ...(screenDraft.type === "objective"
        ? { objectiveOptions: objectiveOptionsFiltered }
        : {}),
    };
    try {
      screeningItemSchema.validateSync(row);
      screeningFA.append(row);
      setScreenDraft(null);
    } catch (e) {
      const msg = (e as ValidationError).message ?? "Invalid screening question";
      setScreenDraftError(msg);
    }
  };

  const arrayRootMessage =
    formErrorText(errors.customFields) ?? formErrorText(errors.screeningQuestions);
  const rootSchemaMessage = formErrorText(errors.root);

  const renderToggleBlock = (
    title: string,
    keys: readonly string[],
    labels: Record<string, string>,
    prefix: "basicInfo" | "professionalInfo" | "additionalInfo",
  ) => (
    <CollapsibleBlock title={title}>
      {keys.map((key) => {
        const name = `${prefix}.${key}` as FieldPath<ApplicationFormState>;
        return (
          <FormField
            key={key}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FieldRow
                  label={labels[key] ?? key}
                  value={field.value as AppFieldToggle}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </CollapsibleBlock>
  );

  return (
    <Form {...form}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select fields to enable them.{" "}
          <Star className="inline h-3.5 w-3.5 fill-amber-500 text-amber-500" /> starred fields
          are mandatory.
        </p>

        {arrayRootMessage || rootSchemaMessage ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {[rootSchemaMessage, arrayRootMessage].filter(Boolean).join(" ")}
          </p>
        ) : null}

        {renderToggleBlock(
          "Basic Info",
          Object.keys(BASIC_LABELS),
          BASIC_LABELS as Record<string, string>,
          "basicInfo",
        )}

        {renderToggleBlock(
          "Professional Info",
          Object.keys(PRO_LABELS),
          PRO_LABELS as Record<string, string>,
          "professionalInfo",
        )}

        {renderToggleBlock(
          "Additional Info",
          Object.keys(ADD_LABELS),
          ADD_LABELS as Record<string, string>,
          "additionalInfo",
        )}

        <CollapsibleBlock
          title={`Custom Fields (${customFieldsW?.length ?? 0} of ${APPLICATION_FORM_CUSTOM_FIELDS_MAX} max)`}
          description="Boolean, integer and date fields. Can be used for filtering."
        >
          <ul className="mb-3 space-y-2">
            {customFA.fields.map((field, index) => {
              const cf = customFieldsW?.[index];
              if (!cf) return null;
              return (
                <li
                  key={field.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{cf.name}</span>{" "}
                    <span className="text-muted-foreground">({cf.type})</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => customFA.remove(index)}
                  >
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>

          {customDraft ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
              {customDraftError ? (
                <p className="text-sm text-destructive">{customDraftError}</p>
              ) : null}
              <Input
                placeholder="Field name (e.g., Years in Management)"
                value={customDraft.name}
                onChange={(e) => setCustomDraft({ ...customDraft, name: e.target.value })}
              />
              <Select
                value={customDraft.type}
                onValueChange={(v) =>
                  setCustomDraft({ ...customDraft, type: v as CustomFieldType })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Placeholder text (optional)"
                value={customDraft.placeholder}
                onChange={(e) => setCustomDraft({ ...customDraft, placeholder: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveCustomField}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCustomDraft(null);
                    setCustomDraftError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={(customFieldsW?.length ?? 0) >= APPLICATION_FORM_CUSTOM_FIELDS_MAX}
              onClick={() =>
                setCustomDraft({ name: "", type: "integer", placeholder: "" })
              }
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border py-3 text-sm font-medium text-brand-600 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400"
            >
              + Add Custom Field
            </button>
          )}
        </CollapsibleBlock>

        <CollapsibleBlock
          title={`Screening Questions (${screeningW?.length ?? 0} of ${APPLICATION_FORM_SCREENING_MAX} max)`}
          description="Free text and objective questions. Can filter based on objective questions in the dashboard."
        >
          <ul className="mb-3 space-y-2">
            {screeningFA.fields.map((field, index) => {
              const sq = screeningW?.[index];
              if (!sq) return null;
              return (
                <li
                  key={field.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{sq.question}</span>{" "}
                    <span className="text-muted-foreground">
                      ({sq.type}
                      {sq.type === "objective" && (sq.objectiveOptions?.length ?? 0) > 0
                        ? ` · ${sq.objectiveOptions?.length} options`
                        : ""}
                      )
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive"
                    onClick={() => screeningFA.remove(index)}
                  >
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>

          {screenDraft ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
              {screenDraftError ? (
                <p className="text-sm text-destructive">{screenDraftError}</p>
              ) : null}
              <Textarea
                placeholder="Question (e.g., Why do you want to work here?)"
                value={screenDraft.question}
                onChange={(e) => setScreenDraft({ ...screenDraft, question: e.target.value })}
                rows={3}
              />
              <Select
                value={screenDraft.type}
                onValueChange={(v) => {
                  const t = v as ScreeningQuestionType;
                  setScreenDraft((prev) => {
                    if (!prev) return prev;
                    if (t === "objective" && prev.objectiveOptions.length < 2) {
                      return { ...prev, type: t, objectiveOptions: ["", ""] };
                    }
                    if (t === "text") {
                      return { ...prev, type: t, objectiveOptions: [] };
                    }
                    return { ...prev, type: t };
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="objective">Objective</SelectItem>
                </SelectContent>
              </Select>
              {screenDraft.type === "text" ? (
                <Input
                  placeholder="Placeholder text (optional, shown in preview)"
                  value={screenDraft.placeholder}
                  onChange={(e) => setScreenDraft({ ...screenDraft, placeholder: e.target.value })}
                />
              ) : (
                <>
                  <Input
                    placeholder="Hint text (optional, shown under the question in preview)"
                    value={screenDraft.placeholder}
                    onChange={(e) => setScreenDraft({ ...screenDraft, placeholder: e.target.value })}
                  />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Answer options</p>
                    <p className="text-xs text-muted-foreground">
                      Add at least two choices. Candidates pick one in the form.
                    </p>
                    {screenDraft.objectiveOptions.map((opt, optIdx) => (
                      <div key={optIdx} className="flex gap-2">
                        <Input
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...screenDraft.objectiveOptions];
                            next[optIdx] = e.target.value;
                            setScreenDraft({ ...screenDraft, objectiveOptions: next });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          disabled={screenDraft.objectiveOptions.length <= 2}
                          onClick={() => {
                            setScreenDraft({
                              ...screenDraft,
                              objectiveOptions: screenDraft.objectiveOptions.filter(
                                (_, i) => i !== optIdx,
                              ),
                            });
                          }}
                          aria-label="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={
                        screenDraft.objectiveOptions.length >= SCREENING_OBJECTIVE_OPTIONS_MAX
                      }
                      onClick={() =>
                        setScreenDraft({
                          ...screenDraft,
                          objectiveOptions: [...screenDraft.objectiveOptions, ""],
                        })
                      }
                    >
                      <Plus className="mr-1 inline h-3.5 w-3.5" />
                      Add option
                    </Button>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveScreening}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setScreenDraft(null);
                    setScreenDraftError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={(screeningW?.length ?? 0) >= APPLICATION_FORM_SCREENING_MAX}
              onClick={() =>
                setScreenDraft({
                  question: "",
                  type: "text",
                  placeholder: "",
                  objectiveOptions: [],
                })
              }
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border py-3 text-sm font-medium text-brand-600 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400"
            >
              + Add Screening Question
            </button>
          )}
        </CollapsibleBlock>
      </div>
    </Form>
  );
}
