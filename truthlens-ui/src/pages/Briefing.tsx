import React from 'react';

export const Briefing: React.FC = () => {
  return (
    <div className="scrollarea">
       {/* Top Identifier */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
        <span className="badge badge-analysis" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>CRITICAL EVENT</span>
        <span className="text-small text-tertiary">Updated 12 minutes ago</span>
      </div>

      <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 700, marginBottom: '1.5rem', maxWidth: '800px' }}>
        Global Semiconductor Supply Chain Realignment: Impact of New Trade Accords
      </h1>
      
      <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '800px' }}>
        Recent multi-lateral agreements between major manufacturing hubs are projected to shift 15% of global production capacity by 2026. This intelligence brief tracks the diplomatic shifts, corporate reactions, and economic ripples.
      </p>

      <div style={{ display: 'flex', gap: '3rem' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Consensus Block */}
              <div className="card flex-col gap-4">
                  <div className="flex justify-between items-center">
                      <h2 style={{ fontSize: '1.25rem' }}>Consensus & Credibility</h2>
                      <span className="badge badge-success" style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--primary)', padding: '0.35rem 0.75rem' }}>HIGH CONFIDENCE</span>
                  </div>
                  
                  <div className="progress-bar-container" style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-app)', marginTop: '0.5rem' }}>
                      <div className="progress-bar-fill" style={{ width: '82%', backgroundColor: 'var(--primary)', borderRadius: '9999px 0 0 9999px' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-small" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)'}}></span> 82% Verified Facts</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-info)'}}></span> 12% Analysts Estimate</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border-medium)'}}></span> 6% Speculative</span>
                  </div>
              </div>

              {/* Timeline Block */}
              <h2 style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Intelligence Timeline</h2>
              
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-1.825rem', top: '0.25rem', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white'}}></span>
                      <div className="text-small" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem' }}>OCT 24, 09:15 AM</div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Final Accord Signed in Brussels</h3>
                      <p className="text-secondary text-medium">Economic ministers from 12 nations formally signed the 'Lumina Protocol' aiming to secure sovereign chip manufacturing reserves.</p>
                  </div>

                  <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-1.825rem', top: '0.25rem', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-medium)', border: '2px solid white'}}></span>
                      <div className="text-small text-tertiary" style={{ fontWeight: 700, marginBottom: '0.25rem' }}>OCT 23, 11:30 PM</div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Corporate Statement: Tech Giant A</h3>
                      <p className="text-secondary text-medium">The leading consumer electronics manufacturer announced a 3-year pivot plan toward Southeast Asian hubs.</p>
                  </div>

                  <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-1.825rem', top: '0.25rem', display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-medium)', border: '2px solid white'}}></span>
                      <div className="text-small text-tertiary" style={{ fontWeight: 700, marginBottom: '0.25rem' }}>OCT 22, 02:00 PM</div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Market Volatility Warning</h3>
                      <p className="text-secondary text-medium">Intelligence sensors detected early algorithmic sell-offs in legacy logistics stocks ahead of official news.</p>
                  </div>

              </div>

              {/* Sources */}
              <h2 style={{ fontSize: '1.25rem', marginTop: '1rem' }}>Key Sources & Reports</h2>
              <div className="flex-col gap-3">
                  <div className="card flex items-center gap-4" style={{ backgroundColor: 'var(--bg-app)', border: 'none', padding: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--text-primary)', borderRadius: '6px' }}></div>
                      <div style={{ flex: 1 }}>
                          <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                              <h4 style={{ fontWeight: 600 }}>The Global Ledger</h4>
                              <span className="badge badge-analysis">TIER 1</span>
                          </div>
                          <p className="text-small text-secondary">"The restructuring of the semiconductor value chain represents the most significant shift in industrial policy since the 1970s..."</p>
                      </div>
                  </div>
                   <div className="card flex items-center gap-4" style={{ backgroundColor: 'var(--bg-app)', border: 'none', padding: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '6px' }}></div>
                      <div style={{ flex: 1 }}>
                          <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                              <h4 style={{ fontWeight: 600 }}>Market Pulse Intelligence</h4>
                              <span className="badge badge-analysis">TIER 2</span>
                          </div>
                          <p className="text-small text-secondary">"Specific focus on the silicon carbide niche, which remains a primary bottleneck for EV manufacturers during this transition."</p>
                      </div>
                  </div>
              </div>

          </div>

          {/* Right Sidebar */}
          <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Entities */}
              <div className="card" style={{ backgroundColor: 'var(--bg-app)', border: 'none' }}>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Key Entities</h3>
                  <div className="flex flex-wrap gap-2">
                       <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white' }}>🏢 TSMC</span>
                       <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white' }}>🌍 European Union</span>
                       <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white' }}>👤 Ursula v.d. Leyen</span>
                       <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white' }}>🏭 Intel Corp</span>
                       <span className="badge badge-analysis" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'white' }}>📍 South Korea</span>
                  </div>
              </div>

              {/* Status Banner */}
              <div className="card flex items-center gap-2" style={{ backgroundColor: 'var(--primary-light)', border: 'none', padding: '1rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)'}}></span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Live Signal Monitoring Active</span>
              </div>

              {/* Related Briefings */}
              <div>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '1rem' }}>Related Briefings</h3>
                  
                  <div className="flex-col gap-4">
                      <div>
                          <div style={{ width: '100%', height: '100px', backgroundColor: 'var(--border-medium)', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Port Automation & Trade Corridor 04 Dynamics</div>
                          <div className="text-small text-tertiary" style={{ fontStyle: 'italic' }}>3 hours ago &bull; Logistics Intelligence</div>
                      </div>
                      <div>
                          <div style={{ width: '100%', height: '100px', backgroundColor: 'var(--border-medium)', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Rare Earth Supply Quotas: Quarterly Review</div>
                          <div className="text-small text-tertiary" style={{ fontStyle: 'italic' }}>Yesterday &bull; Resource Tracking</div>
                      </div>
                  </div>
              </div>

              <button className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1rem' }}>Export Full Analyst Report</button>
          </div>
      </div>
    </div>
  );
};
