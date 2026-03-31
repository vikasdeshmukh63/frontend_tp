"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationFormState } from "@/types/application-form";
import {
  Briefcase,
  Code2,
  FileText,
  GraduationCap,
  MessageSquare,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";

function Req({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-destructive">*</span>
    </>
  );
}

type ApplicationFormPreviewProps = {
  applicationForm: ApplicationFormState;
};

export default function ApplicationFormPreview({ applicationForm }: ApplicationFormPreviewProps) {
  const b = applicationForm.basicInfo;
  const p = applicationForm.professionalInfo;
  const a = applicationForm.additionalInfo;

  const showBasic =
    b.firstName.enabled ||
    b.lastName.enabled ||
    b.email.enabled ||
    b.phone.enabled ||
    b.currentCity.enabled ||
    b.linkedIn.enabled ||
    b.yearOfBirth.enabled;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
        <p className="text-sm text-muted-foreground">How candidates will see your form</p>
      </div>

      <div className="space-y-4">
        {showBasic ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {b.firstName.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {b.firstName.mandatory ? <Req>First Name</Req> : "First Name"}
                  </Label>
                  <Input readOnly placeholder="John" className="h-10 bg-background" />
                </div>
              ) : null}
              {b.lastName.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {b.lastName.mandatory ? <Req>Last Name</Req> : "Last Name"}
                  </Label>
                  <Input readOnly placeholder="Doe" className="h-10 bg-background" />
                </div>
              ) : null}
              {b.email.enabled ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">
                    {b.email.mandatory ? <Req>Email</Req> : "Email"}
                  </Label>
                  <Input readOnly placeholder="john.doe@email.com" className="h-10 bg-background" />
                </div>
              ) : null}
              {b.phone.enabled ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">
                    {b.phone.mandatory ? <Req>Phone</Req> : "Phone"}
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted/40 px-2 text-xs">
                      <span aria-hidden>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <Input readOnly placeholder="98765 43210" className="h-10 flex-1 bg-background" />
                  </div>
                </div>
              ) : null}
              {b.currentCity.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {b.currentCity.mandatory ? <Req>Current City</Req> : "Current City"}
                  </Label>
                  <Input readOnly placeholder="City" className="h-10 bg-background" />
                </div>
              ) : null}
              {b.linkedIn.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {b.linkedIn.mandatory ? <Req>LinkedIn Profile</Req> : "LinkedIn Profile"}
                  </Label>
                  <Input readOnly placeholder="https://linkedin.com/in/..." className="h-10 bg-background" />
                </div>
              ) : null}
              {b.yearOfBirth.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {b.yearOfBirth.mandatory ? <Req>Year of Birth</Req> : "Year of Birth"}
                  </Label>
                  <Input readOnly placeholder="1995" className="h-10 bg-background" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {p.workExperience.enabled ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-base font-semibold">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {p.workExperience.mandatory ? <Req>Company</Req> : "Company"}
                  </Label>
                  <Select disabled>
                    <SelectTrigger className="h-10 w-full bg-background">
                      <SelectValue placeholder="Search company..." />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {p.workExperience.mandatory ? <Req>Job Title</Req> : "Job Title"}
                  </Label>
                  <Input readOnly placeholder="Software Engineer" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {p.workExperience.mandatory ? <Req>Start Date</Req> : "Start Date"}
                  </Label>
                  <Input readOnly placeholder="MM/YYYY" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date</Label>
                  <Input readOnly placeholder="MM/YYYY" className="h-10 bg-background" />
                  <p className="text-[11px] text-muted-foreground">(skip for current role)</p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Type</Label>
                  <Select disabled>
                    <SelectTrigger className="h-10 w-full max-w-xs bg-background">
                      <SelectValue placeholder="Full-time" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <button type="button" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                  <Plus className="mr-1 inline h-3.5 w-3.5" />
                  Add description
                </button>
                <button type="button" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                  <Plus className="mr-1 inline h-3.5 w-3.5" />
                  Add another experience
                </button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {p.education.enabled ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <GraduationCap className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-base font-semibold">Educational Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {p.education.mandatory ? <Req>Degree</Req> : "Degree"}
                  </Label>
                  <Select disabled>
                    <SelectTrigger className="h-10 w-full bg-background">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Field of Study (Optional)</Label>
                  <Input readOnly placeholder="Computer Science" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">
                    {p.education.mandatory ? <Req>Institution</Req> : "Institution"}
                  </Label>
                  <Input readOnly placeholder="Search or create institution..." className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Grade (Optional)</Label>
                  <Input readOnly placeholder="3.8 GPA, 87%" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {p.education.mandatory ? <Req>Start Year</Req> : "Start Year"}
                  </Label>
                  <Input readOnly placeholder="Select year" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Year (Optional)</Label>
                  <Input readOnly placeholder="Select year" className="h-10 bg-background" />
                </div>
              </div>
              <button type="button" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add another education
              </button>
            </CardContent>
          </Card>
        ) : null}

        {p.skills.enabled ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Code2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-base font-semibold">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">
                    {p.skills.mandatory ? <Req>Skill Name</Req> : "Skill Name"}
                  </Label>
                  <Input readOnly placeholder="Search skills..." className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Years</Label>
                  <Input readOnly defaultValue="0" className="h-10 w-20 bg-background" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Expertise
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    defaultValue={1}
                    disabled
                    className="w-full accent-brand-600"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>
              </div>
              <button type="button" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add Skill
              </button>
            </CardContent>
          </Card>
        ) : null}

        {p.projectsCertifications.enabled ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Projects / Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                placeholder="Describe projects or list certifications..."
                className="min-h-[100px] bg-background"
              />
            </CardContent>
          </Card>
        ) : null}

        {(a.cvResume.enabled ||
          a.noticePeriod.enabled ||
          a.salaryExpectation.enabled ||
          a.portfolioUrls.enabled ||
          a.languagesKnown.enabled ||
          a.locationsOpenTo.enabled) ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-base font-semibold">Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {a.cvResume.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.cvResume.mandatory ? <Req>CV / Resume</Req> : "CV / Resume"}
                  </Label>
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </div>
                </div>
              ) : null}
              {a.noticePeriod.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.noticePeriod.mandatory ? <Req>Notice Period (in days)</Req> : "Notice Period (in days)"}
                  </Label>
                  <Input readOnly defaultValue="30" className="h-10 max-w-xs bg-background" />
                </div>
              ) : null}
              {a.salaryExpectation.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.salaryExpectation.mandatory ? <Req>Salary Expectation</Req> : "Salary Expectation"}
                  </Label>
                  <div className="flex gap-2">
                    <Input readOnly placeholder="Min (LPA)" className="h-10 bg-background" />
                    <Input readOnly placeholder="Max (LPA)" className="h-10 bg-background" />
                  </div>
                </div>
              ) : null}
              {a.portfolioUrls.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.portfolioUrls.mandatory ? <Req>Portfolio URLs</Req> : "Portfolio URLs"}
                  </Label>
                  <Input readOnly placeholder="https://" className="h-10 bg-background" />
                </div>
              ) : null}
              {a.languagesKnown.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.languagesKnown.mandatory ? <Req>Languages Known</Req> : "Languages Known"}
                  </Label>
                  <Input readOnly placeholder="English, Hindi..." className="h-10 bg-background" />
                </div>
              ) : null}
              {a.locationsOpenTo.enabled ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {a.locationsOpenTo.mandatory ? <Req>Locations Open To</Req> : "Locations Open To"}
                  </Label>
                  <Input readOnly placeholder="Cities or remote" className="h-10 bg-background" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {applicationForm.customFields.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Custom Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationForm.customFields.map((cf) => {
                const ph = cf.placeholder?.trim();
                return (
                  <div key={cf.id} className="space-y-1.5">
                    <Label className="text-xs font-medium">{cf.name}</Label>
                    {cf.type === "boolean" ? (
                      <Select disabled>
                        <SelectTrigger className="h-10 w-full max-w-xs bg-background">
                          <SelectValue placeholder={ph || "Yes / No"} />
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    ) : cf.type === "date" ? (
                      <Input
                        readOnly
                        type="text"
                        placeholder={ph || "DD/MM/YYYY"}
                        className="h-10 bg-background"
                      />
                    ) : (
                      <Input
                        readOnly
                        type="number"
                        placeholder={ph || "0"}
                        className="h-10 bg-background"
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {applicationForm.screeningQuestions.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-base font-semibold">Screening Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationForm.screeningQuestions.map((sq) => {
                const hint = sq.placeholder?.trim();
                return (
                  <div key={sq.id} className="space-y-1.5">
                    <Label className="text-xs font-medium">{sq.question}</Label>
                    {sq.type === "objective" ? (
                      <div className="space-y-2">
                        {hint ? (
                          <p className="text-xs text-muted-foreground">{hint}</p>
                        ) : null}
                        {(sq.objectiveOptions ?? []).length > 0 ? (
                          <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Select one
                            </p>
                            {(sq.objectiveOptions ?? []).map((opt, i) => (
                              <label
                                key={`${sq.id}-opt-${i}`}
                                className="flex cursor-default items-center gap-2.5 text-sm"
                              >
                                <span
                                  className="flex h-4 w-4 shrink-0 rounded-full border border-border bg-background"
                                  aria-hidden
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                            Add at least two answer options in the builder to see choices here.
                          </p>
                        )}
                      </div>
                    ) : (
                      <Textarea
                        readOnly
                        placeholder={hint || "Your answer"}
                        className="min-h-[80px] bg-background"
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {!showBasic &&
        !p.workExperience.enabled &&
        !p.education.enabled &&
        !p.skills.enabled &&
        !p.projectsCertifications.enabled &&
        !a.cvResume.enabled &&
        !a.noticePeriod.enabled &&
        !a.salaryExpectation.enabled &&
        !a.portfolioUrls.enabled &&
        !a.languagesKnown.enabled &&
        !a.locationsOpenTo.enabled &&
        applicationForm.customFields.length === 0 &&
        applicationForm.screeningQuestions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Enable at least one field on the left to see a preview here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
