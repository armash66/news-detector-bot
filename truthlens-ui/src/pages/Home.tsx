import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="scrollarea">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          Event Feed
          <span className="badge badge-success" style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginRight: '6px' }}></span>
            LIVE UPDATES
          </span>
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search events, entities, or regions..." 
              style={{
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-app)',
                width: '300px',
                fontSize: '0.875rem'
              }}
            />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
        <button className="badge" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>All Events</button>
        <button className="badge badge-analysis" style={{ padding: '0.5rem 1rem' }}>Geopolitics</button>
        <button className="badge badge-analysis" style={{ padding: '0.5rem 1rem' }}>Tech & Markets</button>
        <button className="badge badge-analysis" style={{ padding: '0.5rem 1rem' }}>Environment</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Break Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--status-critical)', position: 'relative' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <span className="badge badge-breaking">BREAKING</span>
                    <span className="text-small">14m ago</span>
                </div>
                <h2 style={{ marginBottom: '0.75rem' }}>Global Supply Chain Disruptions Intensify Amid Strategic Port Closure in Southeast Asia</h2>
                <p style={{ marginBottom: '1.5rem' }}>Critical logistical hubs report a 40% decrease in container throughput as regional tensions lead to temporary suspension of operations. Analysts predict immediate impacts on consumer electronics pricing.</p>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-small">
                        <div className="flex" style={{ marginLeft: '0.5rem' }}>
                             {/* Mock Avatars */}
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white', marginLeft: '-0.5rem' }}></div>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--status-info)', border: '2px solid white', marginLeft: '-0.5rem' }}></div>
                        </div>
                        32 Sources Tracked
                    </div>
                    <div className="flex items-center gap-2 text-small font-bold" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        CREDIBILITY 
                        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: '92%' }}></div></div>
                        92%
                    </div>
                </div>
            </div>

            {/* Trending Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <span className="badge badge-trending">TRENDING</span>
                    <span className="text-small">2h ago</span>
                </div>
                <h2 style={{ marginBottom: '0.75rem' }}>Breakthrough in Solid-State Battery Tech Promises 1,000 Mile EV Range</h2>
                <p style={{ marginBottom: '1.5rem' }}>A major automotive conglomerate unveils prototype high-density cells that eliminate thermal runaway risks. Industry experts suggest mass production could begin by late 2026.</p>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-small">
                        <div className="flex" style={{ marginLeft: '0.5rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--status-info)', border: '2px solid white', marginLeft: '-0.5rem' }}></div>
                        </div>
                        18 Sources Tracked
                    </div>
                    <div className="flex items-center gap-2 text-small font-bold" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        CREDIBILITY 
                        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: '85%' }}></div></div>
                        85%
                    </div>
                </div>
            </div>
            
            <button className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '1rem' }}>Load More Intelligence</button>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Global Hotspots</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-medium text-primary">Southeast Asia</span>
                        <span className="badge badge-breaking" style={{ fontSize: '0.6rem' }}>High Activity</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-medium text-primary">Central Europe</span>
                        <span className="badge badge-analysis" style={{ fontSize: '0.6rem', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>Normal</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-medium text-primary">Middle East</span>
                        <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>Developing</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                <h3 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     Pro-Tip: Advanced Filtering
                </h3>
                <p style={{ color: 'var(--primary-light)', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                    Combine "Entity" tags with "Geopolitics" to create custom alerts for specific corporate competitors.
                </p>
                <button className="btn w-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                    VIEW TUTORIAL
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
