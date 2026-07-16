import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { 
  ArrowLeft, Play, Shield, Mail, CheckCircle2, Info, 
  Bug, MessageSquare, Calendar, ChevronDown, HelpCircle, 
  Star, ChevronUp, ChevronDown as ChevronDownIcon, Send, ShieldAlert, Sparkles, ArrowUpCircle, CheckCircle
} from 'lucide-react';
import { 
  getAppById, getChangelogs, getFeatureRequests, 
  voteFeature, addFeatureRequest, getBugReports, addBugReport 
} from '../data/db';
import CustomDropdown from '../components/CustomDropdown';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
  { id: 'changelogs', label: 'Changelog', icon: <Calendar size={16} /> },
  { id: 'features', label: 'Feature Board', icon: <MessageSquare size={16} /> },
  { id: 'bugs', label: 'Bug Portal', icon: <Bug size={16} /> }
];

const FEATURE_CATEGORIES = ['Feature', 'UI Improvement', 'Performance', 'Security', 'Bug Fix'];

export default function AppDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Set tab from URL query param if present
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  // Tab Data States
  const [changelogs, setChangelogs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [votedMap, setVotedMap] = useState({});
  const [votingLock, setVotingLock] = useState({});
  const votingRefs = useRef({});

  // Feature Request Form State
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featCat, setFeatCat] = useState('Feature');
  const [featSubmitting, setFeatSubmitting] = useState(false);
  const [featSuccess, setFeatSuccess] = useState(false);

  // Bug Report Form State
  const [bugVersion, setBugVersion] = useState('');
  const [bugAndroid, setBugAndroid] = useState('');
  const [bugDevice, setBugDevice] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugLogs, setBugLogs] = useState('');
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [bugSuccess, setBugSuccess] = useState(false);

  useEffect(() => {
    async function loadAppHub() {
      setLoading(true);
      const appData = await getAppById(id);
      if (appData) {
        setApp(appData);
        
        // Parallel data loading
        const [logsData, featuresData, bugsData] = await Promise.all([
          getChangelogs(id),
          getFeatureRequests(id, '', 'votes'),
          getBugReports(id)
        ]);

        setChangelogs(logsData);
        setFeatures(featuresData);
        setBugs(bugsData);
      }
      setLoading(false);
    }
    loadAppHub();

    // Load local fingerprint votes
    const votes = JSON.parse(localStorage.getItem('my_feature_votes') || '{}');
    setVotedMap(votes);
  }, [id]);

  // Sync state tab switcher to query params
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleVote = async (requestId, type) => {
    if (votingRefs.current[requestId]) return;
    votingRefs.current[requestId] = true;
    setVotingLock(prev => ({ ...prev, [requestId]: true }));

    const currentVote = votedMap[requestId];
    const isUpvoting = currentVote !== 'up';
    const newVoteType = isUpvoting ? 'up' : null;

    const originalVotedState = currentVote;
    const originalVotesCount = features.find(f => f.id === requestId)?.votes || 0;

    // Snappy Optimistic UI update
    setVotedMap(prev => ({ ...prev, [requestId]: newVoteType }));
    setFeatures(prev => prev.map(f => {
      if (f.id === requestId) {
        const modifier = isUpvoting ? 1 : -1;
        return { ...f, votes: Math.max(0, (f.votes || 0) + modifier) };
      }
      return f;
    }));

    // Trigger vote request
    const { data, error } = await voteFeature(requestId, type);

    if (error) {
      // Rollback on database error
      setVotedMap(prev => ({ ...prev, [requestId]: originalVotedState }));
      setFeatures(prev => prev.map(f => f.id === requestId ? { ...f, votes: originalVotesCount } : f));
      console.error('Voting failed:', error);
    } else if (data) {
      // Sync final database count and local storage safely
      setFeatures(prev => prev.map(f => f.id === requestId ? { ...f, votes: data.votes } : f));
      setVotedMap(prev => {
        const next = { ...prev, [requestId]: newVoteType };
        localStorage.setItem('my_feature_votes', JSON.stringify(next));
        return next;
      });
    }

    votingRefs.current[requestId] = false;
    setVotingLock(prev => ({ ...prev, [requestId]: false }));
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!featTitle.trim() || !featDesc.trim() || featSubmitting) return;

    setFeatSubmitting(true);
    const payload = {
      title: featTitle.trim(),
      description: featDesc.trim(),
      app_id: id,
      category: featCat,
      status: 'Under Review',
      votes: 1
    };

    const { data, error } = await addFeatureRequest(payload);
    if (!error && data) {
      // Local vote mapping
      const updatedVotes = { ...votedMap, [data.id]: 'up' };
      localStorage.setItem('my_feature_votes', JSON.stringify(updatedVotes));
      setVotedMap(updatedVotes);

      setFeatTitle('');
      setFeatDesc('');
      setFeatSuccess(true);
      setTimeout(() => setFeatSuccess(false), 3000);

      // Reload lists
      const featuresData = await getFeatureRequests(id, '', 'votes');
      setFeatures(featuresData);
    }
    setFeatSubmitting(false);
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    if (!bugVersion.trim() || !bugAndroid.trim() || !bugDevice.trim() || !bugDesc.trim() || bugSubmitting) return;

    setBugSubmitting(true);
    const payload = {
      app_id: id,
      app_version: bugVersion.trim(),
      android_version: bugAndroid.trim(),
      device: bugDevice.trim(),
      description: bugDesc.trim(),
      logs: bugLogs.trim() || null,
      status: 'Open'
    };

    const { error } = await addBugReport(payload);
    if (!error) {
      setBugVersion('');
      setBugAndroid('');
      setBugDevice('');
      setBugDesc('');
      setBugLogs('');
      setBugSuccess(true);
      setTimeout(() => setBugSuccess(false), 3000);

      // Reload bug list
      const bugsData = await getBugReports(id);
      setBugs(bugsData);
    }
    setBugSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '140px 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container fade-in" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <Info size={48} style={{ color: 'var(--primary)', marginBottom: '16px', opacity: 0.6 }} />
        <h2>Application Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 30px' }}>
          The application you are looking for does not exist or has been moved.
        </p>
        <Link to="/apps" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Apps</span>
        </Link>
      </div>
    );
  }

  const IconComponent = Icons[app.icon_name] || Icons.FileCode;

  // Custom FAQ data based on app category/details
  const faqs = [
    {
      q: "Does this application collect any personal information?",
      a: "No, all core utility operations (like notebook parsing, PDF rendering, or calculations) happen completely on-device. We prioritize data privacy and do not collect, monitor, or transmit your files."
    },
    {
      q: "Can I run the application offline?",
      a: "Yes, our applications are designed offline-first. You do not need an active internet connection to render notebooks, organize files, or compute results."
    },
    {
      q: "How can I check the status of my suggestion or bug?",
      a: "You can view the list of suggestions and bugs directly under the 'Feature Board' and 'Bug Portal' tabs. We moderate and update the pipeline status in real-time."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Released': return 'var(--accent-green)';
      case 'In Progress': return 'var(--accent-cyan)';
      case 'Planned': return 'var(--primary)';
      case 'Fixed': return 'var(--accent-green)';
      case 'Investigating': return 'var(--secondary)';
      case 'Closed': return 'var(--text-secondary)';
      default: return '#f59e0b'; // Under Review / Open
    }
  };

  const getBugStatusStyle = (status) => {
    switch (status) {
      case 'Fixed': return { color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'Investigating': return { color: 'var(--secondary)', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' };
      case 'Closed': return { color: 'var(--text-secondary)', bg: 'rgba(107, 114, 128, 0.08)', border: 'rgba(107, 114, 128, 0.2)' };
      default: return { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.08)', border: 'rgba(234, 88, 12, 0.2)' };
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Feature': 
        return {
          color: '#4f46e5',
          bg: 'rgba(79, 70, 229, 0.08)',
          border: 'rgba(79, 70, 229, 0.2)'
        };
      case 'UI Improvement':
        return {
          color: '#db2777',
          bg: 'rgba(219, 39, 119, 0.08)',
          border: 'rgba(219, 39, 119, 0.2)'
        };
      case 'Performance':
        return {
          color: '#0891b2',
          bg: 'rgba(8, 145, 178, 0.08)',
          border: 'rgba(8, 145, 178, 0.2)'
        };
      case 'Security':
        return {
          color: '#dc2626',
          bg: 'rgba(220, 38, 38, 0.08)',
          border: 'rgba(220, 38, 38, 0.2)'
        };
      case 'Bug Fix':
        return {
          color: '#ea580c',
          bg: 'rgba(234, 88, 12, 0.08)',
          border: 'rgba(234, 88, 12, 0.2)'
        };
      default:
        return {
          color: '#64748b',
          bg: 'rgba(100, 116, 139, 0.08)',
          border: 'rgba(100, 116, 139, 0.2)'
        };
    }
  };

  return (
    <div className="container fade-in" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      
      {/* Back button */}
      <Link to="/apps" style={{
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        fontSize: '0.95rem',
        transition: 'color 0.3s ease'
      }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={16} /> Back to Gallery
      </Link>

      {/* App Header Glass Block */}
      <div style={{
        background: 'var(--bg-card-glass)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-glass)'
      }} className="card-glow">
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Glowing App Icon Container */}
          <div style={{ 
            width: '84px', 
            height: '84px', 
            borderRadius: '20px', 
            background: 'rgba(255,255,255,0.01)', 
            border: '1px solid var(--border-glass)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--secondary)',
            boxShadow: '0 0 20px -5px var(--secondary-glow)',
            flexShrink: 0
          }}>
            <IconComponent size={44} />
          </div>

          <div style={{ flex: '1', textAlign: 'left', minWidth: '250px' }}>
            <span className="badge badge-accent" style={{ marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {app.category}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 6px 0', border: 'none', padding: '0', color: '#fff' }}>
              {app.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', fontFamily: 'monospace' }}>
              Package: {app.package_id}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href={app.play_store_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 20px -5px rgba(34, 211, 238, 0.4)' }}
            >
              <Play size={15} fill="currentColor" />
              <span>Get on Google Play</span>
            </a>
          </div>
        </div>
      </div>

      {/* Segmented Floating Capsule Tabs Switcher */}
      <div style={{
        display: 'inline-flex',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-color)',
        borderRadius: '50px',
        padding: '4px',
        marginBottom: '2.5rem',
        gap: '4px',
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.5rem',
              background: activeTab === tab.id ? 'var(--primary)' : 'none',
              border: 'none',
              borderRadius: '40px',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>



      {/* Tab Panels */}
      <div>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid-2">
            {/* Left Info: About & FAQ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              <div style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  About the App
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                  {app.long_desc}
                </p>
              </div>

              {/* Accordion FAQ */}
              <div style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {faqs.map((faq, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem' }}>
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          color: activeFaq === idx ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <HelpCircle size={15} style={{ color: 'var(--primary)' }} />
                          {faq.q}
                        </span>
                        <ChevronDown size={15} style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                      {activeFaq === idx && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Info: Features & Tech Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Key Features
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
                  {app.features && app.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Technical Specs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Developer</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Solomon J</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Android (Google Play)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{ fontWeight: '600', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Active
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Support Mail</span>
                    <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>solomon.jesurathinam@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHANGELOG */}
        {activeTab === 'changelogs' && (
          <div className="grid-2" style={{ textAlign: 'left' }}>
            {/* Left Column: Version Logs */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '2rem' }}>Version Release Logs</h3>
              
              {changelogs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'var(--bg-card-glass)',
                  border: '1px dashed var(--border-glass)',
                  borderRadius: '16px'
                }}>
                  <Info size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No version updates posted for this app yet.</p>
                </div>
              ) : (
                <div style={{
                  position: 'relative',
                  paddingLeft: '1.75rem',
                  borderLeft: '2px solid rgba(139, 92, 246, 0.15)'
                }}>
                  {changelogs.map((log, index) => (
                    <div key={log.id} style={{ position: 'relative', marginBottom: index === changelogs.length - 1 ? '0' : '2.5rem' }}>
                      {/* Timeline spot */}
                      <div style={{
                        position: 'absolute',
                        left: 'calc(-1.75rem - 7px)',
                        top: '6px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--bg-dark)',
                        border: '3px solid var(--primary)',
                        boxShadow: '0 0 10px rgba(192, 132, 252, 0.5)'
                      }} />

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Version {log.version}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Released on: {new Date(log.release_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{
                        background: 'var(--bg-card-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem'
                      }}>
                        {log.added && log.added.length > 0 && (
                          <div style={{ marginBottom: '0.85rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              <Sparkles size={12} /> Added
                            </span>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {log.added.map((item, idx) => <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                            </ul>
                          </div>
                        )}

                        {log.improved && log.improved.length > 0 && (
                          <div style={{ marginBottom: '0.85rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              <ArrowUpCircle size={12} /> Improved
                            </span>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {log.improved.map((item, idx) => <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                            </ul>
                          </div>
                        )}

                        {log.fixed && log.fixed.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              <CheckCircle size={12} /> Fixed
                            </span>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {log.fixed.map((item, idx) => <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Technical Specs (same as Overview tab) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Technical Specs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Developer</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Solomon J</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Platform</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Android (Google Play)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{ fontWeight: '600', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Active
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Support Mail</span>
                    <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>solomon.jesurathinam@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURE SUGGESTIONS */}
        {activeTab === 'features' && (
          <div className="grid-2" style={{ textAlign: 'left' }}>
            {/* Left column: Submit Suggestion */}
            <div>
              <form onSubmit={handleFeatureSubmit} style={{
                background: 'var(--bg-card-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '2rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> Suggest a Feature
                </h3>

                {featSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
                    Suggestion submitted successfully!
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</label>
                  <CustomDropdown
                    options={FEATURE_CATEGORIES}
                    value={featCat}
                    onChange={setFeatCat}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Feature Title</label>
                  <input 
                    type="text" required value={featTitle} onChange={(e) => setFeatTitle(e.target.value)}
                    placeholder="e.g. Export notebooks directly to Google Drive"
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed Explanation</label>
                  <textarea 
                    rows={4} required value={featDesc} onChange={(e) => setFeatDesc(e.target.value)}
                    placeholder="Describe how this feature should work and what value it adds..."
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" disabled={featSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Send size={15} /> {featSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </form>
            </div>

            {/* Right column: Suggestions Feed */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>Active Community Feedback ({features.length})</h3>

              {features.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No suggestions submitted yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                  {features.map(feat => (
                    <div 
                      key={feat.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem',
                        background: 'var(--bg-card-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      className="card-glow"
                    >
                      {/* Left: Suggestion Details */}
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            textTransform: 'uppercase', 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '4px', 
                            color: getCategoryColor(feat.category).color,
                            backgroundColor: getCategoryColor(feat.category).bg,
                            border: '1px solid',
                            borderColor: getCategoryColor(feat.category).border
                          }}>
                            {feat.category}
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            color: getStatusColor(feat.status), 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '10px', 
                            border: '1px solid', 
                            borderColor: getStatusColor(feat.status), 
                            backgroundColor: `${getStatusColor(feat.status)}08` 
                          }}>
                            {feat.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(feat.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>{feat.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{feat.description}</p>
                      </div>

                      {/* Right: Premium Upvote Pill Button */}
                      <button 
                        onClick={() => handleVote(feat.id, 'up')}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '12px 18px',
                          borderRadius: '14px',
                          border: '1px solid',
                          borderColor: votedMap[feat.id] === 'up' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                          backgroundColor: votedMap[feat.id] === 'up' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.01)',
                          color: votedMap[feat.id] === 'up' ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          minWidth: '64px',
                          flexShrink: 0
                        }}
                        className="upvote-pill"
                      >
                        <ChevronUp size={20} style={{ transform: votedMap[feat.id] === 'up' ? 'translateY(-1px) scale(1.15)' : 'none', transition: 'transform 0.2s' }} />
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: votedMap[feat.id] === 'up' ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {feat.votes || 0}
                        </span>
                      </button>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: BUG TRACKER */}
        {activeTab === 'bugs' && (
          <div className="grid-2" style={{ textAlign: 'left' }}>
            {/* Left column: Submit Bug */}
            <div>
              <form onSubmit={handleBugSubmit} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={18} style={{ color: '#ef4444' }} /> Report a Glitch
                </h3>

                {bugSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
                    Bug reported successfully! Thank you.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>App Version</label>
                    <input 
                      type="text" required value={bugVersion} onChange={(e) => setBugVersion(e.target.value)} placeholder="e.g. v2.1.0"
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Android OS</label>
                    <input 
                      type="text" required value={bugAndroid} onChange={(e) => setBugAndroid(e.target.value)} placeholder="e.g. Android 14"
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Device Model</label>
                  <input 
                    type="text" required value={bugDevice} onChange={(e) => setBugDevice(e.target.value)} placeholder="e.g. Pixel 8 Pro"
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Description of Glitch</label>
                  <textarea 
                    rows={3} required value={bugDesc} onChange={(e) => setBugDesc(e.target.value)} placeholder="Describe what actions triggered the issue..."
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Logs / Error Stacktrace (Optional)</label>
                  <textarea 
                    rows={3} value={bugLogs} onChange={(e) => setBugLogs(e.target.value)} placeholder="Paste error readouts if any..."
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" disabled={bugSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#ef4444', borderColor: '#ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)' }}>
                  <Send size={15} /> {bugSubmitting ? 'Submitting...' : 'Submit Bug'}
                </button>
              </form>
            </div>

            {/* Right column: Active bug tickets */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Active Bug Tickets ({bugs.length})</h3>

              {bugs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--accent-green)', marginBottom: '0.75rem', opacity: 0.6 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active bug reports for this app. 100% resolved!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                  {bugs.map(bug => (
                    <div 
                      key={bug.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: 'var(--card-shadow)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-card-hover)' }}>
                            v{bug.app_version}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-card-hover)' }}>
                            {bug.device}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-card-hover)' }}>
                            OS: {bug.android_version}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: getBugStatusStyle(bug.status).color,
                          backgroundColor: getBugStatusStyle(bug.status).bg,
                          borderColor: getBugStatusStyle(bug.status).border,
                          border: '1px solid',
                          borderRadius: '4px',
                          padding: '0.15rem 0.5rem',
                          textTransform: 'uppercase'
                        }}>{bug.status}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.925rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontWeight: '500' }}>{bug.description}</p>
                      
                      {bug.logs && (
                        <details style={{ marginTop: '1rem' }}>
                          <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', outline: 'none', userSelect: 'none' }}>View Error Logs</summary>
                          <div style={{
                            marginTop: '0.5rem',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #1e293b',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                          }}>
                            {/* Terminal Header */}
                            <div style={{
                              backgroundColor: '#0f172a',
                              padding: '0.5rem 0.75rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottom: '1px solid #1e293b'
                            }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                                <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', fontWeight: '600' }}>stacktrace_log.txt</span>
                              </div>
                            </div>
                            {/* Terminal Content */}
                            <pre style={{
                              margin: 0,
                              background: '#1e293b',
                              padding: '0.85rem 1rem',
                              fontSize: '0.75rem',
                              color: '#34d399',
                              fontFamily: 'Consolas, Monaco, monospace',
                              overflowX: 'auto',
                              textAlign: 'left',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap'
                            }}>{bug.logs}</pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
