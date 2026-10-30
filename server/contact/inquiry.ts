import { z } from "zod";
import { businessSegments, type Inquiry } from "@/features/contact/model";
const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (v) => !/[\u0000-\u001f\u007f]/.test(v),
      "Use a single line of text.",
    );
export const inquirySchema = z
  .object({
    name: singleLine(100).min(2),
    email: singleLine(254).email(),
    company: singleLine(160).min(2),
    segment: z.enum(businessSegments),
    region: singleLine(80),
    capacity: singleLine(30).refine(
      (v) =>
        !v || /^(?:[1-9]\d{0,6}(?:\.\d{1,2})?|0\.(?:0[1-9]|[1-9]\d?))$/.test(v),
      "Enter a positive quantity in kg, or leave this blank.",
    ),
    message: z
      .string()
      .trim()
      .max(2000)
      .refine(
        (v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),
        "Unsupported characters.",
      ),
    consent: z.literal(true),
    website: z.literal(""),
  })
  .strict();
export const INQUIRY_RECIPIENT = "team@syncrate.org";
export function inquiryText(data: Inquiry) {
  return [
    "sySGLD business inquiry",
    "",
    `Name: ${data.name}`,
    `Work email: ${data.email}`,
    `Company: ${data.company}`,
    `Business segment: ${data.segment}`,
    `Region: ${data.region || "Not provided"}`,
    `Indicative gold capacity: ${data.capacity ? data.capacity + " kg" : "Not provided"}`,
    "",
    "Message:",
    data.message || "Not provided",
    "",
    "The sender agreed to be contacted about this inquiry.",
  ].join("\n");
}
export function contactOriginAllowed(
  origin: string | null,
  env: Record<string, string | undefined>,
) {
  if (!origin) return false;
  if (["https://syncrate.org", "https://www.syncrate.org"].includes(origin))
    return true;
  if (["local", "test"].includes(env.APP_ENV ?? ""))
    return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (env.APP_ENV !== "preview" || env.VERCEL_ENV !== "preview") return false;
  return [env.VERCEL_URL, env.VERCEL_BRANCH_URL].some(
    (host) =>
      host &&
      /^[a-z0-9-]+\.vercel\.app$/.test(host) &&
      origin === `https://${host}`,
  );
}
async function boundedJson(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .match(/^application\/json$/i)
  )
    throw new Error("media");
  if (Number(request.headers.get("content-length")) > 16384)
    throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("json");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
export type InquiryDelivery = (data: Inquiry) => Promise<void>;
export async function handleInquiry(
  request: Request,
  delivery: InquiryDelivery,
  env: Record<string, string | undefined> = process.env,
) {
  const json = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  if (!contactOriginAllowed(request.headers.get("origin"), env))
    return json({ error: "This request could not be accepted." }, 403);
  if (
    ["production", "preview"].includes(env.APP_ENV ?? "") &&
    env.CONTACT_RATE_LIMIT_READY !== "true"
  )
    return json(
      { error: "Please try again later or email team@syncrate.org." },
      503,
    );
  let value: unknown;
  try {
    value = await boundedJson(request);
  } catch (error) {
    return json(
      { error: "Please check your form and try again." },
      error instanceof Error && error.message === "size" ? 413 : 400,
    );
  }
  const parsed = inquirySchema.safeParse(value);
  if (!parsed.success)
    return json(
      { error: "Please check the required fields and try again." },
      400,
    );
  try {
    await delivery(parsed.data);
    return json({ accepted: true });
  } catch {
    return json(
      {
        error:
          "Your inquiry could not be sent. Please try again or email team@syncrate.org.",
      },
      503,
    );
  }
}
