import { config as loadEnvironment } from "dotenv";
import { getPayload } from "payload";
loadEnvironment({ path: ".env.local", quiet: true });
const { readServerEnvironment } = await import("../server/environment");
const env = readServerEnvironment();
if (
  env.APP_ENV !== "preview" ||
  env.CMS_AUTH_PROVIDER !== "supabase" ||
  process.env.CMS_PROVISION_STAFF !== "confirm-preview"
)
  throw new Error(
    "Preview provisioning requires explicit operator confirmation.",
  );
const subject = process.env.CMS_PROVISION_SUBJECT;
const email = process.env.CMS_PROVISION_EMAIL;
if (
  !subject ||
  !/^[0-9a-f-]{36}$/i.test(subject) ||
  !email ||
  !email.includes("@")
)
  throw new Error(
    "Supply the verified provider subject and invitation email in the operator environment.",
  );
const config = (await import("../payload.config")).default;
const cms = await getPayload({ config });
try {
  const existing = await cms.count({
    collection: "staff-users",
    overrideAccess: true,
  });
  if (existing.totalDocs !== 0)
    throw new Error(
      "First administrator provisioning requires an empty staff collection.",
    );
  await cms.create({
    collection: "staff-users",
    overrideAccess: true,
    context: { bootstrap: true },
    data: {
      email,
      name: "Syncrate administrator",
      identitySubject: subject,
      role: "admin",
      active: true,
    },
  });
  console.log(
    "Preview administrator provisioned; no credentials were printed.",
  );
} finally {
  await cms.destroy();
}
process.exit(0);
