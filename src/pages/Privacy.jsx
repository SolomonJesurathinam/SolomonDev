import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apps } from '../data/apps';
import * as Icons from 'lucide-react';
import { ShieldAlert, FileText, ChevronRight } from 'lucide-react';

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
        // Basic bold styling parsing within list item
        const parts = itemText.split('**');
        listBuffer.push(
          <li key={`li-${idx}`}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </li>
        );
        return;
      } else if (isInsideList && !trimmedLine.startsWith('- ')) {
        // We exited a list, render the consolidated list
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
        // Skip consecutive newlines to avoid massive spacing
        if (lines[idx-1]?.trim() !== '') {
          elements.push(<div key={`br-${idx}`} style={{ height: '8px' }}></div>);
        }
      } else {
        // Parse basic double-bold string replaces
        const parts = trimmedLine.split('**');
        elements.push(
          <p key={idx} style={{ marginBottom: '16px' }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
    });

    // Flush any remaining list buffer
    if (listBuffer.length > 0) {
      elements.push(
        <ul key="ul-final" style={{ marginBottom: '16px', paddingLeft: '20px' }}>
          {[...listBuffer]}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 24px' }}>
      <div className="privacy-header">
        <h1>Privacy Policies</h1>
        <p>Official privacy policies for Solomon J's applications hosted on the Google Play Store</p>
      </div>

      <div className="privacy-layout">
        {/* Sidebar Nav */}
        <aside className="privacy-sidebar glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', paddingLeft: '8px' }}>
            <FileText size={18} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Select Application</h3>
          </div>
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppSelect(app.id)}
              className={`privacy-app-btn ${selectedApp.id === app.id ? 'active' : ''}`}
            >
              <span style={{ flex: '1' }}>{app.name}</span>
              <ChevronRight size={16} style={{ opacity: selectedApp.id === app.id ? 1 : 0.3 }} />
            </button>
          ))}
        </aside>

        {/* Content Viewer */}
        <main className="privacy-content-card glass">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px', opacity: 0.7 }}>
            <ShieldAlert size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hosting compliant on {window.location.host || 'yourdomain.com'}
            </span>
          </div>

          <div className="privacy-markdown">
            {renderMarkdown(selectedApp.privacyPolicy)}
          </div>
        </main>
      </div>
    </div>
  );
}
