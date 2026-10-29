import { checkServerIdentity } from "node:tls";
import type { PoolConfig } from "pg";
import type { ServerEnvironment } from "./environment";

/** Retain CA and hostname validation when pg parses its connection URL. */
export function databasePoolOptions(
  env: ServerEnvironment,
): Pick<PoolConfig, "connectionString" | "max" | "ssl"> {
  if (!env.DATABASE_CA_CERT)
    return { connectionString: env.DATABASE_URL, max: 3 };

  const connection = new URL(env.DATABASE_URL);
  // pg replaces an explicit ssl object when URL SSL parameters are present.
  // Configuration validation still requires sslmode=verify-full on hosted URLs;
  // the equivalent TLS policy is applied explicitly below, with the selected CA.
  for (const option of [
    "ssl",
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "uselibpqcompat",
    "sslnegotiation",
  ])
    connection.searchParams.delete(option);
  return {
    connectionString: connection.href,
    max: 3,
    ssl: {
      ca: env.DATABASE_CA_CERT,
      rejectUnauthorized: true,
      checkServerIdentity,
    },
  };
}
