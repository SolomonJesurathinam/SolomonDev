import React, { useState, useEffect } from 'react';
import { AlertCircle, PlusCircle, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { getBugReports, getApps, addBugReport } from '../data/db';

export default function BugReports() {
  const [apps, setApps] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedApp, setSelectedApp] = useState('All');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [appId, setAppId] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [androidVersion, setAndroidVersion] = useState('');
  const [device, setDevice] = useState('');
  const [description, setDescription] = useState('');
  const [logs, setLogs] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadApps() {
      const appData = await getApps();
      setApps(appData);
      document.title = 'Submit Bug Report | Solomon J';
      if (appData.length > 0) {
        setAppId(appData[0].id);
      }
    }
    loadApps();
  }, []);

  const loadBugs = async () => {
    setLoading(true);
    const data = await getBugReports(selectedApp === 'All' ? '' : selectedApp);
    setBugs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBugs();
  }, [selectedApp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appId || !appVersion.trim() || !androidVersion.trim() || !device.trim() || !description.trim()) return;

    setSubmitting(true);
    const bugData = {
      app_id: appId,
      app_version: appVersion.trim(),
      android_version: androidVersion.trim(),
      device: device.trim(),
      description: description.trim(),
      logs: logs.trim() || null,
      status: 'Open'
    };

    const { error } = await addBugReport(bugData);
    if (!error) {
      setSubmitSuccess(true);
      setAppVersion('');
      setAndroidVersion('');
      setDevice('');
      setDescription('');
      setLogs('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2000);
      loadBugs();
    } else {
      alert('Failed to submit bug report. Please check details.');
    }
    setSubmitting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Fixed': return <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--accent-green)' }} />;
      case 'Investigating': return <HelpCircle style={{ width: '16px', height: '16px', color: 'var(--accent-glow)' }} />;
      case 'Closed': return <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />;
      default: return <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />; // Open
    }
  };

  const getStatusBadgeStyle = (status) => {
    let color = '#ef4444';
    if (status === 'Fixed') color = 'var(--accent-green)';
    if (status === 'Investigating') color = 'var(--accent-glow)';
    if (status === 'Closed') color = 'var(--text-secondary)';
    
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontSize: '0.75rem',
      fontWeight: '700',
      color: color,
      padding: '0.2rem 0.6rem',
      borderRadius: '12px',
      border: '1px solid',
      borderColor: color,
      backgroundColor: `${color}0f`
    };
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-accent">Issue Tracker</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Bug <span className="text-gradient-purple">Reporting</span> Portal
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Encountered an issue in one of our apps? Let us know the details, device info, and crash logs so we can patch it.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Suggest Button / Form */}
        <div>
          {!showForm ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setShowForm(true)} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', borderColor: '#ef4444', boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)' }}
              >
                <PlusCircle style={{ width: '18px', height: '18px' }} /> Report a Bug
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: 'var(--bg-card-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-glass)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert style={{ color: '#ef4444' }} /> Report a System Issue
              </h3>

              {submitSuccess && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--accent-green)',
                  color: 'var(--accent-green)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  Thank you! Bug report submitted successfully.
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target App</label>
                  <select 
                    value={appId} 
                    onChange={(e) => setAppId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    {apps.map(app => (
                      <option key={app.id} value={app.id} style={{ backgroundColor: '#111' }}>{app.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>App Version</label>
                  <input 
                    type="text" 
                    placeholder="e.g. v2.1.0"
                    required
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Android OS Version</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Android 13 (API 33)"
                    required
                    value={androidVersion}
                    onChange={(e) => setAndroidVersion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Device Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Samsung Galaxy S23 Ultra"
                    required
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description of Bug & Steps to Reproduce</label>
                <textarea 
                  placeholder="Describe step-by-step how the error occurs. What buttons did you click? Did the app freeze, crash, or show an incorrect output?"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Logs or Stacktrace (Optional)</label>
                <textarea 
                  placeholder="Paste error logs, console readouts, or NbConversion errors if available."
                  rows={4}
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                  {submitting ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filter Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--bg-card-glass)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter Bugs:</span>
          <select 
            value={selectedApp} 
            onChange={(e) => setSelectedApp(e.target.value)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="All" style={{ backgroundColor: '#111' }}>All Apps</option>
            {apps.map(app => (
              <option key={app.id} value={app.id} style={{ backgroundColor: '#111' }}>{app.name}</option>
            ))}
          </select>
        </div>

        {/* Bugs Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : bugs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-card-glass)',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <CheckCircle style={{ width: '48px', height: '48px', color: 'var(--accent-green)', marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Bug Tickets</h3>
            <p style={{ color: 'var(--text-secondary)' }}>All reported bugs for this app are resolved! Nice work.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bugs.map(bug => (
              <div 
                key={bug.id}
                style={{
                  background: 'var(--bg-card-glass)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      {bug.apps?.name || 'General'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      App: {bug.app_version} | OS: {bug.android_version} | Device: {bug.device}
                    </span>
                  </div>

                  <span style={getStatusBadgeStyle(bug.status)}>
                    {getStatusIcon(bug.status)} {bug.status}
                  </span>
                </div>

                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                  {bug.description}
                </p>

                {bug.logs && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: '600', outline: 'none' }}>
                      View Error Log / Stacktrace
                    </summary>
                    <pre style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '0.5rem',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#d4d4d4',
                      overflowX: 'auto'
                    }}>
                      {bug.logs}
                    </pre>
                  </details>
                )}
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '0.5rem' }}>
                  Reported on: {new Date(bug.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
