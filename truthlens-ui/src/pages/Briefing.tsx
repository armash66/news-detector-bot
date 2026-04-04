import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, type EventDetail } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

export const Briefing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEventDetail(eventId);
        setEventData(data);
      } catch (err: any) {
        console.error('Failed to load briefing:', err);
        setError('Could not load briefing. The event may not exist or the backend is unreachable.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="scrollarea" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontWeight: 600 }}>Compiling intelligence briefing...</div>
        </div>
      </div>
    );
  }

  if (error || !eventId || !eventData) {
    return (
      <div className="scrollarea">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>
        <div className="card" style={{ borderLeft: '4px solid var(--status-critical)', maxWidth: '600px' }}>
          <p style={{ color: 'var(--status-critical)', fontWeight: 600 }}>⚠ Briefing Unavailable</p>
          <p style={{ marginTop: '0.5rem' }}>{error || 'No event ID provided. Navigate from the Event Feed.'}</p>
        </div>
      </div>
    );
  }

  const credibility = Math.round(eventData.trust_score * 100);
  const isHighCredibility = credibility >= 70;
  const statusColor = eventData.status === 'BREAKING' ? 'var(--status-critical)' : 'var(--primary)';

  return (
    <div className="scrollarea">
      {/* Breadcrumb */}
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Event Feed
      </Link>

      {/* Top Identifier */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
        <span className="badge" style={{ backgroundColor: eventData.status === 'BREAKING' ? 'var(--status-critical-bg)' : 'var(--primary-light)', color: statusColor, border: 'none' }}>
          {eventData.status === 'BREAKING' ? '🔴 CRITICAL EVENT' : eventData.status === 'EMERGING' ? '🟡 EMERGING EVENT' : '🟢 ACTIVE EVENT'}
        </span>
        {eventData.category && eventData.category !== 'GENERAL' && (
          <span className="badge badge-analysis">{eventData.category}</span>
        )}
        <span className="text-small text-tertiary">Updated {formatDistanceToNow(new Date(eventData.last_updated_at), { addSuffix: true })}</span>
      </div>

      <h1 style={{ fontSize: '2rem', lineHeight: 1.2, fontWeight: 700, marginBottom: '1.25rem', maxWidth: '800px' }}>
        {eventData.title}
      </h1>

      <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '800px' }}>
        {eventData.summary || 'Summary generation in progress. Check back shortly.'}
      </p>

      <div style={{ display: 'flex', gap: '2.5rem' }}>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Consensus & credibility */}
          <div className="card flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isHighCredibility ? <ShieldCheck size={20} color="var(--status-success)" /> : <AlertTriangle size={20} color="var(--status-warning)" />}
                Consensus & Credibility
              </h2>
              <span className={isHighCredibility ? 'badge badge-success' : 'badge badge-warning'}>
                {isHighCredibility ? 'HIGH CONFIDENCE' : 'MODERATE CONFIDENCE'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: isHighCredibility ? 'var(--status-success)' : 'var(--status-warning)' }}>{credibility}%</div>
                <div className="text-small" style={{ marginTop: '0.25rem' }}>Trust Score</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{eventData.article_count}</div>
                <div className="text-small" style={{ marginTop: '0.25rem' }}>Articles Tracked</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{eventData.source_count}</div>
                <div className="text-small" style={{ marginTop: '0.25rem' }}>Unique Sources</div>
              </div>
            </div>

            <div className="progress-bar-container" style={{ width: '100%', height: '8px', marginTop: '0.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${credibility}%`, backgroundColor: isHighCredibility ? 'var(--status-success)' : 'var(--status-warning)', borderRadius: '9999px' }}></div>
            </div>

            {/* Sentiment */}
            {eventData.sentiment_distribution && Object.keys(eventData.sentiment_distribution).length > 0 && (
              <div>
                <div className="text-small" style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sentiment Breakdown</div>
                <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                  {Object.entries(eventData.sentiment_distribution).map(([key, val]) => (
                    <span key={key} className="badge badge-analysis">
                      {key}: {Math.round(val * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Claims */}
            {eventData.claims && eventData.claims.length > 0 && (
              <div>
                <div className="text-small" style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Extracted Claims ({eventData.claims.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {eventData.claims.slice(0, 4).map(claim => (
                    <div key={claim.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: '6px', borderLeft: `3px solid ${claim.verdict === 'VERIFIED' ? 'var(--status-success)' : claim.verdict === 'FALSE' ? 'var(--status-critical)' : 'var(--status-warning)'}` }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                        <span className={`badge ${claim.verdict === 'VERIFIED' ? 'badge-success' : claim.verdict === 'FALSE' ? 'badge-breaking' : 'badge-warning'}`}>{claim.verdict}</span>
                        {claim.confidence !== null && claim.confidence !== undefined && (
                          <span className="text-small">{Math.round(claim.confidence * 100)}% confidence</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem' }}>{claim.claim_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {eventData.timeline && eventData.timeline.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Intelligence Timeline</h2>
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[...eventData.timeline]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 8)
                  .map(entry => (
                    <div key={entry.id} style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-1.825rem', top: '0.25rem', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.significance > 0.7 ? 'var(--primary)' : 'var(--border-medium)', border: '2px solid white' }}></span>
                      <div className={`text-small ${entry.significance > 0.7 ? '' : 'text-tertiary'}`} style={{ fontWeight: 700, marginBottom: '0.25rem', color: entry.significance > 0.7 ? 'var(--primary)' : undefined }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{entry.entry_type} Signal Detected</h3>
                      <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{entry.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Source Articles */}
          {eventData.articles && eventData.articles.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Key Sources & Reports</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {eventData.articles.slice(0, 8).map(article => (
                  <a
                    href={article.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    key={article.id}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="card flex items-center gap-4" style={{ backgroundColor: 'var(--bg-app)', border: 'none', padding: '0.875rem 1rem', transition: 'background-color 0.15s', cursor: 'pointer' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0 }}>
                        {(article.source_name || article.source_domain || 'SRC').substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.2rem' }}>
                          <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{article.source_name || article.source_domain || 'Unknown Source'}</h4>
                          <div className="flex items-center gap-2">
                            <span className="badge badge-analysis">{(article.language || 'en').toUpperCase()}</span>
                            {article.credibility_score !== null && article.credibility_score !== undefined && (
                              <span className={`badge ${article.credibility_score > 0.7 ? 'badge-success' : 'badge-warning'}`}>
                                {Math.round(article.credibility_score * 100)}%
                              </span>
                            )}
                            <ExternalLink size={12} color="var(--text-tertiary)" />
                          </div>
                        </div>
                        <p className="text-small text-secondary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {article.title || article.summary || 'Source report'}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>

          {/* Entities */}
          {eventData.primary_entities && eventData.primary_entities.length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--bg-app)', border: 'none' }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Key Entities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {eventData.primary_entities.slice(0, 12).map((v, i) => (
                  <span key={i} className="badge badge-analysis" style={{ padding: '0.375rem 0.625rem', backgroundColor: 'white' }}>
                    {v.type === 'GPE' ? '🌍' : v.type === 'ORG' ? '🏢' : v.type === 'PERSON' ? '👤' : '📍'} {v.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Event Metadata */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Event Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex justify-between text-small">
                <span style={{ color: 'var(--text-tertiary)' }}>First Seen</span>
                <span style={{ fontWeight: 600 }}>{new Date(eventData.first_seen_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-small">
                <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
                <span className={`badge ${eventData.status === 'BREAKING' ? 'badge-breaking' : eventData.status === 'EMERGING' ? 'badge-warning' : 'badge-trending'}`}>{eventData.status}</span>
              </div>
              <div className="flex justify-between text-small">
                <span style={{ color: 'var(--text-tertiary)' }}>Significance</span>
                <span style={{ fontWeight: 600 }}>{Math.round(eventData.significance_score * 100)}%</span>
              </div>
              {eventData.primary_location && Object.keys(eventData.primary_location).length > 0 && (
                <div className="flex justify-between text-small">
                  <span style={{ color: 'var(--text-tertiary)' }}>Region</span>
                  <span style={{ fontWeight: 600 }}>{eventData.primary_location.country || eventData.primary_location.region || 'Global'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Banner */}
          <div className="card flex items-center gap-2" style={{ backgroundColor: 'var(--primary-light)', border: 'none', padding: '1rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0 }}></span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>Live Signal Monitoring Active · {eventData.article_count} sources tracked</span>
          </div>

          <Link to="/intelligence" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary w-full" style={{ padding: '0.875rem', fontSize: '0.9375rem' }}>
              🔎 Search Related Events
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
