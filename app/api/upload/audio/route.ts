export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db, users, episodes, creditsLedger } from '@/lib/db'
import { eq, sql, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { transcribeToScript } from '@/lib/claude'
import { uploadBuffer } from '@/lib/storage'
import { auditLog } from '@/lib/security'
import { logger } from '@/lib/logger'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [user] = await db.select().from(users)
      .where(eq(users.email, session.user.email)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Credits check — audio upload costs 1 credit for everyone
    if (user.credits < 1)
      return NextResponse.json({ error: 'No credits remaining. Please upgrade.' }, { status: 402 })

    // Free users: one time only
    if (user.plan === 'free') {
      const uploadedEpisodes = await db.select({ id: episodes.id })
        .from(episodes)
        .where(eq(episodes.userId, user.id))
        .where(eq(episodes.agentStep, 'audio_uploaded'))
        .limit(1)

      if (uploadedEpisodes.length > 0) {
        return NextResponse.json({
          error: 'Free users can upload once. Upgrade to Pro for unlimited.',
          upgrade: true
        }, { status: 402 })
      }
    }

    // Deduct credit
    const updateResult = await db.update(users)
      .set({ credits: sql`${users.credits} - 1`, updatedAt: new Date() })
      .where(and(eq(users.id, user.id), sql`${users.credits} > 0`))
      .returning({ credits: users.credits })

    if (!updateResult.length)
      return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })

    await db.insert(creditsLedger).values({
      userId: user.id, amount: -1, reason: 'audio_upload'
    })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize)
      return NextResponse.json({ error: 'File too large. Max 25MB.' }, { status: 400 })

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/webm']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
      await db.update(users).set({ credits: sql`${users.credits} + 1` }).where(eq(users.id, user.id))
      return NextResponse.json({ error: 'Invalid file. Upload .mp3, .wav, or .m4a' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to R2
    const episodeId = randomUUID()
    const audioKey = `uploads/${user.id}/${episodeId}.mp3`
    const audioUrl = await uploadBuffer(buffer, audioKey, file.type || 'audio/mpeg')

    // Transcribe with Groq Whisper
    let lines: { speaker: string; text: string }[] = []
    try {
      lines = await transcribeToScript(buffer, file.type || 'audio/mpeg')
    } catch (e: any) {
      logger.warn('Transcription failed', { error: e.message })
      lines = [{ speaker: 'A', text: 'Transcription failed. Please edit manually.' }]
    }

    const shareId = randomUUID().replace(/-/g, '')
    const title = file.name.replace(/\.(mp3|wav|m4a|ogg|webm)$/i, '').replace(/[-_]/g, ' ')

    const [episode] = await db.insert(episodes).values({
      userId: user.id,
      topic: title,
      title,
      shareId,
      status: 'awaiting_selection',
      agentStep: 'audio_uploaded',
      audioUrl,
      script: { lines },
      allScripts: { scripts: [{ angle: 'uploaded', title, hook: lines[0]?.text || '', lines, duration_estimate_seconds: lines.length * 15 }] },
      idempotencyKey: randomUUID(),
    }).returning()

    await auditLog({
      userId: user.id,
      action: 'audio.upload',
      resource: `episode:${episode.id}`,
      metadata: { filename: file.name, size: file.size, lines: lines.length }
    })

    return NextResponse.json({
      episodeId: episode.id,
      shareId: episode.shareId,
      title,
      audioUrl,
      lines,
      lineCount: lines.length
    })

  } catch (e: any) {
    logger.error('Audio upload error', { error: e.message })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
