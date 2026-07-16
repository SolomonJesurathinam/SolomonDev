import React, { useState, useEffect } from 'react';
import { Download, FileText, Code, GitFork, Link as LinkIcon, BookOpen } from 'lucide-react';
import { getResources } from '../data/db';

const RESOURCE_TYPES = ['All', 'Cheat Sheet', 'Repository', 'Template', 'PDF'];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All');
  const [hoveredCardId, setHoveredCardId] = useState(null);

  useEffect(() => {
    async function loadResources() {
      const data = await getResources();
      setResources(data);
      setLoading(false);
    }
    loadResources();
  }, []);

  const filteredResources = resources.filter(res => {
    return activeType === 'All' || res.type === activeType;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'Repository': return <Code style={{ width: '20px', height: '20px', color: '#ec4899' }} />;
      case 'Template': return <GitFork style={{ width: '20px', height: '20px', color: '#4f46e5' }} />;
      case 'PDF': return <BookOpen style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      default: return <FileText style={{ width: '20px', height: '20px', color: '#10b981' }} />;
    }
  };

  const getResourceIconContainerStyle = (type) => {
    switch (type) {
      case 'Repository':
        return {
          backgroundColor: 'rgba(236, 72, 153, 0.06)',
          border: '1px solid rgba(236, 72, 153, 0.15)'
        };
      case 'Template':
        return {
          backgroundColor: 'rgba(79, 70, 229, 0.06)',
          border: '1px solid rgba(79, 70, 229, 0.15)'
        };
      case 'PDF':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.15)'
        };
      default:
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.15)'
        };
    }
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category?.toLowerCase()) {
      case 'android':
        return {
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          color: '#4f46e5',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          padding: '0.25rem 0.65rem',
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        };
      case 'automation':
        return {
          backgroundColor: 'rgba(15, 118, 110, 0.08)',
          color: '#0f766e',
          border: '1px solid rgba(15, 118, 110, 0.15)',
          padding: '0.25rem 0.65rem',
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        };
      case 'ai':
        return {
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          color: '#0284c7',
          border: '1px solid rgba(2, 132, 199, 0.15)',
          padding: '0.25rem 0.65rem',
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        };
      default:
        return {
          backgroundColor: 'rgba(100, 116, 139, 0.08)',
          color: '#64748b',
          border: '1px solid rgba(100, 116, 139, 0.15)',
          padding: '0.25rem 0.65rem',
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        };
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-accent">Developer Toolbox</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Free <span className="text-gradient-purple">Resources</span> & Code
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Download cheat sheets, access boilerplates, open-source QA frameworks, and mobile dev utilities.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '2.5rem'
      }}>
        {RESOURCE_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: activeType === type ? 'var(--accent-purple)' : 'var(--border-color)',
              backgroundColor: activeType === type ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: activeType === type ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeType === type ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <FileText style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Resources Available</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for updates or select another category filter.</p>
        </div>
      ) : (
        <div className="apps-grid">
          {filteredResources.map(res => (
            <div
              key={res.id}
              onMouseEnter={() => setHoveredCardId(res.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid',
                borderColor: hoveredCardId === res.id ? 'var(--accent-purple)' : 'var(--border-color)',
                borderRadius: '20px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxShadow: hoveredCardId === res.id ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
                transform: hoveredCardId === res.id ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Header Icon & Category */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getResourceIconContainerStyle(res.type)
                }}>
                  {getResourceIcon(res.type)}
                </div>
                <span style={getCategoryBadgeStyle(res.category)}>{res.category}</span>
              </div>

              {/* Title & Desc */}
              <h3 style={{ 
                fontSize: '1.15rem', 
                fontWeight: '700', 
                color: 'var(--text-primary)', 
                marginBottom: '0.75rem', 
                lineHeight: '1.4' 
              }}>
                {res.title}
              </h3>
              
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                flexGrow: 1
              }}>
                {res.description}
              </p>

              {/* Highlights Bullet Point */}
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                fontWeight: '500'
              }}>
                {res.type === 'Template' && '• Ready-to-run boilerplate'}
                {res.type === 'Repository' && '• Open-source codebase'}
                {res.type === 'Cheat Sheet' && '• Direct PDF/Markdown reference'}
                {res.type === 'PDF' && '• Printable guidelines & tips'}
              </div>

              {/* Action Link */}
              <div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    width: '100%',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {res.type === 'Repository' || res.type === 'Template' ? (
                    <>
                      View Repository <LinkIcon style={{ width: '15px', height: '15px' }} />
                    </>
                  ) : (
                    <>
                      Download File <Download style={{ width: '15px', height: '15px' }} />
                    </>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
