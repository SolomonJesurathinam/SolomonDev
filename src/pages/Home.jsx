import React from 'react';
import { Link } from 'react-router-dom';
import { apps } from '../data/apps';
import AppCard from '../components/AppCard';
import { ArrowRight, Layers, Star, Download, Smartphone } from 'lucide-react';

export default function Home() {
  // Select 4 main featured apps to showcase on Home
  const featuredApps = apps.filter(app => 
    ['ipynb-viewer', 'pdfolio', 'emi-buddy', 'onegrid'].includes(app.id)
  );

  return (
    <div className="home-wrapper fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-tag">
          <div className="pulse-dot"></div>
          <span>Android App Developer</span>
        </div>
        <h1 className="hero-title">
          Creating Premium, <br />
          <span className="gradient-text">Utility-Driven Mobile Apps</span>
        </h1>
        <p className="hero-desc">
          Hi, I'm Solomon J. I build high-performance, offline-first, and privacy-conscious Android applications. From advanced notebook renderers to finance tracking tools, my focus is on absolute usability and clean UI.
        </p>
        <div className="hero-actions">
          <Link to="/apps" className="btn btn-primary">
            <span>Explore All Apps</span>
            <Layers size={16} />
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            <span>Get in Touch</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-value">100K+</div>
            <div className="stat-label">Active Installs</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">8+</div>
            <div className="stat-label">Published Apps</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">4.5★</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Featured Apps Section */}
      <section className="featured-apps container">
        <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Featured Applications</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Explore my top utility and productivity tools available on Google Play.</p>
        </div>

        <div className="grid-2">
          {featuredApps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/apps" className="btn btn-secondary" style={{ gap: '12px' }}>
            <span>View All 8 Applications</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
