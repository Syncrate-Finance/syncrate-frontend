import { test } from "node:test";
import assert from "node:assert/strict";
import {
  handleInquiry,
  inquirySchema,
  inquiryText,
  contactOriginAllowed,
  INQUIRY_RECIPIENT,
} from "../../server/contact/inquiry";
import { createTransport } from "nodemailer";
const valid = {
  name: "Test Visitor",
  email: "visitor@example.test",
  company: "Example Gold",
  segment: "Jeweler" as const,
  region: "UAE",
  capacity: "25.5",
  message: "A test financing inquiry.\nSecond line.",
  consent: true as const,
  website: "",
};
const req = (body: unknown, origin = "https://www.syncrate.org") =>
  new Request("https://www.syncrate.org/api/v1/inquiries", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const env = { APP_ENV: "production", CONTACT_RATE_LIMIT_READY: "true" };
test("inquiry validation requires consent and rejects header injection, unexpected destinations and spam fields", () => {
  assert.ok(inquirySchema.safeParse(valid).success);
  for (const patch of [
    { consent: false },
    { email: "victim@example.test\r\nBcc: victim2@example.test" },
    { name: "Example\r\nBcc: victim@example.test" },
    { website: "https://spam.test" },
    { to: "victim@example.test" },
    { message: "x".repeat(2001) },
    { capacity: "-1" },
    { capacity: "NaN" },
    { segment: "Unconfigured" },
    { name: "x" },
  ])
    assert.equal(
      inquirySchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
test("contact origins accept only known marketing and exact trusted preview hosts", () => {
  for (const origin of ["https://syncrate.org", "https://www.syncrate.org"])
    assert.ok(contactOriginAllowed(origin, env));
  for (const origin of [
    null,
    "null",
    "https://www.syncrate.org.attacker.test",
    "https://evil.vercel.app",
    "http://www.syncrate.org",
  ])
    assert.equal(contactOriginAllowed(origin, env), false);
  const preview = {
    APP_ENV: "preview",
    VERCEL_ENV: "preview",
    VERCEL_URL: "syncrate-unique.vercel.app",
  };
  assert.ok(
    contactOriginAllowed("https://syncrate-unique.vercel.app", preview),
  );
  assert.equal(
    contactOriginAllowed("https://syncrate-other.vercel.app", preview),
    false,
  );
});
test("SMTP acceptance is required before the form reports success", async () => {
  let completed = false;
  const r = await handleInquiry(
    req(valid),
    async (data) => {
      assert.equal(data.company, valid.company);
      await Promise.resolve();
      completed = true;
    },
    env,
  );
  assert.ok(completed);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { accepted: true });
  assert.equal(r.headers.get("cache-control"), "no-store");
  const failure = await handleInquiry(
    req(valid),
    async () => {
      throw Error("Test secret must not be returned");
    },
    env,
  );
  assert.equal(failure.status, 503);
  assert.ok(!(await failure.text()).includes("Test secret"));
});
test("invalid, oversized and cross-origin requests cannot trigger delivery", async () => {
  let sends = 0;
  const delivery = async () => {
    sends++;
  };
  assert.equal(
    (await handleInquiry(req({ ...valid, consent: false }), delivery, env))
      .status,
    400,
  );
  assert.equal(
    (await handleInquiry(req(valid, "https://attacker.test"), delivery, env))
      .status,
    403,
  );
  assert.equal(
    (
      await handleInquiry(
        req({ ...valid, message: "x".repeat(17000) }),
        delivery,
        env,
      )
    ).status,
    413,
  );
  const chunked = new Request("https://www.syncrate.org/api/v1/inquiries", {
    method: "POST",
    headers: {
      origin: "https://www.syncrate.org",
      "Content-Type": "application/json",
    },
    body: new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(17000));
        c.close();
      },
    }),
    duplex: "half",
  } as RequestInit);
  assert.equal((await handleInquiry(chunked, delivery, env)).status, 413);
  assert.equal(sends, 0);
});
test("hosted contact delivery stays closed until the platform rate limit is provisioned", async () => {
  let sends = 0;
  const r = await handleInquiry(
    req(valid),
    async () => {
      sends++;
    },
    { APP_ENV: "production" },
  );
  assert.equal(r.status, 503);
  assert.equal(sends, 0);
});
test("the message is plain text and is addressed only to the owner-selected inbox", async () => {
  assert.equal(INQUIRY_RECIPIENT, "team@syncrate.org");
  const transport = createTransport({
    streamTransport: true,
    buffer: true,
    newline: "unix",
  });
  const result = await transport.sendMail({
    from: "website@example.test",
    to: INQUIRY_RECIPIENT,
    replyTo: valid.email,
    subject: "sySGLD business inquiry",
    text: inquiryText(valid),
  });
  const message = result.message.toString();
  assert.ok(message.includes("To: team@syncrate.org"));
  assert.ok(message.includes("Content-Type: text/plain"));
  assert.ok(
    message.includes("Gold capacity") || message.includes("gold capacity"),
  );
  assert.ok(!message.includes("Bcc:"));
  transport.close();
});
