import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { apps } from '../data/apps';
import * as Icons from 'lucide-react';
import { ArrowLeft, Play, Shield, Mail, CheckCircle2, Info } from 'lucide-react';

export default function AppDetail() {
  const { id } = useParams();
  const app = apps.find(a => a.id === id);

  if (!app) {
    return (
      <div className="container fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <Info size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
        <h2>Application Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 30px' }}>
          The application you are looking for does not exist or has been moved.
        </p>
        <Link to="/apps" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Apps</span>
        </Link>
      </div>
    );
  }

  const IconComponent = Icons[app.iconName] || Icons.FileCode;

  return (
    <div className="container fade-in" style={{ padding: '40px 24px' }}>
      {/* Back button */}
      <Link to="/apps" className="btn btn-secondary" style={{ marginBottom: '32px', alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} />
        <span>Back to Gallery</span>
      </Link>

      {/* App Header Hero */}
      <div className="glass" style={{ padding: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div 
            style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '22px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color-hover)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--secondary)',
              boxShadow: '0 0 20px -5px var(--secondary-glow)'
            }}
          >
            <IconComponent size={48} />
          </div>

          <div style={{ flex: '1', textAlign: 'left', minWidth: '250px' }}>
            <span className={`badge ${app.badgeType}`} style={{ marginBottom: '8px' }}>{app.category}</span>
            <h1 style={{ fontSize: '32px', margin: '0 0 6px 0', border: 'none', padding: '0' }}>{app.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
              Package: {app.packageId}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href={app.playStoreUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-accent"
            >
              <Play size={16} fill="currentColor" />
              <span>Get on Play Store</span>
            </a>
            <Link 
              to={`/privacy?app=${app.id}`} 
              className="btn btn-secondary"
            >
              <Shield size={16} />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid-2">
        {/* Left Column: About & Long description */}
        <div className="glass" style={{ padding: '32px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            About the App
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
            {app.longDesc}
          </p>
        </div>

        {/* Right Column: Key Features & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Features */}
          <div className="glass" style={{ padding: '32px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Key Features
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {app.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* App Specs */}
          <div className="glass" style={{ padding: '32px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              App Specs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Developer</span>
                <span style={{ fontWeight: '500' }}>Solomon J</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Platform</span>
                <span style={{ fontWeight: '500' }}>Android (Google Play)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>License</span>
                <span style={{ fontWeight: '500' }}>{app.id.includes('pro') ? 'Paid / Ad-Free' : 'Free (Contains Ads)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Support</span>
                <span style={{ fontWeight: '500', color: 'var(--secondary)' }}>
                  solomon.jesurathinam@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
