import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apps } from '../data/apps';
import * as Icons from 'lucide-react';
import { ShieldCheck, FileText, ChevronRight, EyeOff, Key, Globe, CheckCircle } from 'lucide-react';

export default function Privacy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appIdParam = searchParams.get('app');

  // Find app based on parameter, default to first app if not found
  const selectedApp = apps.find(a => a.id === appIdParam) || apps[0];

  useEffect(() => {
    // Ensure the parameter matches the active selection on load if none was specified
    if (!appIdParam) {
      setSearchParams({ app: selectedApp.id }, { replace: true });
    }
  }, [appIdParam, selectedApp, setSearchParams]);

  const handleAppSelect = (id) => {
    setSearchParams({ app: id });
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'productivity': return { primary: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.06)' };
      case 'finance': return { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.06)' };
      case 'education': return { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.06)' };
      default: return { primary: '#6366f1', bg: 'rgba(99, 102, 241, 0.06)' };
    }
  };

  const getAppSafetyFacts = (appId) => {
    switch (appId) {
      case 'ipynb-viewer':
      case 'ipynb-viewer-pro':
        return [
          { icon: <EyeOff size={16} />, label: 'Data Collection', value: 'Zero Collection' },
          { icon: <ShieldCheck size={16} />, label: 'Data Storage', value: '100% On-Device' },
          { icon: <Key size={16} />, label: 'Permissions', value: 'Storage Read/Write' },
          { icon: <Globe size={16} />, label: 'Internet Use', value: 'Completely Offline' }
        ];
      case 'pdfolio':
        return [
          { icon: <EyeOff size={16} />, label: 'Data Collection', value: 'Zero Collection' },
          { icon: <ShieldCheck size={16} />, label: 'Data Storage', value: '100% On-Device' },
          { icon: <Key size={16} />, label: 'Permissions', value: 'Camera & Storage' },
          { icon: <Globe size={16} />, label: 'Internet Use', value: 'Completely Offline' }
        ];
      case 'universal-reader':
        return [
          { icon: <EyeOff size={16} />, label: 'Data Collection', value: 'Zero Collection' },
          { icon: <ShieldCheck size={16} />, label: 'Data Storage', value: '100% On-Device' },
          { icon: <Key size={16} />, label: 'Permissions', value: 'Storage Read-Only' },
          { icon: <Globe size={16} />, label: 'Internet Use', value: 'Completely Offline' }
        ];
      default:
        return [
          { icon: <EyeOff size={16} />, label: 'Data Collection', value: 'Zero Collection' },
          { icon: <ShieldCheck size={16} />, label: 'Data Storage', value: '100% On-Device' },
          { icon: <Key size={16} />, label: 'Permissions', value: 'Zero Required' },
          { icon: <Globe size={16} />, label: 'Internet Use', value: 'Completely Offline' }
        ];
    }
  };

  // Simple Markdown Parser to render styled HTML elements
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    let isInsideList = false;
    const listBuffer = [];
    const elements = [];

    const lines = text.split('\n');

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();

      // Handle list item consolidation
      if (trimmedLine.startsWith('- ')) {
        isInsideList = true;
        const itemText = trimmedLine.substring(2);
        const parts = itemText.split('**');
        listBuffer.push(
          <li key={`li-${idx}`}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </li>
        );
        return;
      } else if (isInsideList && !trimmedLine.startsWith('- ')) {
        isInsideList = false;
        elements.push(
          <ul key={`ul-${idx}`} style={{ marginBottom: '16px', paddingLeft: '20px' }}>
            {[...listBuffer]}
          </ul>
        );
        listBuffer.length = 0; // Clear buffer
      }

      // Handle standard markdown headers and paragraphs
      if (trimmedLine.startsWith('# ')) {
        elements.push(<h1 key={idx}>{trimmedLine.substring(2)}</h1>);
      } else if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={idx}>{trimmedLine.substring(4)}</h3>);
      } else if (trimmedLine === '') {
        if (lines[idx-1]?.trim() !== '') {
          elements.push(<div key={`br-${idx}`} style={{ height: '8px' }}></div>);
        }
      } else {
        const parts = trimmedLine.split('**');
        elements.push(
          <p key={idx} style={{ marginBottom: '16px' }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
    });

    if (listBuffer.length > 0) {
      elements.push(
        <ul key="ul-final" style={{ marginBottom: '16px', paddingLeft: '20px' }}>
          {[...listBuffer]}
        </ul>
      );
    }

    return elements;
  };

  const displayHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'solomonj.dev' : window.location.host;

  return (
    <div className="container fade-in" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-accent">Play Store Compliance</span>
        <h1 className="title-large" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Privacy <span className="text-gradient-purple">Hub</span>
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Review official, transparent privacy statements for each application. Your data always remains yours.
        </p>
      </div>

      <div className="privacy-layout-grid">
        {/* Sidebar Nav */}
        <aside className="privacy-sidebar-nav">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Select Application</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Choose an app to review its compliance</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
            {apps.map((app) => {
              const colors = getCategoryColor(app.category);
              const isSelected = selectedApp.id === app.id;
              const AppIcon = Icons[app.iconName || 'FileCode'] || Icons.FileCode;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppSelect(app.id)}
                  className={`privacy-nav-item ${isSelected ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-purple)' : 'transparent',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                    flexShrink: 0
                  }}>
                    <AppIcon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {app.name}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                      {app.packageId || `com.solomondev.${app.id}`}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ opacity: isSelected ? 1 : 0.3, flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="privacy-document-viewer">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {selectedApp.name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '4px' }}>
                Package: {selectedApp.packageId || `com.solomondev.${selectedApp.id}`}
              </div>
            </div>
            
            <div style={{ 
              display: 'inline-flex', 
              gap: '8px', 
              alignItems: 'center', 
              padding: '6px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: '20px'
            }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', color: '#10b981' }}>
                Verified Official Policy
              </span>
            </div>
          </div>

          <div className="privacy-markdown">
            {renderMarkdown(selectedApp.privacyPolicy)}
          </div>
        </main>

        {/* Compliance Facts Side Panel */}
        <aside className="privacy-compliance-panel">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.25rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data Safety Facts
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {getAppSafetyFacts(selectedApp.id).map((fact, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  {fact.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600' }}>{fact.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{fact.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Compliance Notice</div>
            This policy is hosted in compliance with Google Play Store Guidelines on verified domain <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{displayHost}</span>.
          </div>
        </aside>
      </div>
    </div>
  );
}
