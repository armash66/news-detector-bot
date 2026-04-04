import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home.tsx';
import { Intelligence } from './pages/Intelligence.tsx';
import { Alerts } from './pages/Alerts.tsx';
import { Analytics } from './pages/Analytics.tsx';
import { Briefing } from './pages/Briefing.tsx';
import { Analyze } from './pages/Analyze.tsx';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/briefing" element={<Briefing />} />
          <Route path="/analyze" element={<Analyze />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
