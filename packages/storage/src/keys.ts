/** Every object key the platform writes, in one place. */
export const storageKeys = {
  episodeAudio: (episodeId: string) => `episodes/${episodeId}.mp3`,
  episodeAudioPart: (episodeId: string, n: number) => `episodes/${episodeId}/part-${n}.mp3`,
  episodeVideo: (episodeId: string) => `episodes/${episodeId}.mp4`,
  short: (episodeId: string, n: number) => `shorts/${episodeId}_${n}.mp4`,
  thumbnail: (episodeId: string, n: number) => `thumbnails/${episodeId}_${n}.png`,
  upload: (userId: string, episodeId: string, ext: string) => `uploads/${userId}/${episodeId}.${ext.replace(/^\./, '')}`,
} as const
