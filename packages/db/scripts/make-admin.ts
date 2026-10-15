import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  await sql`UPDATE users SET role = 'admin' WHERE email = 'sudharsan.e585@gmail.com'`
  console.log('Done - sudharsan.e585@gmail.com is now admin')
}

main()
