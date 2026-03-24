import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Intelligence } from './pages/Intelligence';
import { Alerts } from './pages/Alerts';
import { Briefing } from './pages/Briefing';

const Analytics = () => <div className="scrollarea"><h2>Analytics</h2></div>;

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
        </Routes>
      </main>
    </div>
  );
};

export default App;
