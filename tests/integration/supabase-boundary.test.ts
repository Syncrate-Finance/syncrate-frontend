import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import pg from "pg";
// This suite is invoked separately from the existing Payload authorization suite.
const enabled = process.env.DATABASE_SCHEMA === "cms";
test(
  "private schema denies API roles and checks provider session revocation without exposing auth tables",
  { skip: !enabled },
  async () => {
    if (process.env.APP_ENV !== "test" || !process.env.DATABASE_URL)
      throw new Error("Only a disposable local test database is allowed.");
    const url = new URL(process.env.DATABASE_URL);
    if (
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !url.pathname.endsWith("_test")
    )
      throw new Error("Only a disposable local test database is allowed.");
    const db = new pg.Client({ connectionString: url.href });
    await db.connect();
    try {
      await db.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF; IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF; END $$;
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY, banned_until timestamptz, deleted_at timestamptz);
      CREATE TABLE IF NOT EXISTS auth.sessions (id uuid PRIMARY KEY, user_id uuid REFERENCES auth.users(id), not_after timestamptz);`);
      await db.query(
        await fs.readFile("scripts/sql/supabase-access.sql", "utf8"),
      );
      const user = "00000000-0000-4000-8000-000000000001",
        session = "00000000-0000-4000-8000-000000000002";
      await db.query(
        "INSERT INTO auth.users(id) VALUES ($1) ON CONFLICT DO NOTHING",
        [user],
      );
      await db.query(
        "INSERT INTO auth.sessions(id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [session, user],
      );
      for (const role of ["anon", "authenticated"]) {
        await db.query("SET ROLE " + role);
        await assert.rejects(
          db.query("SELECT * FROM cms.staff_users"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("SELECT cms.is_staff_session_active($1,$2)", [
            user,
            session,
          ]),
          /permission denied/,
        );
        await db.query("RESET ROLE");
      }
      await db.query("SET ROLE syncrate_cms_runtime");
      assert.equal(
        (
          await db.query(
            "SELECT cms.is_staff_session_active($1,$2) AS active",
            [user, session],
          )
        ).rows[0].active,
        true,
      );
      await db.query("SELECT id FROM cms.staff_users LIMIT 1");
      await assert.rejects(
        db.query("SELECT * FROM auth.users"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("CREATE TABLE cms.unauthorized(id int)"),
        /permission denied/,
      );
      await db.query("RESET ROLE");
      await db.query("DELETE FROM auth.sessions WHERE id=$1", [session]);
      await db.query("SET ROLE syncrate_cms_runtime");
      assert.equal(
        (
          await db.query(
            "SELECT cms.is_staff_session_active($1,$2) AS active",
            [user, session],
          )
        ).rows[0].active,
        false,
      );
      await db.query("RESET ROLE");
      const unsafe = await db.query(
        "SELECT count(*)::integer AS count FROM pg_tables t WHERE schemaname='cms' AND NOT rowsecurity",
      );
      assert.equal(unsafe.rows[0].count, 0);
    } finally {
      await db.end();
    }
  },
);
