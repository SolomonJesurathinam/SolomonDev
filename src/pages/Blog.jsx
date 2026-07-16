import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ThumbsUp, Eye, ArrowRight, BookOpen } from 'lucide-react';
import { getBlogs } from '../data/db';

const CATEGORIES = ['All', 'Android', 'AI', 'Automation', 'General'];

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function loadBlogs() {
      const data = await getBlogs();
      setBlogs(data);
      document.title = 'Technical Blog | Solomon J';
      setLoading(false);
    }
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container" style={{ paddingTop: '100px', pb: '100px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-accent">Developer Knowledge Base</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Latest <span className="text-gradient-purple">Insights</span> & Tutorials
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Explore articles on Android engineering, AI integration, QA automation, and developer productivity.
        </p>
      </div>

      {/* Filters & Search */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        background: 'var(--bg-card-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-glass)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            width: '20px',
            height: '20px'
          }} />
          <input
            type="text"
            className="search-input-with-icon"
            placeholder="Search articles, keywords, technology stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-glow)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
          />
        </div>

        {/* Categories Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeCategory === category ? 'var(--accent-purple)' : 'var(--border-glass)',
                backgroundColor: activeCategory === category ? 'var(--accent-purple)' : 'rgba(255,255,255,0.02)',
                color: activeCategory === category ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeCategory === category ? '0 0 12px rgba(139, 92, 246, 0.3)' : 'none'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Fetching articles...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card-glass)',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)'
        }}>
          <BookOpen style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Articles Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try broadening your search or switching categories.</p>
        </div>
      ) : (
        <div className="apps-grid">
          {filteredBlogs.map(post => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="card-glow"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-card-glass)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-glass)',
                height: '100%',
                transition: 'transform 0.3s ease, border-color 0.3s ease'
              }}
            >
              {/* Card Banner Decal */}
              <div style={{
                height: '8px',
                background: post.category === 'AI' 
                  ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' 
                  : post.category === 'Android' 
                    ? 'linear-gradient(90deg, #10b981, #3b82f6)' 
                    : 'linear-gradient(90deg, #f59e0b, #ef4444)'
              }} />

              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Meta details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    color: post.category === 'AI' ? '#4f46e5' : post.category === 'Android' ? '#0f766e' : '#d97706',
                    backgroundColor: post.category === 'AI' 
                      ? 'rgba(79, 70, 229, 0.08)' 
                      : post.category === 'Android' 
                        ? 'rgba(15, 118, 110, 0.08)' 
                        : 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid',
                    borderColor: post.category === 'AI' 
                      ? 'rgba(79, 70, 229, 0.2)' 
                      : post.category === 'Android' 
                        ? 'rgba(15, 118, 110, 0.2)' 
                        : 'rgba(217, 119, 6, 0.2)',
                  }}>
                    {post.category}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {post.reading_time}m
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  lineHeight: '1.4',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  transition: 'color 0.3s ease'
                }} className="blog-title">
                  {post.title}
                </h3>

                {/* Summary Snippet */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.content.replace(/[#*`]/g, '')}
                </p>

                {/* Bottom stats and link */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Eye style={{ width: '14px', height: '14px' }} />
                      {post.views || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ThumbsUp style={{ width: '14px', height: '14px' }} />
                      {post.likes || 0}
                    </span>
                  </div>

                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--accent-purple)',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }} className="read-more-link">
                    Read Article <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
