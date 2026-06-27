export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type AuthType = 'none' | 'bearer' | 'api-key' | 'basic' | 'oauth2-client' | 'custom'

export type AuthConfig =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'api-key'; name: string; value: string; in: 'header' | 'query' }
  | { type: 'basic'; username: string; password: string }
  | { type: 'oauth2-client'; tokenUrl: string; clientId: string; clientSecret: string; scope?: string }
  | { type: 'custom'; headers: { name: string; value: string }[] }

export interface RateLimitPanelProps {
  projectId: string
  initialRateLimit?: { enabled: boolean; requestsPerMinute: number }
  onChange: (rl: { enabled: boolean; requestsPerMinute: number }) => void
}

export interface ScheduleEntry {
  id: string
  day: number
  startHour: number
  endHour: number
}

export interface McpApiKeyEntry {
  id: string
  name: string
  key: string
  createdAt: string
}
