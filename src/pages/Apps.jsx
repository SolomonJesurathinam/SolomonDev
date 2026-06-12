import React, { useState } from 'react';
import { apps } from '../data/apps';
import AppCard from '../components/AppCard';

export default function Apps() {
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Productivity', 'Finance', 'Education'];

  const filteredApps = activeTab === 'All'
    ? apps
    : apps.filter(app => app.category === activeTab);

  return (
    <div className="apps-page container fade-in">
      <div className="apps-header">
        <h1>My Applications</h1>
        <p>A full portfolio of Android apps published on the Google Play Store</p>
        
        <div className="filter-tabs glass">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`filter-btn ${activeTab === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '40px' }}>
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
