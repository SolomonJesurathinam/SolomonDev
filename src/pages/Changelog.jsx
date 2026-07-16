import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUpCircle, CheckCircle, Flame, Calendar, Info } from 'lucide-react';
import { getChangelogs, getApps } from '../data/db';
import CustomDropdown from '../components/CustomDropdown';

export default function Changelog() {
  const [apps, setApps] = useState([]);
  const [changelogs, setChangelogs] = useState([]);
  const [selectedApp, setSelectedApp] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      const appData = await getApps();
      setApps(appData);
      document.title = 'App Release Changelogs | Solomon J';
    }
    loadApps();
  }, []);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const data = await getChangelogs(selectedApp === 'All' ? '' : selectedApp);
      setChangelogs(data);
      setLoading(false);
    }
    loadLogs();
  }, [selectedApp]);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-accent">Release Logs</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          App <span className="text-gradient-purple">Changelog</span> Feed
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Stay updated with the latest version releases, optimizations, patches, and feature updates across the app catalog.
        </p>
      </div>

      {/* Filter toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2.5rem',
        background: 'var(--bg-card-glass)',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Application:</span>
        <CustomDropdown
          options={[
            { value: 'All', label: 'All Apps' },
            ...apps.map(app => ({ value: app.id, label: app.name }))
          ]}
          value={selectedApp}
          onChange={setSelectedApp}
          style={{ width: '220px' }}
        />
      </div>

      {/* Changelog Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : changelogs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card-glass)',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)'
        }}>
          <Info style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Release Logs Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No changelogs have been added for the selected filter.</p>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          paddingLeft: '2rem',
          borderLeft: '2px solid rgba(139, 92, 246, 0.15)'
        }}>
          {changelogs.map((log, index) => (
            <div 
              key={log.id} 
              style={{
                position: 'relative',
                marginBottom: index === changelogs.length - 1 ? '0' : '3.5rem'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: 'calc(-2rem - 9px)',
                top: '6px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--bg-dark)',
                border: '3px solid var(--accent-purple)',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
              }} />

              {/* Version & Date */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {log.apps?.name} <span className="text-gradient-purple" style={{ fontSize: '1.25rem' }}>v{log.version}</span>
                </h3>
                
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  {new Date(log.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Changelog Card */}
              <div style={{
                background: 'var(--bg-card-glass)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-glass)'
              }}>
                {/* Added */}
                {log.added && log.added.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <Sparkles style={{ width: '14px', height: '14px' }} /> What's New
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {log.added.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: '1.5' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improved */}
                {log.improved && log.improved.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: 'var(--accent-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <ArrowUpCircle style={{ width: '14px', height: '14px' }} /> Improvements
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {log.improved.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: '1.5' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixed */}
                {log.fixed && log.fixed.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <CheckCircle style={{ width: '14px', height: '14px' }} /> Bug Fixes
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {log.fixed.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: '1.5' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Removed */}
                {log.removed && log.removed.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <Flame style={{ width: '14px', height: '14px' }} /> Deprecated / Removed
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {log.removed.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: '1.5' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
