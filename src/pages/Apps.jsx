import React, { useState, useEffect } from 'react';
import AppCard from '../components/AppCard';
import { getApps } from '../data/db';
import { apps } from '../data/apps';

export default function Apps() {
  const [appsList, setAppsList] = useState(apps);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Productivity', 'Finance', 'Education'];

  useEffect(() => {
    async function fetchApps() {
      const data = await getApps();
      if (data && data.length > 0) {
        setAppsList(data);
      }
      setLoading(false);
    }
    fetchApps();
  }, []);

  const filteredApps = activeTab === 'All'
    ? appsList
    : appsList.filter(app => app.category === activeTab);

  return (
    <div className="apps-page container fade-in" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="grid-3" style={{ marginTop: '40px' }}>
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}

