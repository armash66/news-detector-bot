import React, { useEffect, useState, useCallback } from 'react';
import { api, type EventResponse } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Events', value: '' },
  { label: 'Geopolitics', value: 'GEOPOLITICS' },
  { label: 'Tech & Markets', value: 'TECHNOLOGY' },
  { label: 'Environment', value: 'ENVIRONMENT' },
  { label: 'Finance', value: 'FINANCE' },
];

export const Home: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-significance');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: EventResponse[];
      if (activeCategory) {
        data = await api.getEventsByCategory(activeCategory, 30);
      } else {
        data = await api.getEvents(30, sortBy);
      }
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError('Could not connect to backend. Is the server running on port 8000?');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sortBy, refreshKey]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadEvents();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await api.search(searchQuery);
      setEvents(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayedEvents = events;

  return (
    <div className="scrollarea">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          Event Feed
          <span className="badge badge-success" style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
            LIVE UPDATES
          </span>
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, entities, regions..."
              style={{
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                width: '280px',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
              }}
            />
          </form>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', fontSize: '0.875rem', color: 'var(--text-primary)' }}
          >
            <option value="-significance">By Significance</option>
            <option value="-updated">Most Recent</option>
            <option value="-articles">Most Articles</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => setRefreshKey(k => k + 1)}
            title="Refresh feed"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => { setActiveCategory(cat.value); setSearchQuery(''); }}
            className="badge"
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              backgroundColor: activeCategory === cat.value ? 'var(--primary)' : 'transparent',
              color: activeCategory === cat.value ? 'white' : 'var(--text-secondary)',
              border: activeCategory === cat.value ? 'none' : '1px solid var(--border-light)',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Main Feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>⚡</div>
              Gathering Intelligence...
            </div>
          )}

          {error && (
            <div className="card" style={{ borderLeft: '4px solid var(--status-critical)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--status-critical)', margin: 0, fontWeight: 600 }}>⚠ Connection Error</p>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{error}</p>
            </div>
          )}

          {!loading && !error && displayedEvents.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
              No live events detected. Check backend ingestion or seed the database.
            </div>
          )}

          {!loading && displayedEvents.map((ev) => {
            const isCritical = ev.significance_score > 0.8 || ev.status === 'BREAKING';
            const borderColor = isCritical ? 'var(--status-critical)' : 'var(--primary)';
            const badgeClass = isCritical ? 'badge-breaking' : 'badge-trending';
            const label = ev.status === 'BREAKING' ? 'BREAKING' : ev.status === 'EMERGING' ? 'EMERGING' : 'TRENDING';
            const credibility = Math.round(ev.trust_score * 100);

            return (
              <div key={ev.id} className="card" style={{ borderLeft: `4px solid ${borderColor}`, position: 'relative', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                  <span className={`badge ${badgeClass}`}>{label}</span>
                  <span className="text-small">{formatDistanceToNow(new Date(ev.first_seen_at), { addSuffix: true })}</span>
                  {ev.category && ev.category !== 'GENERAL' && (
                    <span className="badge badge-analysis" style={{ marginLeft: 'auto' }}>{ev.category}</span>
                  )}
                </div>

                <Link to={`/briefing?id=${ev.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h2 style={{ marginBottom: '0.75rem', lineHeight: 1.3 }}>{ev.title}</h2>
                </Link>

                <p style={{ marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ev.summary || 'Intelligence report processing. Summary generation pending.'}
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-small">
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white', marginLeft: '0' }}></div>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--status-info)', border: '2px solid white', marginLeft: '-7px' }}></div>
                    </div>
                    <span>{ev.article_count} Articles · {ev.source_count} Sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-small" style={{ fontWeight: 700, color: credibility >= 70 ? 'var(--status-success)' : credibility >= 50 ? 'var(--status-warning)' : 'var(--status-critical)' }}>
                    CREDIBILITY
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${credibility}%`, backgroundColor: credibility >= 70 ? 'var(--status-success)' : credibility >= 50 ? 'var(--status-warning)' : 'var(--status-critical)' }}></div>
                    </div>
                    {credibility}%
                  </div>
                  <Link to={`/briefing?id=${ev.id}`} style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>View Briefing →</button>
                  </Link>
                </div>
              </div>
            );
          })}

          {!loading && !error && displayedEvents.length > 0 && (
            <button className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '0.5rem' }} onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw size={14} /> Refresh Intelligence
            </button>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
          {/* Stats */}
          <div className="card" style={{ backgroundColor: 'var(--bg-app)', border: 'none', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Feed Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{events.length}</div>
                <div className="text-small">Active Events</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-critical)' }}>
                  {events.filter(e => e.status === 'BREAKING' || e.significance_score > 0.8).length}
                </div>
                <div className="text-small">Breaking</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-success)' }}>
                  {events.filter(e => e.trust_score >= 0.7).length}
                </div>
                <div className="text-small">High Credibility</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {events.reduce((sum, e) => sum + (e.source_count || 0), 0)}
                </div>
                <div className="text-small">Total Sources</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {events.length > 0 && (() => {
            const counts: Record<string, number> = {};
            events.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
            return (
              <div>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Top Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sorted.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveCategory(cat)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', textAlign: 'left', padding: 0 }}
                      >
                        {cat}
                      </button>
                      <span className="badge badge-analysis">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Pro Tip */}
          <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>🔍 Intelligence Tip</h3>
            <p style={{ color: 'var(--primary-light)', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              Click any event title to open its full intelligence briefing, including source analysis and timeline.
            </p>
            <Link to="/intelligence" style={{ textDecoration: 'none' }}>
              <button className="btn w-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                Open Intelligence Search →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
