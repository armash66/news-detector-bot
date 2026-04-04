import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface EventResponse {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  status: string;
  significance_score: number;
  trust_score: number;
  article_count: number;
  source_count: number;
  first_seen_at: string;
  last_updated_at: string;
  peak_at?: string | null;
  primary_location?: Record<string, any> | null;
  primary_entities?: Record<string, string>[] | null;
  sentiment_distribution?: Record<string, number> | null;
  parent_event_id?: string | null;
}

export interface ArticleResponse {
  id: string;
  title: string;
  summary?: string | null;
  url?: string;
  source_domain?: string;
  source_name?: string;
  sentiment_score?: number | null;
  credibility_score?: number | null;
  language?: string;
  published_at?: string | null;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  description: string;
  entry_type: string;
  significance: number;
}

export interface ClaimResponse {
  id: string;
  claim_text: string;
  claim_type: string;
  verdict: string;
  confidence?: number | null;
  supporting_sources: number;
  contradicting_sources: number;
}

export interface EventDetail extends EventResponse {
  articles: ArticleResponse[];
  timeline: TimelineEntry[];
  claims: ClaimResponse[];
}

export interface AlertResponse {
  id: string;
  event_id?: string | null;
  alert_type: string;
  severity: string;
  title: string;
  description?: string | null;
  triggered_at: string;
  acknowledged: boolean;
}

export interface SearchResponse {
  data: EventResponse[];
  meta: Record<string, any>;
}

export interface AnalyzeResult {
  trust_score: number;
  breakdown: Record<string, any>;
  sentiment: number;
  bias: number;
  summary: string;
  entities: string[];
}

export interface AnalyzeResponse {
  id: string;
  status: string;
  result: AnalyzeResult | null;
}

export interface TrendingTopic {
  category: string;
  event_count: number;
}

export const api = {
  // ── Events ─────────────────────────────────────────────────────
  getEvents: async (limit = 20, sort = '-significance') => {
    const res = await apiClient.get<{ data: EventResponse[]; meta: any }>('/events', {
      params: { limit, sort },
    });
    return res.data.data;
  },

  getEventsByCategory: async (category: string, limit = 20) => {
    const res = await apiClient.get<{ data: EventResponse[]; meta: any }>('/events', {
      params: { limit, sort: '-significance', category },
    });
    return res.data.data;
  },

  // Backend returns { event: {...}, articles: [...], timeline: [...], claims: [...] }
  // We flatten it here into a single EventDetail object
  getEventDetail: async (eventId: string): Promise<EventDetail> => {
    const res = await apiClient.get<{
      event: EventResponse;
      articles: ArticleResponse[];
      timeline: TimelineEntry[];
      claims: ClaimResponse[];
    }>(`/events/${eventId}`);

    const { event, articles, timeline, claims } = res.data;
    return { ...event, articles, timeline, claims };
  },

  getEventTrust: async (eventId: string) => {
    const res = await apiClient.get(`/events/${eventId}/trust`);
    return res.data;
  },

  // ── Alerts ──────────────────────────────────────────────────────
  getAlerts: async (limit = 20) => {
    const res = await apiClient.get<{ data: AlertResponse[]; meta: any }>('/alerts', {
      params: { limit },
    });
    return res.data.data;
  },

  acknowledgeAlert: async (alertId: string) => {
    const res = await apiClient.post(`/alerts/${alertId}/acknowledge`);
    return res.data;
  },

  // ── Search ──────────────────────────────────────────────────────
  // Backend expects `q` param (not `query`)
  search: async (query: string, type = 'keyword', category?: string, min_trust?: number) => {
    const params: Record<string, any> = { q: query, type };
    if (category) params.category = category;
    if (min_trust !== undefined) params.min_trust = min_trust;
    const res = await apiClient.get<SearchResponse>('/search', { params });
    return res.data.data;
  },

  // ── Trending ────────────────────────────────────────────────────
  getTrending: async (hours = 24, limit = 10) => {
    const res = await apiClient.get<{ data: EventResponse[]; meta: any }>('/trending', {
      params: { hours, limit },
    });
    return res.data.data;
  },

  getTrendingTopics: async (limit = 10) => {
    const res = await apiClient.get<{ data: TrendingTopic[]; meta: any }>('/trending/topics', {
      params: { limit },
    });
    return res.data.data;
  },

  // ── Analyze ─────────────────────────────────────────────────────
  analyze: async (text?: string, url?: string): Promise<AnalyzeResponse> => {
    const res = await apiClient.post<AnalyzeResponse>('/analyze', { text, url });
    return res.data;
  },
};
