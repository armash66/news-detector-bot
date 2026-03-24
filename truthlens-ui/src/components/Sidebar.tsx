import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bell, BarChart2, Settings, HelpCircle, Plus } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Intelligence', path: '/intelligence', icon: Search },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '1.5rem 1rem'
    }}>
      {/* Logo Block */}
      <div style={{ padding: '0 0.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          backgroundColor: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
        }}>
          TL
        </div>
        <h2 style={{ fontSize: '1.125rem', margin: 0 }}>TruthLens</h2>
      </div>

      {/* Primary Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
            })}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}

        {/* Action Button */}
        <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
          <button className="btn btn-primary w-full">
            <Plus size={18} /> New Briefing
          </button>
        </div>
      </nav>

      {/* Footer Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <a href="#" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
            textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500
        }}>
          <Settings size={20} /> Settings
        </a>
        <a href="#" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
            textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500
        }}>
          <HelpCircle size={20} /> Support
        </a>
        
        {/* User Profile */}
        <div style={{
          marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-app)', 
          borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)'
          }}></div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)'}}>Intelligence Unit</div>
            <div className="text-small">GLOBAL FEED</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
