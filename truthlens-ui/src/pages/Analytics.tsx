import React, { useEffect, useState } from 'react';
import { api, type EventResponse, type TrendingTopic } from '../api';
import { Link } from 'react-router-dom';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [trending, setTrending] = useState<EventResponse[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [allEvents, setAllEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState(24);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendingData, topicsData, eventsData] = await Promise.all([
        api.getTrending(timeWindow, 10),
        api.getTrendingTopics(8),
        api.getEvents(50, '-significance'),
      ]);
      setTrending(trendingData);
      setTopics(topicsData);
      setAllEvents(eventsData);
    } catch (err: any) {
      console.error('Analytics load failed:', err);
      setError('Could not load analytics data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [timeWindow]);

  // Derived stats
  const avgTrust = allEvents.length > 0
    ? Math.round((allEvents.reduce((s, e) => s + e.trust_score, 0) / allEvents.length) * 100)
    : 0;
  const totalArticles = allEvents.reduce((s, e) => s + e.article_count, 0);
  const breakingCount = allEvents.filter(e => e.status === 'BREAKING').length;


  const maxTopicCount = topics[0]?.event_count || 1;

  const CATEGORY_COLORS: Record<string, string> = {
    GEOPOLITICS: '#ef4444',
    TECHNOLOGY: '#3b82f6',
    FINANCE: '#10b981',
    ENVIRONMENT: '#22c55e',
    HEALTH: '#f59e0b',
    GENERAL: '#94a3b8',
  };

  return (
    <div className="scrollarea">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={24} color="var(--primary)" />
          Analytics Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'white', fontSize: '0.875rem', color: 'var(--text-primary)' }}
          >
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={72}>Last 3 Days</option>
            <option value={168}>Last 7 Days</option>
          </select>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={load} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--status-critical)', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--status-critical)', fontWeight: 600, margin: 0 }}>⚠ Connection Error</p>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          Loading analytics data...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Events Tracked', value: allEvents.length, color: 'var(--primary)', bg: 'var(--primary-light)', icon: '📋' },
              { label: 'Breaking Events', value: breakingCount, color: 'var(--status-critical)', bg: 'var(--status-critical-bg)', icon: '🔴' },
              { label: 'Avg. Credibility', value: `${avgTrust}%`, color: 'var(--status-success)', bg: 'var(--status-success-bg)', icon: '✅' },
              { label: 'Total Articles', value: totalArticles.toLocaleString(), color: 'var(--status-info)', bg: 'var(--status-info-bg)', icon: '📰' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ backgroundColor: kpi.bg, border: 'none', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                <div className="text-small" style={{ marginTop: '0.25rem', fontWeight: 600 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Trending Events */}
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--primary)" /> Trending Events
                </h2>
                <span className="text-small badge badge-analysis">Last {timeWindow}h</span>
              </div>
              {trending.length === 0 ? (
                <p className="text-small text-secondary">No trending events in this time window.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {trending.map((ev, idx) => (
                    <Link to={`/briefing?id=${ev.id}`} key={ev.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.625rem', borderRadius: '8px', backgroundColor: 'var(--bg-app)', transition: 'background-color 0.15s', cursor: 'pointer' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--border-medium)', color: idx === 0 ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                          <div className="text-small" style={{ marginTop: '0.1rem' }}>{ev.article_count} articles · {ev.category}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{Math.round(ev.significance_score * 100)}%</span>
                          <span className="text-small">significance</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Category Distribution</h2>
              {topics.length === 0 ? (
                <p className="text-small text-secondary">No category data available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {topics.map(topic => {
                    const color = CATEGORY_COLORS[topic.category] || 'var(--primary)';
                    const pct = Math.round((topic.event_count / maxTopicCount) * 100);
                    return (
                      <div key={topic.category}>
                        <div className="flex justify-between text-small" style={{ marginBottom: '0.375rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{topic.category}</span>
                          <span style={{ color, fontWeight: 700 }}>{topic.event_count} events</span>
                        </div>
                        <div className="progress-bar-container" style={{ width: '100%', height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Credibility Distribution */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Credibility Distribution Across All Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Very High (90–100%)', count: allEvents.filter(e => e.trust_score >= 0.9).length, color: '#10b981' },
                { label: 'High (70–89%)', count: allEvents.filter(e => e.trust_score >= 0.7 && e.trust_score < 0.9).length, color: '#22c55e' },
                { label: 'Moderate (50–69%)', count: allEvents.filter(e => e.trust_score >= 0.5 && e.trust_score < 0.7).length, color: '#f59e0b' },
                { label: 'Low (30–49%)', count: allEvents.filter(e => e.trust_score >= 0.3 && e.trust_score < 0.5).length, color: '#ef4444' },
                { label: 'Very Low (<30%)', count: allEvents.filter(e => e.trust_score < 0.3).length, color: '#dc2626' },
              ].map(band => (
                <div key={band.label} style={{ textAlign: 'center', padding: '1rem', borderRadius: '8px', border: `2px solid ${band.color}20`, backgroundColor: `${band.color}10` }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: band.color }}>{band.count}</div>
                  <div className="text-small" style={{ marginTop: '0.25rem', fontWeight: 500 }}>{band.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* High Significance Events Table */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Top Events by Significance</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    {['Title', 'Category', 'Status', 'Significance', 'Credibility', 'Articles'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.625rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEvents.slice(0, 10).map((ev, idx) => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: idx % 2 === 1 ? 'var(--bg-app)' : 'transparent' }}>
                      <td style={{ padding: '0.75rem', maxWidth: '260px' }}>
                        <Link to={`/briefing?id=${ev.id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{ev.title}</div>
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-analysis" style={{ fontSize: '0.65rem' }}>{ev.category}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${ev.status === 'BREAKING' ? 'badge-breaking' : ev.status === 'EMERGING' ? 'badge-warning' : 'badge-trending'}`} style={{ fontSize: '0.65rem' }}>{ev.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {Math.round(ev.significance_score * 100)}%
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: ev.trust_score >= 0.7 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                        {Math.round(ev.trust_score * 100)}%
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{ev.article_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
