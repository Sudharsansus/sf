// Apply pending migrations: `npm run db:migrate -w @isaii/db` (reads DATABASE_URL).
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import { fileURLToPath } from 'node:url'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')
await migrate(drizzle(neon(url)), { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) })
console.log('migrations applied')
