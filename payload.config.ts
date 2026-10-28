import { config as loadEnvironment } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { staffUsers } from "./collections/StaffUsers";
import { Pages, Articles } from "./collections/Content";
import { Media } from "./collections/Media";
import { AuditEvents } from "./collections/AuditEvents";
import { readServerEnvironment, serverOrigins } from "./server/environment";

loadEnvironment({ path: ".env.local", quiet: true });
const directory = path.dirname(fileURLToPath(import.meta.url));
const env = readServerEnvironment();

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  serverURL: env.SERVER_URL,
  routes: {
    admin: "/cms",
    api: "/cms-api",
    graphQL: "/cms-api/graphql",
    graphQLPlayground: "/cms-api/graphql-playground",
  },
  admin: {
    components: {
      logout: {
        Button: {
          path: "/components/cms/staff-logout",
          exportName: "StaffLogout",
          clientProps: { provider: env.CMS_AUTH_PROVIDER },
        },
      },
    },
    user: "staff-users",
    importMap: {
      baseDir: directory,
      importMapFile: path.join(directory, "app/(cms)/cms/importMap.ts"),
    },
    meta: { titleSuffix: " | Syncrate CMS" },
  },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL, max: 3 },
    schemaName: env.DATABASE_SCHEMA === "cms" ? "cms" : undefined,
    push: false,
    migrationDir: path.join(
      directory,
      env.DATABASE_SCHEMA === "cms" ? "migrations/cms" : "migrations",
    ),
  }),
  collections: [staffUsers(env), Pages, Articles, Media, AuditEvents],
  editor: lexicalEditor(),
  email: () => ({
    name: "delivery-not-configured",
    defaultFromAddress: "no-reply@syncrate.org",
    defaultFromName: "Syncrate",
    sendEmail: async () => {
      throw new Error("Email delivery is not configured for this environment.");
    },
  }),
  graphQL: { disable: true },
  csrf: serverOrigins(env),
  cors: [],
  upload: { limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true },
  typescript: { outputFile: path.join(directory, "payload-types.ts") },
  sharp,
});
