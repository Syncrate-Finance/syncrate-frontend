import { test } from "node:test";
import assert from "node:assert/strict";
import { rootCertificates, checkServerIdentity } from "node:tls";
import { Client } from "pg";
import { readServerEnvironment } from "../../server/environment";
import { databasePoolOptions } from "../../server/database";

const input = {
  APP_ENV: "test",
  SERVER_URL: "http://localhost:3000",
  DATABASE_URL:
    "postgresql://test:disposable@db.example.test/syncrate_test?sslmode=verify-full",
  PAYLOAD_SECRET: "disposable-test-key-".repeat(4),
};
const ca = rootCertificates[0];

test("pg retains the custom CA, certificate validation and hostname verification", () => {
  const env = readServerEnvironment({ ...input, DATABASE_CA_CERT: ca });
  const config = databasePoolOptions(env);
  const client = new Client(config);
  const parameters = Reflect.get(client, "connectionParameters");
  assert.equal(parameters.ssl.ca, ca);
  assert.equal(parameters.ssl.rejectUnauthorized, true);
  assert.equal(parameters.ssl.checkServerIdentity, checkServerIdentity);
  assert.equal(parameters.host, "db.example.test");
  assert.equal(
    new URL(env.DATABASE_URL).searchParams.get("sslmode"),
    "verify-full",
  );
});

test("URL SSL options cannot replace the verified custom CA policy", () => {
  const env = readServerEnvironment({
    ...input,
    DATABASE_CA_CERT: ca,
    DATABASE_URL:
      input.DATABASE_URL +
      "&ssl=0&sslrootcert=/not-a-real-file&uselibpqcompat=true",
  });
  const parameters = Reflect.get(
    new Client(databasePoolOptions(env)),
    "connectionParameters",
  );
  assert.equal(parameters.ssl.ca, ca);
  assert.equal(parameters.ssl.rejectUnauthorized, true);
  assert.equal(parameters.ssl.checkServerIdentity, checkServerIdentity);
});

test("invalid CA input fails without exposing configuration contents", () => {
  const marker = "private-invalid-ca-marker";
  assert.throws(
    () => readServerEnvironment({ ...input, DATABASE_CA_CERT: marker }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /DATABASE_CA_CERT/);
      assert.equal(error.message.includes(marker), false);
      return true;
    },
  );
});

test("local database configuration without a custom CA remains unchanged", () => {
  const env = readServerEnvironment(input);
  assert.deepEqual(databasePoolOptions(env), {
    connectionString: input.DATABASE_URL,
    max: 3,
  });
});
