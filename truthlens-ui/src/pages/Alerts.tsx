import React, { useEffect, useState } from 'react';
import { Settings, CheckCircle, RefreshCw } from 'lucide-react';
import { api, type AlertResponse } from '../api';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, WARNING: 1, MEDIUM: 2, LOW: 3 };

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [severityFilter, setSeverityFilter] = useState('');
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlerts(50);
      setAlerts(data);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setError('Could not load alerts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId);
    try {
      await api.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    } finally {
      setAcknowledging(null);
    }
  };

  const displayed = alerts
    .filter(a => tab === 'active' ? !a.acknowledged : a.acknowledged)
    .filter(a => !severityFilter || a.severity === severityFilter)
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));

  // Counts
  const activeCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'CRITICAL').length;

  return (
    <div className="scrollarea">
      {/* Top Bar */}
      <div className="flex-col" style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
          Intelligence Unit &rsaquo; <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Priority Alerts</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Intelligence Alerts
            {criticalCount > 0 && (
              <span className="badge badge-breaking">{criticalCount} CRITICAL</span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Tab Switcher */}
            <div className="flex card" style={{ padding: '0.25rem', gap: '0.25rem', borderRadius: '8px' }}>
              <button
                onClick={() => setTab('active')}
                style={{ padding: '0.5rem 1rem', background: tab === 'active' ? 'var(--primary)' : 'transparent', color: tab === 'active' ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                Active {activeCount > 0 && `(${activeCount})`}
              </button>
              <button
                onClick={() => setTab('archived')}
                style={{ padding: '0.5rem 1rem', background: tab === 'archived' ? 'var(--bg-app)' : 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                Acknowledged
              </button>
            </div>
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'white', fontSize: '0.875rem', color: 'var(--text-primary)' }}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={fetchAlerts} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <p className="text-secondary text-small" style={{ marginTop: '0.25rem' }}>
          Real-time monitoring of global events, market shifts, and emerging risks.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Main Alerts List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
              Scanning alert streams...
            </div>
          )}

          {error && (
            <div className="card" style={{ borderLeft: '4px solid var(--status-critical)', padding: '1rem 1.5rem' }}>
              <p style={{ color: 'var(--status-critical)', fontWeight: 600, margin: 0 }}>⚠ Connection Error</p>
              <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
            </div>
          )}

          {!loading && !error && displayed.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: 600 }}>{tab === 'active' ? 'No active alerts.' : 'No acknowledged alerts.'}</div>
              <p>Thresholds nominal. All monitoring channels operational.</p>
            </div>
          )}

          {!loading && displayed.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            let borderColor = 'var(--primary)';
            let badgeClass = 'badge-analysis';

            if (isCritical) { borderColor = 'var(--status-critical)'; badgeClass = 'badge-breaking'; }
            else if (isWarning) { borderColor = 'var(--status-warning)'; badgeClass = 'badge-warning'; }

            return (
              <div key={alert.id} className="card" style={{ borderLeft: `4px solid ${borderColor}`, opacity: alert.acknowledged ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${badgeClass}`}>! {alert.severity}</span>
                    <span className="badge badge-analysis">{alert.alert_type}</span>
                    <span className="text-small">{formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.acknowledged && (
                      <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} />Acknowledged</span>
                    )}
                    <Settings size={16} color="var(--text-tertiary)" />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.625rem' }}>{alert.title}</h3>
                <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>
                  {alert.description || 'Systemic threshold breached automatically. Details pending.'}
                </p>

                <div className="flex items-center gap-3">
                  {alert.event_id && (
                    <Link to={`/briefing?id=${alert.event_id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>View Related Event →</button>
                    </Link>
                  )}
                  {!alert.acknowledged && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', backgroundColor: 'var(--status-success)' }}
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledging === alert.id}
                    >
                      <CheckCircle size={14} />
                      {acknowledging === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && !error && alerts.length > 0 && (
            <button className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '0.5rem' }} onClick={fetchAlerts}>
              <RefreshCw size={14} /> Refresh Alerts
            </button>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>

          {/* Summary Stats */}
          <div className="card" style={{ backgroundColor: 'var(--bg-app)', border: 'none', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
              Alert Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--status-critical-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-critical)' }}>
                  {alerts.filter(a => !a.acknowledged && a.severity === 'CRITICAL').length}
                </div>
                <div className="text-small">Critical</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--status-warning-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-warning)' }}>
                  {alerts.filter(a => !a.acknowledged && a.severity === 'WARNING').length}
                </div>
                <div className="text-small">Warning</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--status-info-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-info)' }}>
                  {alerts.filter(a => !a.acknowledged).length}
                </div>
                <div className="text-small">Active</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--status-success-bg)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-success)' }}>
                  {alerts.filter(a => a.acknowledged).length}
                </div>
                <div className="text-small">Resolved</div>
              </div>
            </div>
          </div>

          {/* Risk Exposure */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Risk Exposure by Type</h3>
            {(() => {
              const typeCounts: Record<string, number> = {};
              alerts.filter(a => !a.acknowledged).forEach(a => { typeCounts[a.alert_type] = (typeCounts[a.alert_type] || 0) + 1; });
              const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const maxVal = types[0]?.[1] || 1;
              if (types.length === 0) return <p className="text-small text-secondary">No active alerts.</p>;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {types.map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-small" style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500 }}>{type}</span>
                        <span style={{ fontWeight: 700 }}>{count}</span>
                      </div>
                      <div className="progress-bar-container" style={{ width: '100%', height: '4px' }}>
                        <div className="progress-bar-fill" style={{ width: `${(count / maxVal) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Monitoring Channels */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Monitoring Channels</h3>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem' }}>🌍 Geopolitics</span>
              <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem' }}>🏛 Finance</span>
              <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>💻 Technology</span>
              <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem' }}>🌱 Sustainability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
