'use client'
// ── EpisodeResult component ───────────────────────────────────────────────────
// Shows completed episode: audio, thumbnails, SEO preview, transcript

interface Props {
  result:   any
  onReset:  () => void
}

export function EpisodeResult({ result, onReset }: Props) {
  return (
    <div style={{ background:'#111', border:'1px solid #222', borderRadius:16, overflow:'hidden', textAlign:'left' }}>
      {/* Header */}
      <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontStyle:'italic', marginBottom:4, color:'#f0f0f0' }}>{result.title}</div>
          <div style={{ fontFamily:'monospace', fontSize:10, color:'#4ade80', letterSpacing:0.5 }}>● COMPLETE</div>
        </div>
        {result.shareId && (
          <a href={`/share/${result.shareId}`} target="_blank"
            style={{ fontSize:12, color:'#555', borderBottom:'1px solid #333', paddingBottom:1 }}>
            Share ↗
          </a>
        )}
      </div>

      {/* Audio */}
      {result.audioUrl && (
        <div style={{ padding:'14px 22px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ fontFamily:'monospace', fontSize:9, color:'#444', letterSpacing:1, marginBottom:8 }}>AUDIO</div>
          <audio controls src={result.audioUrl} style={{ width:'100%', height:32 }} />
        </div>
      )}

      {/* Thumbnails */}
      {result.thumbnailUrls?.length > 0 && (
        <div style={{ padding:'14px 22px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ fontFamily:'monospace', fontSize:9, color:'#444', letterSpacing:1, marginBottom:10 }}>THUMBNAILS</div>
          <div style={{ display:'flex', gap:8 }}>
            {result.thumbnailUrls.map((url: string, i: number) => (
              <img key={i} src={url} alt={`Thumbnail ${i + 1}`}
                style={{ width:80, height:80, borderRadius:6, objectFit:'cover', border:'1px solid #222' }} />
            ))}
          </div>
        </div>
      )}

      {/* SEO preview */}
      {result.seoData?.youtube && (
        <div style={{ padding:'14px 22px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ fontFamily:'monospace', fontSize:9, color:'#444', letterSpacing:1, marginBottom:6 }}>YOUTUBE TITLE</div>
          <div style={{ fontSize:13, color:'#888' }}>{result.seoData.youtube.title}</div>
        </div>
      )}

      {/* Transcript preview */}
      {result.script?.lines && (
        <div style={{ padding:'16px 22px' }}>
          <div style={{ fontFamily:'monospace', fontSize:9, color:'#444', letterSpacing:1, marginBottom:10 }}>TRANSCRIPT PREVIEW</div>
          {result.script.lines.slice(0, 4).map((line: any, i: number) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:8 }}>
              <span style={{ fontFamily:'monospace', fontSize:10, color:'#444', marginTop:2, width:12, flexShrink:0 }}>{line.speaker}</span>
              <p style={{ fontSize:13, color:'#777', lineHeight:1.6, margin:0 }}>{line.text}</p>
            </div>
          ))}
          {result.script.lines.length > 4 && (
            <p style={{ fontSize:11, color:'#444', marginTop:6 }}>+ {result.script.lines.length - 4} more lines</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding:'12px 22px 16px', borderTop:'1px solid #1a1a1a', display:'flex', gap:14, alignItems:'center' }}>
        <a href={`/studio`} style={{ fontSize:12, color:'#555', borderBottom:'1px solid #2a2a2a', paddingBottom:1, textDecoration:'none' }}>
          Go to Studio →
        </a>
        <button onClick={onReset}
          style={{ fontSize:12, color:'#555', background:'none', border:'none', cursor:'pointer', padding:0 }}>
          New episode
        </button>
      </div>
    </div>
  )
}
