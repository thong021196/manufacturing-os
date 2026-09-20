import { NextResponse, type NextRequest } from "next/server";
import { getRfqStore } from "@/lib/rfq/store";
import { generateReferenceId } from "@/lib/rfq/reference";
import { checkSpam, isRateLimited, sanitizeText, validateFields, type RfqFormFields } from "@/lib/rfq/validate";
import { rfqMaxFileMb, rfqMaxFiles, rfqMaxTotalMb } from "@/lib/rfq/config";

// Route handlers with a dynamic POST body cannot be statically exported
// (see node_modules/next/dist/docs/.../static-exports.md — "Route Handlers
// that rely on Request" are unsupported under `output: "export"`). This
// route is only built for the real Next.js server/Vercel deployment; the
// static GitHub Pages preview build strips app/api entirely (see
// .github/workflows/frontend-preview.yml) and the RFQ page degrades to a
// "static preview" notice there instead of calling this endpoint.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readField(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? sanitizeText(v) : "";
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read submission. Please try again." }, { status: 400 });
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please wait a minute and try again." }, { status: 429 });
  }

  const fields: RfqFormFields = {
    partName: readField(form, "partName"),
    context: readField(form, "context"),
    revision: readField(form, "revision"),
    quantity: readField(form, "quantity"),
    targetDate: readField(form, "targetDate"),
    partFunction: readField(form, "partFunction"),
    material: readField(form, "material"),
    finish: readField(form, "finish"),
    requirements: readField(form, "requirements"),
    contactEmail: readField(form, "contactEmail"),
    contactCompany: readField(form, "contactCompany"),
    contactNote: readField(form, "contactNote"),
    // Never populated by the real form UI; a bot filling every input
    // typically fills this too.
    honeypot: readField(form, "website"),
    sourcePagePath: readField(form, "sourcePagePath") || "/rfq",
  };

  const incomingFiles = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const validationErrors = validateFields(fields, incomingFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors: validationErrors }, { status: 422 });
  }

  const spam = checkSpam(fields);
  if (spam.flagged) {
    // Return a normal-looking success response (don't tip off the bot)
    // but never persist honeypot-triggered submissions, and log server-side
    // for review.
    console.warn("[rfq] submission flagged as spam, not persisted", { ip, reasons: spam.reasons });
    return NextResponse.json({ referenceId: generateReferenceId(), spamSuppressed: true }, { status: 201 });
  }

  const fileBuffers = await Promise.all(
    incomingFiles.map(async (file) => ({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    })),
  );

  const referenceId = generateReferenceId();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to drop it from persistedFields
  const { honeypot, ...persistedFields } = fields;
  try {
    const store = await getRfqStore();
    const record = await store.createSubmission({
      referenceId,
      fields: persistedFields,
      files: fileBuffers,
    });
    return NextResponse.json({ referenceId: record.referenceId, submittedAt: record.createdAt }, { status: 201 });
  } catch (error) {
    console.error("[rfq] failed to persist submission", error);
    return NextResponse.json(
      { error: "We couldn't save your submission just now. Please try again, or email the files directly." },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed. Submit an RFQ via POST with multipart/form-data.",
      limits: { maxFiles: rfqMaxFiles(), maxFileMb: rfqMaxFileMb(), maxTotalMb: rfqMaxTotalMb() },
    },
    { status: 405 },
  );
}
