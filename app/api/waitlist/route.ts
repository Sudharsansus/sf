export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, waitlist } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const entry = await db.insert(waitlist).values({
      id: randomUUID() as any,
      email: email.toLowerCase().trim(),
      name: name?.trim() || null
    }).returning()

    return NextResponse.json({ success: true, entry: entry[0] })
  } catch (error: any) {
    if (error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Email already on waitlist' }, { status: 409 })
    }
    console.error('Error adding to waitlist:', error)
    return NextResponse.json({ error: 'Failed to add to waitlist' }, { status: 500 })
  }
}
