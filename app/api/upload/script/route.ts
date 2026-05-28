export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db, users, episodes, creditsLedger } from '@/lib/db'
import { eq, sql, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { auditLog } from '@/lib/security'
import { logger } from '@/lib/logger'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [user] = await db.select().from(users)
      .where(eq(users.email, session.user.email)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Free users: check if they have already used upload feature
    if (user.plan === 'free') {
      const uploadedEpisodes = await db.select({ id: episodes.id })
        .from(episodes)
        .where(eq(episodes.userId, user.id))
        .where(sql`metadata->>'source' = 'upload'`)
        .limit(1)
      
      if (uploadedEpisodes.length > 0) {
        return NextResponse.json({
          error: 'Free users can upload once. Upgrade to Pro for unlimited uploads.',
          upgrade: true
        }, { status: 402 })
      }
    } else {
      // Paid users — deduct 1 credit
      if (user.credits < 1)
        return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })

      const updateResult = await db.update(users)
        .set({ credits: sql`${users.credits} - 1`, updatedAt: new Date() })
        .where(and(eq(users.id, user.id), sql`${users.credits} > 0`))
        .returning({ credits: users.credits })

      if (!updateResult.length)
        return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })

      await db.insert(creditsLedger).values({
        userId: user.id, amount: -1, reason: 'script_upload'
      })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize)
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })

    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|docx|doc)$/i))
      return NextResponse.json({ error: 'Invalid file type. Upload .txt, .pdf, or .docx' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (file.name.endsWith('.pdf')) {
      // Basic PDF text extraction
      const pdfText = buffer.toString('latin1')
      const matches = pdfText.match(/BT\s*(.*?)\s*ET/gs) || []
      text = matches
        .map(m => m.replace(/BT\s*|\s*ET/g, '').replace(/Tf\s*|Td\s*|TD\s*|Tm\s*|T\*\s*/g, '\n').replace(/\((.*?)\)\s*Tj/g, '$1'))
        .join('\n')
        .replace(/[^\x20-\x7E\n]/g, '')
        .trim()
      if (!text) text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ').trim()
    } else {
      // For .docx — extract raw text
      text = buffer.toString('utf-8')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    if (!text || text.length < 10)
      return NextResponse.json({ error: 'Could not extract text from file. Try a .txt file.' }, { status: 400 })

    // Parse into script lines
    const rawLines = text.split(/\n+/).filter(l => l.trim().length > 5)
    const lines: { speaker: string; text: string }[] = []

    rawLines.forEach((line, i) => {
      const trimmed = line.trim()
      // Check if line starts with speaker label like "A:", "B:", "Speaker A:", etc
      const speakerMatch = trimmed.match(/^([AB]|Speaker [AB]|Host|Guest)\s*[:–-]\s*/i)
      if (speakerMatch) {
        const speaker = speakerMatch[1].toUpperCase().includes('B') || 
          speakerMatch[1].toLowerCase().includes('guest') ? 'B' : 'A'
        const text = trimmed.replace(speakerMatch[0], '').trim()
        if (text) lines.push({ speaker, text })
      } else {
        // Auto-assign alternating speakers
        const words = trimmed.split(' ')
        for (let j = 0; j < words.length; j += 30) {
          const chunk = words.slice(j, j + 30).join(' ')
          if (chunk.trim()) {
            lines.push({
              speaker: lines.length % 2 === 0 ? 'A' : 'B',
              text: chunk.trim()
            })
          }
        }
      }
    })

    if (lines.length === 0)
      return NextResponse.json({ error: 'No valid script lines found in file.' }, { status: 400 })

    // Create episode
    const shareId = randomUUID().replace(/-/g, '')
    const title = file.name.replace(/\.(txt|pdf|docx|doc)$/i, '').replace(/[-_]/g, ' ')

    const [episode] = await db.insert(episodes).values({
      userId: user.id,
      topic: title,
      title,
      shareId,
      status: 'awaiting_selection',
      agentStep: 'script_uploaded',
      script: { lines },
      allScripts: { scripts: [{ angle: 'uploaded', title, hook: lines[0]?.text || '', lines, duration_estimate_seconds: lines.length * 15 }] },
      idempotencyKey: randomUUID(),
    }).returning()

    await auditLog({
      userId: user.id,
      action: 'script.upload',
      resource: `episode:${episode.id}`,
      metadata: { filename: file.name, lines: lines.length }
    })

    logger.info('Script uploaded', { episodeId: episode.id, lines: lines.length })

    return NextResponse.json({
      episodeId: episode.id,
      shareId: episode.shareId,
      title,
      lines,
      lineCount: lines.length
    })

  } catch (e: any) {
    logger.error('Script upload error', { error: e.message })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
