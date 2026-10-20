import { describe, expect, it } from 'vitest'
import { episodeVideoArgs, runFfmpeg, shortArgs } from '../src'

describe('ffmpeg args', () => {
  it('builds a faststart H.264 episode with waveform and optional captions', () => {
    const args = episodeVideoArgs({ cover: 'c.png', audio: 'a.mp3', out: 'o.mp4', subtitles: 'C:\\tmp\\s.srt' })
    expect(args).toContain('libx264')
    expect(args.join(' ')).toContain('showwaves')
    expect(args.join(' ')).toContain("subtitles='C\\:/tmp/s.srt'")
    expect(args.at(-1)).toBe('o.mp4')
  })
  it('crops Shorts to 9:16', () => {
    expect(shortArgs({ video: 'v.mp4', start: 12, duration: 30, out: 's.mp4' }).join(' ')).toContain('crop=ih*9/16:ih,scale=1080:1920')
  })
  it('reports a missing ffmpeg binary', async () => {
    await expect(runFfmpeg(['-version'], { bin: 'definitely-not-ffmpeg-binary' })).rejects.toThrow()
  })
})
