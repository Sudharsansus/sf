'use client'

import { useState } from 'react'

interface Props {
  result:  any
  onReset: () => void
}

export function EpisodeResult({ result, onReset }: Props) {
  const [showFullScript, setShowFullScript] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', textAlign: 'left' }}>
      {/* Header */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'inherit', fontSize: 20, marginBottom: 4, color: 'inherit' }}>{result.title}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4ade80', letterSpacing: 0.5 }}>● COMPLETE</div>
        </div>
        {result.shareId && (
          <a href={`/share/${result.shareId}`} target="_blank"
            style={{ fontSize: 12, opacity: 0.35, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 1 }}>
            Share ↗
          </a>
        )}
      </div>

      {/* Audio */}
      {result.audioUrl && (
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.3, letterSpacing: 1, marginBottom: 8 }}>AUDIO</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <audio controls src={result.audioUrl} style={{ flex: 1, height: 32 }} />
            <a href={result.audioUrl} download="episode.mp3"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.35, border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              ↓ Download
            </a>
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {result.thumbnailUrls?.length > 0 && (
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.3, letterSpacing: 1, marginBottom: 10 }}>THUMBNAILS</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              {result.thumbnailUrls.map((url: string, i: number) => (
                <img key={i} src={url} alt={`Thumbnail ${i + 1}`}
                  style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            {result.thumbnailUrls[0] && (
              <a href={result.thumbnailUrls[0]} download="thumbnail.jpg" target="_blank"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.35, border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 30 }}>
                ↓ Download
              </a>
            )}
          </div>
        </div>
      )}

      {/* SEO preview */}
      {result.seoData?.youtube && (
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.3, letterSpacing: 1 }}>YOUTUBE TITLE</div>
            <button onClick={() => copyText(result.seoData.youtube.title, 'yt-title')}
              style={{ fontSize: 10, color: copied === 'yt-title' ? '#4ade80' : 'inherit', opacity: copied === 'yt-title' ? 1 : 0.4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
              {copied === 'yt-title' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ fontSize: 13, opacity: 0.6 }}>{result.seoData.youtube.title}</div>
        </div>
      )}

      {/* Script */}
      {result.script?.lines && (
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.3, letterSpacing: 1 }}>SCRIPT</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowFullScript(!showFullScript)}
                style={{ fontSize: 11, opacity: 0.35, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showFullScript ? 'Show less ↑' : 'Show full ↓'}
              </button>
              <button onClick={() => {
                const text = result.script.lines.map((l: any) => `${l.speaker}: ${l.text}`).join('\n\n')
                const blob = new Blob([text], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'script.txt'; a.click()
              }} style={{ fontSize: 11, opacity: 0.35, border: '1px solid rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 5, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                ↓ Download
              </button>
            </div>
          </div>
          {(showFullScript ? result.script.lines : result.script.lines.slice(0, 4)).map((line: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, opacity: 0.35, fontWeight: 700, flexShrink: 0, width: 14 }}>{line.speaker}</span>
              <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: 0 }}>{line.text}</p>
            </div>
          ))}
          {!showFullScript && result.script.lines.length > 4 && (
            <p style={{ fontSize: 11, opacity: 0.25, marginTop: 8 }}>+ {result.script.lines.length - 4} more lines</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '12px 22px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 14, alignItems: 'center' }}>
        <a href="/studio"
          style={{ fontSize: 12, opacity: 0.35, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 1, textDecoration: 'none' }}>
          Go to Studio →
        </a>
        <button onClick={onReset}
          style={{ fontSize: 12, opacity: 0.35, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          New episode
        </button>
      </div>
    </div>
  )
}
