import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apps } from '../data/apps';
import AppCard from '../components/AppCard';
import { 
  ArrowRight, Layers, Star, Download, Smartphone, BookOpen, 
  MessageSquare, Terminal, Calendar, Clock, ThumbsUp, ChevronRight 
} from 'lucide-react';
import { getBlogs, getFeatureRequests, getChangelogs } from '../data/db';

export default function Home() {
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [topFeatures, setTopFeatures] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function loadHomeFeed() {
      try {
        const blogsData = await getBlogs();
        const featuresData = await getFeatureRequests();
        const logsData = await getChangelogs();

        setLatestBlogs(blogsData.slice(0, 2));
        setTopFeatures(featuresData.slice(0, 2));
        setRecentLogs(logsData.slice(0, 2));
      } catch (err) {
        console.error('Error loading home feed:', err);
      }
    }
    loadHomeFeed();
  }, []);

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

      {/* Dynamic Blog Posts Section */}
      {latestBlogs.length > 0 && (
        <section className="container" style={{ marginTop: '80px' }}>
          <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Latest Tech Insights</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Articles on Android SDKs, AI integrations, and automation systems.</p>
          </div>

          <div className="grid-2">
            {latestBlogs.map(post => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`} 
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--bg-card-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
                className="card-glow"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{post.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock style={{ width: '12px', height: '12px' }} /> {post.reading_time} min read
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>{post.title}</h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.content.replace(/[#*`]/g, '')}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    Read Post <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link to="/blog" className="btn btn-secondary" style={{ gap: '12px' }}>
              <span>Browse Knowledge Base</span>
              <BookOpen size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Roadmap & Release Updates Section */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          
          {/* Roadmap Highlights */}
          {topFeatures.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>Top Suggestions</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upvoted feature requests by the community.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topFeatures.map(feat => (
                  <Link 
                    key={feat.id}
                    to={`/apps/${feat.app_id}?tab=features`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      gap: '1rem',
                      background: 'var(--bg-card-glass)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      alignItems: 'flex-start'
                    }}
                    className="card-glow"
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '0.4rem',
                      minWidth: '40px'
                    }}>
                      <ThumbsUp style={{ width: '14px', height: '14px', color: 'var(--accent-purple)', marginBottom: '0.2rem' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{feat.votes}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>{feat.apps?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: '700' }}>{feat.status}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{feat.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{feat.description}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/feedback" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Vote on Features <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Release Changelogs */}
          {recentLogs.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>Recent Releases</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Check out what has been shipped lately.</p>
              </div>

              <div style={{
                position: 'relative',
                paddingLeft: '1.5rem',
                borderLeft: '2px solid rgba(139, 92, 246, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {recentLogs.map(log => (
                  <Link 
                    key={log.id} 
                    to={`/apps/${log.app_id}?tab=changelogs`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      position: 'relative',
                      display: 'block'
                    }}
                    className="card-glow"
                  >
                    <div style={{
                      position: 'absolute',
                      left: 'calc(-1.5rem - 6px)',
                      top: '6px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--bg-dark)',
                      border: '2px solid var(--accent-purple)'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                        {log.apps?.name} <span style={{ color: 'var(--accent-purple)' }}>v{log.version}</span>
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ({new Date(log.release_date).toLocaleDateString()})
                      </span>
                    </div>

                    <div style={{
                      background: 'var(--bg-card-glass)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {log.added && log.added.length > 0 && (
                        <p style={{ margin: 0 }}><strong>Added:</strong> {log.added[0]}</p>
                      )}
                      {log.fixed && log.fixed.length > 0 && (
                        <p style={{ margin: '0.25rem 0 0' }}><strong>Fixed:</strong> {log.fixed[0]}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/apps" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View All Release Notes <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
            </div>
          )}


        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>User Testimonials</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Read reviews and feedback from active users on Google Play Store.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-glass)'
          }} className="card-glow">
            <div style={{ display: 'flex', gap: '0.25rem', color: '#fbbf24' }}>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', flexGrow: 1 }}>
              "Great user experience. I have used it to review my code from my phone app. Very easy to use and explore."
            </p>
            <div>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Siva K</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Universal Reader User</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-glass)'
          }} className="card-glow">
            <div style={{ display: 'flex', gap: '0.25rem', color: '#fbbf24' }}>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', flexGrow: 1 }}>
              "It is a very useful app and this brings a lot of information from the text of the Bible. Glad to use this to grow my knowledge."
            </p>
            <div>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>S.R MAHESH RAJ</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bible OT Quiz User</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-glass)'
          }} className="card-glow">
            <div style={{ display: 'flex', gap: '0.25rem', color: '#fbbf24' }}>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', flexGrow: 1 }}>
              "One of the best scanning apps with a cleaner. Helps in decluttering file junk and categorizes them to seek them easily."
            </p>
            <div>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Aravind Kamaraj R</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ipynb Viewer User</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


