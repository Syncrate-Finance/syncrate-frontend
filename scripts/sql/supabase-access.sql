-- Apply only to the owner-designated preview project, as its database owner.
-- Passwords are provisioned separately through the secret store; never put them here.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'syncrate_cms_runtime') THEN
    CREATE ROLE syncrate_cms_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'syncrate_cms_migrator') THEN
    CREATE ROLE syncrate_cms_migrator NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
-- PostgreSQL 17 requires explicit SET ROLE membership for the trusted migration operator.
GRANT syncrate_cms_migrator TO postgres;
CREATE SCHEMA IF NOT EXISTS cms AUTHORIZATION syncrate_cms_migrator;
REVOKE ALL ON SCHEMA cms FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA cms TO syncrate_cms_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA cms TO syncrate_cms_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA cms TO syncrate_cms_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE syncrate_cms_migrator IN SCHEMA cms REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE syncrate_cms_migrator IN SCHEMA cms GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO syncrate_cms_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE syncrate_cms_migrator IN SCHEMA cms GRANT USAGE, SELECT ON SEQUENCES TO syncrate_cms_runtime;
-- A boolean capability, never a general read grant on Supabase's auth schema.
CREATE OR REPLACE FUNCTION cms.is_staff_session_active(staff_subject uuid, staff_session uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.sessions s JOIN auth.users u ON u.id = s.user_id
    WHERE s.id = staff_session AND s.user_id = staff_subject
      AND (s.not_after IS NULL OR s.not_after > now())
      AND (u.banned_until IS NULL OR u.banned_until <= now())
      AND u.deleted_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION cms.is_staff_session_active(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cms.is_staff_session_active(uuid, uuid) TO syncrate_cms_runtime;

-- Reapply after each Payload migration so new tables receive both guards.
DO $$ DECLARE item record; BEGIN
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'cms' LOOP
    EXECUTE format('ALTER TABLE cms.%I ENABLE ROW LEVEL SECURITY', item.tablename);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'cms' AND tablename = item.tablename AND policyname = 'cms_server_role') THEN
      EXECUTE format('CREATE POLICY cms_server_role ON cms.%I TO syncrate_cms_runtime USING (true) WITH CHECK (true)', item.tablename);
    END IF;
  END LOOP;
END $$;
