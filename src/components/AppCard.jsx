import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowRight, Shield, Play } from 'lucide-react';

export default function AppCard({ app }) {
  // Dynamically map icon name from lucide-react
  const IconComponent = Icons[app.iconName] || Icons.FileCode;

  const categoryClass = `card-${app.category.toLowerCase()}`;

  return (
    <article className={`app-card ${categoryClass} glass fade-in`}>
      <div className="app-card-header">
        <div className="app-icon-wrapper">
          <IconComponent size={28} />
        </div>
        <div className="app-title-area">
          <span className={`badge ${app.badgeType}`}>{app.category}</span>
          <h3 className="app-name">{app.name}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
            {app.packageId}
          </span>
        </div>
      </div>

      <p className="app-desc">{app.shortDesc}</p>

      <ul className="app-features-list">
        {app.features.slice(0, 3).map((feature, idx) => (
          <li key={idx} className="app-feature-item">
            <Icons.Check size={14} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="app-card-footer">
        <Link to={`/apps/${app.id}`} className="btn btn-secondary">
          <span>Details</span>
          <ArrowRight size={14} />
        </Link>
        <a 
          href={app.playStoreUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-accent"
        >
          <Play size={14} fill="currentColor" />
          <span>Get App</span>
        </a>
      </div>
    </article>
  );
}
