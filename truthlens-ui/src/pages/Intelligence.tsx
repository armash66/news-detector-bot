import React from 'react';
import { Search, Map, Calendar, AlertTriangle } from 'lucide-react';

export const Intelligence: React.FC = () => {
  return (
    <div className="scrollarea">
       {/* Top Bar for Intelligence */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          Intelligence Search
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }} />
                <input 
                    type="text" 
                    placeholder="Search global news events, entities, or intelligence reports..." 
                    style={{
                        padding: '0.625rem 1rem 0.625rem 2.5rem', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        width: '500px',
                        fontSize: '0.875rem'
                    }}
                />
            </div>
            
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Left Filter Sidebar */}
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             
             <div>
                 <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Intelligence Filters</h3>
                 
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Date Range</label>
                 <select style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-app)', marginBottom: '1.5rem' }}>
                     <option>Last 24 Hours</option>
                     <option>Past 7 Days</option>
                     <option>Past 30 Days</option>
                 </select>

                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Geographic Focus</label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                     <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                         <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }}/> North America
                     </label>
                     <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                         <input type="checkbox" style={{ accentColor: 'var(--primary)' }}/> European Union
                     </label>
                     <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                         <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }}/> East Asia
                     </label>
                     <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                         <input type="checkbox" style={{ accentColor: 'var(--primary)' }}/> Middle East
                     </label>
                 </div>

                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Event Category</label>
                 <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span className="badge badge-analysis" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'transparent' }}>Macro-Econ</span>
                    <span className="badge badge-analysis">Cybersecurity</span>
                    <span className="badge badge-analysis">Geopolitical</span>
                    <span className="badge badge-analysis">ESG</span>
                 </div>

                 <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                     <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Credibility Floor</label>
                     <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>85%</span>
                 </div>
                 <input type="range" min="0" max="100" defaultValue="85" style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: '0.5rem' }} />
                 <p className="text-small" style={{ fontStyle: 'italic', marginBottom: '2rem' }}>Filters out unverified sources and speculative reporting.</p>
                 
                 {/* Smart Alerts Box */}
                 <div className="card" style={{ backgroundColor: 'var(--primary-light)', border: 'none', padding: '1.25rem' }}>
                     <h3 style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                         <AlertTriangle size={16} /> Smart Alerts
                     </h3>
                     <p style={{ fontSize: '0.8rem', color: 'var(--primary-hover)', marginBottom: '1rem' }}>
                         Save this search to receive real-time notifications when new events match these criteria.
                     </p>
                     <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                         Configure Automation
                     </button>
                 </div>
             </div>
          </div>

          {/* Search Results */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Search Results</h2>
                  <div className="flex gap-2 items-center text-small">
                      Sort by: <select style={{ border: 'none', backgroundColor: 'transparent', fontWeight: 600 }}><option>Significance</option><option>Recent</option><option>Credibility</option></select>
                  </div>
              </div>
              <p className="text-secondary text-small" style={{ marginBottom: '1rem' }}>Showing 128 intelligence events matching your current filters.</p>

              {/* Result Cards */}
              <div className="card flex gap-4" style={{ padding: '1rem' }}>
                  <div style={{ width: '180px', height: '140px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', flexShrink: 0 }}></div>
                  <div className="flex-col justify-between w-full">
                      <div>
                          <div className="flex items-center gap-2 mb-2" style={{ marginBottom: '0.5rem' }}>
                              <span className="badge badge-success">HIGH CREDIBILITY</span>
                              <span className="text-small">24 mins ago</span>
                          </div>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Global Semiconductor Supply Chain Stabilizes Amid New Trade Agreements</h3>
                          <p className="text-small text-secondary" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              Intelligence indicates a 15% reduction in lead times across South East Asian manufacturing hubs following recent bilateral logistics accords between TSMC and regional governments.
                          </p>
                      </div>
                      <div className="flex items-center gap-2 text-small" style={{ marginTop: '1rem' }}>
                          <span style={{ fontWeight: 600 }}>Reports from Reuters, Bloomberg, and Nikkei</span>
                      </div>
                  </div>
              </div>

               <div className="card flex gap-4" style={{ padding: '1rem' }}>
                  <div style={{ width: '180px', height: '140px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', flexShrink: 0 }}></div>
                  <div className="flex-col justify-between w-full">
                      <div>
                          <div className="flex items-center gap-2 mb-2" style={{ marginBottom: '0.5rem' }}>
                              <span className="badge badge-warning">DEVELOPING RISK</span>
                              <span className="text-small">2 hours ago</span>
                          </div>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Central European Power Grid Faces Critical Strain Due to Maintenance Overlap</h3>
                          <p className="text-small text-secondary" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              Scheduled maintenance in Germany and unexpected outages in France create a 2.4GW deficit, driving spot prices to 6-month highs. Secondary manufacturers slowing production.
                          </p>
                      </div>
                      <div className="flex items-center gap-2 text-small" style={{ marginTop: '1rem' }}>
                          <span style={{ fontWeight: 600 }}>Verified by Grid Monitor & Reuters</span>
                      </div>
                  </div>
              </div>
              
              <button className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '1rem' }}>Load More Intelligence Events</button>
          </div>
      </div>
    </div>
  );
};
