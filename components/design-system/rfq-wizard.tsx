"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, Shield, Upload } from "@/components/design-system/icons";
import { Button, CornerTicks, IndexMark, MonoLabel, StatusTag } from "@/components/design-system/primitives";

const steps = [
  { label: "Files", detail: "CAD, drawing, BOM" },
  { label: "Part details", detail: "Name, revision" },
  { label: "Requirements", detail: "Material, critical needs" },
  { label: "Contact", detail: "Who to reach" },
  { label: "Review", detail: "Confirm the intake" },
];

type RfqDraft = {
  files: File[];
  partName: string;
  context: string;
  revision: string;
  quantity: string;
  targetDate: string;
  function: string;
  material: string;
  finish: string;
  requirements: string;
  email: string;
  company: string;
  contactNote: string;
  website: string; // honeypot -- left empty by real customers
};

const initialDraft: RfqDraft = {
  files: [], partName: "", context: "", revision: "", quantity: "", targetDate: "", function: "",
  material: "", finish: "", requirements: "", email: "", company: "", contactNote: "", website: "",
};

// Set at build time for the static GitHub Pages preview (see
// .github/workflows/frontend-preview.yml), which ships app/rfq as static
// HTML but has no app/api route to submit to (Route Handlers with a
// dynamic POST body cannot be statically exported). The real deployment
// (Vercel or equivalent Node runtime) leaves this unset, so submission is
// live there.
const IS_STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RfqWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RfqDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [result, setResult] = useState<{ referenceId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateDraft = <K extends keyof RfqDraft>(key: K, value: RfqDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const addFiles = (incoming: FileList | null) => { if (incoming) updateDraft("files", [...draft.files, ...Array.from(incoming)]); };
  const removeFile = (name: string, lastModified: number) =>
    setDraft((current) => ({ ...current, files: current.files.filter((f) => !(f.name === name && f.lastModified === lastModified)) }));

  function validateStep(index: number): string | null {
    if (index === 0 && !draft.partName.trim() && !draft.context.trim() && draft.files.length === 0) {
      return "Add a file, or tell us what you're making, before continuing.";
    }
    if (index === 3) {
      if (!draft.email.trim() || !EMAIL_RE.test(draft.email)) return "A valid work email is required.";
    }
    return null;
  }

  function goToStep(next: number) {
    setStepError(null);
    setStep(next);
  }

  async function handleSubmit() {
    const err = validateStep(3);
    if (err) {
      setStepError(err);
      return;
    }
    if (IS_STATIC_PREVIEW) {
      setSubmitError(
        "This is a static preview build with no live backend. Open the deployed application (see the PR's preview link) to submit a real RFQ.",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.set("partName", draft.partName);
      form.set("context", draft.context);
      form.set("revision", draft.revision);
      form.set("quantity", draft.quantity);
      form.set("targetDate", draft.targetDate);
      form.set("partFunction", draft.function);
      form.set("material", draft.material);
      form.set("finish", draft.finish);
      form.set("requirements", draft.requirements);
      form.set("contactEmail", draft.email);
      form.set("contactCompany", draft.company);
      form.set("contactNote", draft.contactNote);
      form.set("website", draft.website);
      form.set("sourcePagePath", "/rfq");
      for (const file of draft.files) form.append("files", file);

      const response = await fetch("/api/rfq", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(body?.error || "Something went wrong submitting your RFQ. Please try again.");
        return;
      }
      setResult({ referenceId: body.referenceId });
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (step === steps.length - 1) {
      void handleSubmit();
      return;
    }
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    goToStep(Math.min(steps.length - 1, step + 1));
  }

  return (
    <div className="mx-console">
      <aside className="mx-console__rail">
        <MonoLabel className="mx-mono-label--on-console">RFQ INTAKE</MonoLabel>
        <h1 className="mx-console__title">Start a production relationship, not a form submission.</h1>
        <p className="mx-console__lede">
          Upload the current engineering package first. The intake separates what is known
          from what still needs a decision before a route or a quote is proposed.
        </p>

        <ol className="mx-console__steps" aria-label="RFQ progress">
          {steps.map((item, index) => (
            <li key={item.label} className={index === step ? "mx-console__step mx-console__step--active" : index < step ? "mx-console__step mx-console__step--done" : "mx-console__step"}>
              <button type="button" onClick={() => index <= step && !result && goToStep(index)} disabled={index > step || Boolean(result)}>
                <IndexMark value={index < step ? "✓" : String(index + 1).padStart(2, "0")} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mx-console__trust">
          <Shield size={18} />
          <p>Files are used for review and route planning only. Nothing is released to a supplier until requirements are confirmed.</p>
          <ul>
            <li><Check size={13} /> Revision and file names stay visible</li>
            <li><Check size={13} /> Missing requirements are surfaced, not guessed</li>
            <li><Check size={13} /> Inspection is scoped to the drawing</li>
          </ul>
        </div>
      </aside>

      <section className="mx-console__stage">
        {!result ? (
          <div className="mx-console__card">
            <CornerTicks />
            <div className="mx-console__card-head">
              <MonoLabel>STEP {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</MonoLabel>
              <h2>{steps[step].label}</h2>
            </div>

            {IS_STATIC_PREVIEW && (
              <div className="mx-form-error" role="note">
                <AlertTriangle size={14} /> Static preview build — this form doesn&apos;t have a live backend here. See the PR for the deployed preview link to submit a real RFQ.
              </div>
            )}

            {step === 0 && (
              <div className="mx-console__form">
                <button type="button" className="mx-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}>
                  <CornerTicks />
                  <Upload size={26} />
                  <strong>Drop CAD, drawings, or a BOM here</strong>
                  <span>STEP · STP · IGES · X_T · PDF · ZIP · XLSX</span>
                  <span className="mx-textlink">Choose files</span>
                  <input ref={inputRef} type="file" multiple hidden onChange={(event) => addFiles(event.target.files)} accept=".step,.stp,.iges,.igs,.x_t,.x_b,.pdf,.zip,.xlsx,.xls,.csv" />
                </button>
                {draft.files.length > 0 && (
                  <div className="mx-file-chips" aria-live="polite">
                    {draft.files.map((file) => (
                      <span key={`${file.name}-${file.lastModified}`}>
                        <Check size={13} /> {file.name}
                        <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(file.name, file.lastModified)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <label>What are you making?
                  <input value={draft.partName} onChange={(event) => updateDraft("partName", event.target.value)} placeholder="e.g. robot joint housing, actuator bracket" />
                </label>
                <label>Context or open questions
                  <textarea value={draft.context} onChange={(event) => updateDraft("context", event.target.value)} placeholder="Tell us what is critical, what is unknown, and when you need the parts." />
                </label>
                {/* Honeypot: hidden from real customers via CSS + aria, never shown, never focusable. */}
                <label className="mx-visually-hidden" aria-hidden="true">
                  Website
                  <input tabIndex={-1} autoComplete="off" value={draft.website} onChange={(event) => updateDraft("website", event.target.value)} />
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="mx-console__form">
                <div className="mx-console__form-grid">
                  <label>Part name
                    <input value={draft.partName} onChange={(event) => updateDraft("partName", event.target.value)} placeholder="Part or assembly name" />
                  </label>
                  <label>Revision
                    <input value={draft.revision} onChange={(event) => updateDraft("revision", event.target.value)} placeholder="e.g. Rev B" />
                  </label>
                </div>
                <div className="mx-console__form-grid">
                  <label>Quantity
                    <input value={draft.quantity} onChange={(event) => updateDraft("quantity", event.target.value)} type="number" min={1} placeholder="Prototype / production quantity" />
                  </label>
                  <label>Target date
                    <input value={draft.targetDate} onChange={(event) => updateDraft("targetDate", event.target.value)} type="date" />
                  </label>
                </div>
                <label>Part function
                  <textarea value={draft.function} onChange={(event) => updateDraft("function", event.target.value)} placeholder="What does the part do in the product?" />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="mx-console__form">
                <div className="mx-console__form-grid">
                  <label>Material
                    <select value={draft.material} onChange={(event) => updateDraft("material", event.target.value)}>
                      <option value="">Select or leave for review</option>
                      <option>Aluminium</option>
                      <option>Steel</option>
                      <option>Stainless steel</option>
                      <option>Source required</option>
                    </select>
                  </label>
                  <label>Finish
                    <select value={draft.finish} onChange={(event) => updateDraft("finish", event.target.value)}>
                      <option value="">Select or leave for review</option>
                      <option>As-machined</option>
                      <option>Anodize</option>
                      <option>Per drawing</option>
                      <option>Source required</option>
                    </select>
                  </label>
                </div>
                <label>Critical requirements
                  <textarea value={draft.requirements} onChange={(event) => updateDraft("requirements", event.target.value)} placeholder="Datums, interfaces, tolerances, inspection, or finish requirements." />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="mx-console__form">
                <div className="mx-console__form-grid">
                  <label>Work email *
                    <input value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} type="email" required placeholder="you@company.com" />
                  </label>
                  <label>Company
                    <input value={draft.company} onChange={(event) => updateDraft("company", event.target.value)} placeholder="Company name" />
                  </label>
                </div>
                <label>Preferred contact note
                  <textarea value={draft.contactNote} onChange={(event) => updateDraft("contactNote", event.target.value)} placeholder="Anything we should know before reviewing the package?" />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="mx-console__review">
                <div className="mx-console__review-head">
                  <MonoLabel>REVIEW</MonoLabel>
                  <StatusTag tone="evidence">PACKAGE INTAKE</StatusTag>
                </div>
                <dl>
                  <div><dt>Files</dt><dd>{draft.files.length ? draft.files.map((file) => file.name).join(", ") : "No files yet"}</dd></div>
                  <div><dt>Part / revision</dt><dd>{draft.partName || "Not specified"} · {draft.revision || "Revision open"}</dd></div>
                  <div><dt>Quantity / date</dt><dd>{draft.quantity || "Open quantity"} · {draft.targetDate || "Open date"}</dd></div>
                  <div><dt>Material / finish</dt><dd>{draft.material || "Source required"} · {draft.finish || "Source required"}</dd></div>
                  <div><dt>Contact</dt><dd>{draft.company || "Company open"} · {draft.email || "Email open"}</dd></div>
                  <div><dt>Acceptance</dt><dd>Drawing-specific</dd></div>
                </dl>
                <p>Submitting creates an intake record. It does not release files to a supplier until the route and requirements are reviewed.</p>
              </div>
            )}

            {stepError && <div className="mx-form-error" role="alert"><AlertTriangle size={14} /> {stepError}</div>}
            {submitError && <div className="mx-form-error" role="alert"><AlertTriangle size={14} /> {submitError}</div>}

            <div className="mx-console__actions">
              <Button type="button" variant="ghost" onClick={() => goToStep(Math.max(0, step - 1))} disabled={step === 0 || submitting}>Back</Button>
              <Button type="button" onClick={handlePrimaryAction} disabled={submitting}>
                {submitting ? "Submitting…" : step === steps.length - 1 ? "Submit intake" : "Continue"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-console__card mx-console__success">
            <CornerTicks />
            <div className="mx-console__success-mark"><Check size={26} /></div>
            <MonoLabel>INTAKE RECEIVED</MonoLabel>
            <h2>We have the handoff.</h2>
            <p>Your package is ready for a technical review. A coordinator will return with the missing questions and a proposed manufacturing route.</p>
            <p className="mx-console__reference">
              Reference ID <strong>{result.referenceId}</strong>
            </p>
            <p className="mx-console__reference-note">Save this ID — quote it in any follow-up email about this submission.</p>
            <Button href="/">Return to Manufacturing OS</Button>
          </div>
        )}
      </section>
    </div>
  );
}
