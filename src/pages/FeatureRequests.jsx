import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, MessageSquare, Send, Sparkles } from 'lucide-react';
import { getFeatureRequests, getApps, addFeatureRequest, voteFeature } from '../data/db';
import CustomDropdown from '../components/CustomDropdown';

const CATEGORIES = ['Feature', 'UI Improvement', 'Performance', 'Security', 'Bug Fix'];
const STATUSES = ['All', 'Under Review', 'Planned', 'In Progress', 'Released'];

export default function FeatureRequests() {
  const [apps, setApps] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedApp, setSelectedApp] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('votes'); // 'votes' | 'newest'

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newApp, setNewApp] = useState('');
  const [newCat, setNewCat] = useState('Feature');
  const [submitting, setSubmitting] = useState(false);
  const [votedMap, setVotedMap] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [votingLock, setVotingLock] = useState({});
  const votingRefs = useRef({});

  useEffect(() => {
    async function loadData() {
      const appData = await getApps();
      setApps(appData);
      document.title = 'Suggest Feature Requests | Solomon J';
      if (appData.length > 0) {
        setNewApp(appData[0].id);
      }
    }
    loadData();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    const appId = selectedApp === 'All' ? '' : selectedApp;
    const status = selectedStatus === 'All' ? '' : selectedStatus;
    const data = await getFeatureRequests(appId, status, sortBy);
    setFeatures(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFeatures();
  }, [selectedApp, selectedStatus, sortBy]);

  // Load votes from local storage voter fingerprint map
  useEffect(() => {
    const votes = JSON.parse(localStorage.getItem('my_feature_votes') || '{}');
    setVotedMap(votes);
  }, []);

  const handleVote = async (requestId, type) => {
    if (votingRefs.current[requestId]) return;
    votingRefs.current[requestId] = true;
    setVotingLock(prev => ({ ...prev, [requestId]: true }));

    const currentVote = votedMap[requestId];
    const isUpvoting = currentVote !== 'up';
    const newVoteType = isUpvoting ? 'up' : null;

    const originalVotedState = currentVote;
    const originalVotesCount = features.find(f => f.id === requestId)?.votes || 0;

    // Optimistically update counts and colors instantly
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
      // Rollback on error
      setVotedMap(prev => ({ ...prev, [requestId]: originalVotedState }));
      setFeatures(prev => prev.map(f => f.id === requestId ? { ...f, votes: originalVotesCount } : f));
      console.error('Voting failed:', error);
    } else if (data) {
      // Ensure local state and localstorage syncs with the database value safely
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newApp || submitting) return;

    setSubmitting(true);
    const featureData = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      app_id: newApp,
      category: newCat,
      status: 'Under Review',
      votes: 1
    };

    const { data, error } = await addFeatureRequest(featureData);
    if (!error && data) {
      const updatedVotes = { ...votedMap, [data.id]: 'up' };
      localStorage.setItem('my_feature_votes', JSON.stringify(updatedVotes));
      setVotedMap(updatedVotes);

      setNewTitle('');
      setNewDesc('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setShowForm(false);
      
      // Reload list
      loadFeatures();
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Released': return 'var(--accent-green)';
      case 'In Progress': return 'var(--accent-cyan)';
      case 'Planned': return 'var(--primary)';
      case 'Fixed': return 'var(--accent-green)';
      case 'Investigating': return 'var(--secondary)';
      case 'Closed': return 'var(--text-muted)';
      default: return '#f59e0b'; // Under Review
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
      
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Community Feature Suggestions
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Upvote suggestions or share your own ideas to help shape the development roadmap.
        </p>

        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={16} />
          <span>{showForm ? 'Close Suggestion Form' : 'Suggest a New Feature'}</span>
        </button>
      </div>

      {/* Suggestion submission Form */}
      {showForm && (
        <div style={{
          maxWidth: '640px',
          margin: '0 auto 2.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--card-shadow)'
        }} className="fade-in">
          <form onSubmit={handleFormSubmit}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              Submit Suggestion
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Application</label>
                <CustomDropdown
                  options={apps.map(app => ({ value: app.id, label: app.name }))}
                  value={newApp}
                  onChange={setNewApp}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
                <CustomDropdown
                  options={CATEGORIES}
                  value={newCat}
                  onChange={setNewCat}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Feature Title</label>
              <input 
                type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Export results directly to CSV"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Detailed Explanation</label>
              <textarea 
                rows={4} required value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Explain what problem this feature solves and how it should work..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Submit Suggestion'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Success Banner */}
      {submitSuccess && (
        <div style={{
          maxWidth: '640px',
          margin: '0 auto 1.5rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.18)',
          color: 'var(--accent-green)',
          padding: '1rem',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Thank you! Your feature suggestion has been submitted successfully.
        </div>
      )}

      {/* Filters and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        {/* Left: Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>App</label>
            <CustomDropdown
              options={[
                { value: 'All', label: 'All Apps' },
                ...apps.map(app => ({ value: app.id, label: app.name }))
              ]}
              value={selectedApp}
              onChange={setSelectedApp}
              style={{ width: '180px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Status</label>
            <CustomDropdown
              options={STATUSES.map(status => ({ value: status, label: status === 'All' ? 'All Statuses' : status }))}
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '150px' }}
            />
          </div>
        </div>

        {/* Right: Sort options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sort By</label>
          <CustomDropdown
            options={[
              { value: 'votes', label: 'Most Upvotes' },
              { value: 'newest', label: 'Newest First' }
            ]}
            value={sortBy}
            onChange={setSortBy}
            style={{ width: '150px' }}
          />
        </div>
      </div>

      {/* Main Suggestions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : features.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: '16px'
        }}>
          <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No feature suggestions found matching these criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {features.map(feat => (
            <div 
              key={feat.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'left',
                boxShadow: 'var(--card-shadow)',
                transition: 'var(--transition-smooth)'
              }}
              className="card-glow"
            >
              {/* Left: Detail */}
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(79, 70, 229, 0.06)', color: 'var(--primary)' }}>
                    {feat.apps?.name || 'General'}
                  </span>
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
                  }}>{feat.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(feat.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{feat.description}</p>
              </div>

              {/* Right: Upvote pill */}
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
                  borderColor: votedMap[feat.id] === 'up' ? 'var(--primary)' : 'rgba(0, 0, 0, 0.08)',
                  backgroundColor: votedMap[feat.id] === 'up' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(0, 0, 0, 0.01)',
                  color: votedMap[feat.id] === 'up' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
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
  );
}
