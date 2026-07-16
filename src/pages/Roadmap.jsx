import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Calendar, ChevronRight } from 'lucide-react';
import { getFeatureRequests } from '../data/db';

const COLUMNS = [
  { status: 'Under Review', title: 'Under Review', desc: 'Evaluating ideas and feasibility', border: '#f59e0b' },
  { status: 'Planned', title: 'Planned', desc: 'Committed to development roadmap', border: 'var(--accent-purple)' },
  { status: 'In Progress', title: 'In Progress', desc: 'Actively designing and coding', border: 'var(--accent-glow)' },
  { status: 'Released', title: 'Released', desc: 'Shipped to Google Play Store', border: 'var(--accent-green)' }
];

export default function Roadmap() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatures() {
      const data = await getFeatureRequests('', '', 'votes');
      setFeatures(data);
      setLoading(false);
    }
    loadFeatures();
  }, []);

  const getFeaturesByStatus = (status) => {
    return features.filter(f => f.status === status);
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-accent">Release Pipeline</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Product <span className="text-gradient-purple">Roadmap</span> & Status
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Track the development lifecycle of your requested features. Items are sorted by community upvotes.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {COLUMNS.map(col => {
            const items = getFeaturesByStatus(col.status);
            return (
              <div 
                key={col.status} 
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '75vh',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Column Header */}
                <div style={{
                  borderBottom: `2px solid ${col.border}`,
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>{col.title}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)'
                    }}>
                      {items.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{col.desc}</p>
                </div>

                {/* Column Body / Cards List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  overflowY: 'auto',
                  flexGrow: 1,
                  paddingRight: '4px'
                }}>
                  {items.length === 0 ? (
                    <div style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      border: '1px dashed rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      fontStyle: 'italic'
                    }}>
                      No items
                    </div>
                  ) : (
                    items.map(item => (
                      <div 
                        key={item.id}
                        style={{
                          background: 'var(--bg-card-glass)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        className="card-glow"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                            {item.apps?.name || 'General'}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontWeight: '600'
                          }}>
                            <ThumbsUp style={{ width: '10px', height: '10px' }} />
                            {item.votes || 0}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>
                          {item.title}
                        </h4>
                        
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.description}
                        </p>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255,255,255,0.03)',
                          marginTop: '0.25rem'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar style={{ width: '10px', height: '10px' }} />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          
                          <Link 
                            to="/feedback" 
                            style={{
                              color: 'var(--accent-purple)',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            Vote <ChevronRight style={{ width: '12px', height: '12px' }} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
