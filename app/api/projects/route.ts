export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, projects, episodes, users } from '@/lib/db'
import { getSession } from '@/lib/session'
import { eq, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get all projects for this user
    const userProjects = await db.select().from(projects).where(eq(projects.userId, user.id))

    // For each project, count episodes
    const projectsWithCounts = await Promise.all(
      userProjects.map(async (p) => {
        const count = await db.select({ count: sql<number>`count(*)` })
          .from(episodes)
          .where(eq(episodes.projectId, p.id))
        return { ...p, episodeCount: count[0]?.count || 0 }
      })
    )

    return NextResponse.json(projectsWithCounts)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { name, description } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const newProject = await db.insert(projects).values({
      id: randomUUID() as any,
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null
    }).returning()

    return NextResponse.json(newProject[0])
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
