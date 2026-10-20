import { spawn } from 'node:child_process'

/** Run ffmpeg (worker-media image ships it). Resolves with stderr for diagnostics. */
export function runFfmpeg(args: string[], opts: { bin?: string; timeoutMs?: number } = {}): Promise<string> {
  const { bin = process.env.FFMPEG_PATH || 'ffmpeg', timeoutMs = 10 * 60_000 } = opts
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args])
    let stderr = ''
    proc.stderr.on('data', d => { stderr += d })
    const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('ffmpeg timed out')) }, timeoutMs)
    proc.on('error', e => { clearTimeout(timer); reject(e) })
    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0) resolve(stderr)
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`))
    })
  })
}

/** Arguments for a 16:9 episode video: still cover + audio + waveform, captions burnt in when given. */
export function episodeVideoArgs(o: { cover: string; audio: string; out: string; subtitles?: string }): string[] {
  const filter = [
    '[1:a]showwaves=s=1280x160:mode=cline:colors=0xf97316@0.9[wave]',
    '[0:v]scale=1280:720,format=yuv420p[bg]',
    '[bg][wave]overlay=0:560' + (o.subtitles ? `,subtitles='${o.subtitles.replace(/\\/g, '/').replace(/:/g, '\\:')}'` : '') + '[v]',
  ].join(';')
  return ['-loop', '1', '-i', o.cover, '-i', o.audio, '-filter_complex', filter, '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', o.out]
}

/** Arguments for a 9:16 Short cut from [start, start+duration). */
export function shortArgs(o: { video: string; start: number; duration: number; out: string }): string[] {
  return ['-ss', String(o.start), '-t', String(o.duration), '-i', o.video,
    '-vf', 'crop=ih*9/16:ih,scale=1080:1920', '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-movflags', '+faststart', o.out]
}
