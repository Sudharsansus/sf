export type Feature =
  | 'thumbnails' | 'seo' | 'youtube_publish' | 'instagram_publish' | 'video_episodes' | 'shorts'
  | 'shows' | 'rss_hosting' | 'priority_support' | 'team_access' | 'api_access'

const BY_PLAN: Record<string, Feature[]> = {
  free: ['thumbnails'],
  lite: ['thumbnails', 'seo'],
  starter: ['thumbnails', 'seo', 'youtube_publish'],
  pro: ['thumbnails', 'seo', 'youtube_publish', 'instagram_publish', 'video_episodes', 'shorts', 'shows', 'priority_support'],
  studio: ['thumbnails', 'seo', 'youtube_publish', 'instagram_publish', 'video_episodes', 'shorts', 'shows', 'rss_hosting', 'priority_support', 'api_access'],
  agency: ['thumbnails', 'seo', 'youtube_publish', 'instagram_publish', 'video_episodes', 'shorts', 'shows', 'rss_hosting', 'priority_support', 'team_access', 'api_access'],
}

export const entitlements = (plan: string): Feature[] => BY_PLAN[plan] ?? BY_PLAN.free!
export const can = (plan: string, feature: Feature) => entitlements(plan).includes(feature)
