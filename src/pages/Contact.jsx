import React, { useState } from 'react';
import { Mail, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { apps } from '../data/apps';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    app: 'general',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  // Replace this with your Formspree Form ID (e.g. "mqazpode")
  // If left as "YOUR_FORMSPREE_FORM_ID", the form runs a simulated success mock.
  const FORMSPREE_FORM_ID = "mpqeyyek";

  const handleChange = (e) => {
    if (status === 'error') setStatus('idle');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setStatus('loading');

    if (FORMSPREE_FORM_ID === "YOUR_FORMSPREE_FORM_ID") {
      // Mock API request delay
      setTimeout(() => {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          app: 'general',
          message: ''
        });
      }, 1200);
    } else {
      // Real Formspree submission
      fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          app: formData.app,
          message: formData.message
        })
      })
      .then((response) => {
        if (response.ok) {
          setStatus('success');
          setFormData({
            name: '',
            email: '',
            app: 'general',
            message: ''
          });
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 24px' }}>
      <div className="contact-header">
        <h1>Contact & Support</h1>
        <p>Have questions, feature requests, or need support with any of my apps?</p>
      </div>

      <div className="contact-layout">
        {/* Left Column: Direct Info */}
        <div className="glass contact-info">
          <div className="contact-info-title">
            <h2>Support Channels</h2>
            <p>Please reach out through our support form or contact emails. I'm always open to feedback and bug reports.</p>
          </div>

          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <Mail size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Support Email</h4>
                <a href="mailto:solomon.jesurathinam@gmail.com">solomon.jesurathinam@gmail.com</a>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <MapPin size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Location</h4>
                <p>Chennai, Tamil Nadu, India</p>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <div className="contact-detail-text">
                <h4>Professional Profile</h4>
                <a 
                  href="https://www.linkedin.com/in/solomon-jesurathinam/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/solomon-jesurathinam
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support Form */}
        <div className="glass contact-form-card">
          {status === 'success' ? (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <CheckCircle2 size={56} style={{ color: '#34d399', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Message Sent!</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '360px', marginBottom: '24px', lineHeight: '1.5' }}>
                Thank you for reaching out. We have received your query and will reply to your email as soon as possible.
              </p>
              <button 
                onClick={() => setStatus('idle')} 
                className="btn btn-secondary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fade-in">
              <h3 style={{ fontSize: '22px', marginBottom: '20px', textAlign: 'left' }}>Send a Message</h3>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="app">Inquiry Subject (Regarding App)</label>
                <select
                  id="app"
                  name="app"
                  value={formData.app}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                >
                  <option value="general">General Support / Inquiries</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about the issue or feature request..."
                  required
                  disabled={status === 'loading'}
                ></textarea>
              </div>

              {status === 'error' && (
                <div style={{ 
                  padding: '14px 18px', 
                  background: 'rgba(244, 63, 94, 0.08)', 
                  border: '1px solid rgba(244, 63, 94, 0.18)', 
                  color: '#fb7185', 
                  borderRadius: '12px', 
                  marginBottom: '24px', 
                  fontSize: '14.5px', 
                  fontWeight: '500',
                  textAlign: 'left'
                }}>
                  Oops! Something went wrong while sending your message. Please check your network and try again, or email support directly.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary form-submit-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Query</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Dynamic Keyframes inline style for the loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
