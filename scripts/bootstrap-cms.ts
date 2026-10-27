import { config as loadEnvironment } from 'dotenv'
import { getPayload } from 'payload'
loadEnvironment({ path: '.env.local', quiet: true })
const { readServerEnvironment } = await import('../server/environment')
const env = readServerEnvironment()
if (!env.localAuthentication || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(env.DATABASE_URL).hostname)) throw new Error('This bootstrap command only operates on a local/test database.')
const email = process.env.CMS_BOOTSTRAP_EMAIL
const password = process.env.CMS_BOOTSTRAP_PASSWORD
if (!email || !password || password.length < 16) throw new Error('Set CMS_BOOTSTRAP_EMAIL and a CMS_BOOTSTRAP_PASSWORD of at least 16 characters in the environment.')
const config = (await import('../payload.config')).default
const cms = await getPayload({ config })
try {
  const existing = await cms.count({ collection: 'staff-users', overrideAccess: true })
  if (existing.totalDocs !== 0) throw new Error('Bootstrap is only available for an empty staff collection.')
  await cms.create({ collection: 'staff-users', overrideAccess: true, context: { bootstrap: true }, data: { email, password, name: 'Local administrator', role: 'admin', active: true } })
  console.log('Local administrator created. Credentials were not printed.')
} finally { await cms.destroy() }
// Payload keeps its pool for hot reload; this one-shot CLI exits after all writes finish.
process.exit(0)
