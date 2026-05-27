'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description?: string
  episodeCount: number
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      })
      const newProject = await res.json()
      setProjects([...projects, newProject])
      setNewProjectName('')
      setNewProjectDesc('')
      setShowForm(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#f0f0f0' }}>Projects</h1>
        <p style={{ fontSize: 14, color: '#888' }}>Organize your episodes into projects</p>
      </div>

      {showForm && (
        <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ width: '100%', fontSize: 14, padding: 12, borderRadius: 8, border: '1px solid #333', background: '#0a0a0a', color: '#f0f0f0', marginBottom: 12, fontFamily: 'inherit' }}
          />
          <textarea
            placeholder="Description (optional)"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            style={{ width: '100%', fontSize: 14, padding: 12, borderRadius: 8, border: '1px solid #333', background: '#0a0a0a', color: '#f0f0f0', marginBottom: 12, fontFamily: 'inherit', minHeight: 80 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCreateProject}
              style={{ flex: 1, padding: 12, borderRadius: 8, background: '#f0f0f0', color: '#0c0c0c', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Create Project
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: 12, borderRadius: 8, background: '#1a1a1a', color: '#888', border: '1px solid #333', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 24, padding: '12px 24px', borderRadius: 8, background: '#f0f0f0', color: '#0c0c0c', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          + New Project
        </button>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No projects yet. Create one to get started!</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/studio?projectId=${p.id}`}
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0', margin: 0, marginBottom: 6 }}>{p.name}</h3>
                    {p.description && (
                      <p style={{ fontSize: 13, color: '#888', margin: 0, marginBottom: 8 }}>{p.description}</p>
                    )}
                    <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{p.episodeCount} episodes</p>
                  </div>
                  <span style={{ fontSize: 12, color: '#555' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222' }}>
        <Link href="/studio" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Studio
        </Link>
      </div>
    </div>
  )
}
