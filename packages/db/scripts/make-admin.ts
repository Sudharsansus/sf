// Promote a user to admin: npm run make-admin -w @isaii/db -- someone@example.com
import { eq } from 'drizzle-orm'
import { getDb, users } from '../src'

const email = process.argv[2]
if (!email) {
  console.error('Usage: make-admin <email>')
  process.exit(1)
}
const rows = await getDb().update(users).set({ role: 'admin' }).where(eq(users.email, email)).returning({ id: users.id })
console.log(rows.length ? `${email} is now admin` : `No user with email ${email}`)
process.exit(rows.length ? 0 : 1)
