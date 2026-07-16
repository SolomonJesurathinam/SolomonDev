import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, FileText, CheckSquare, Bug, Plus, Trash2, Edit2, 
  Mail, RefreshCw, ShieldCheck, CheckCircle, Eye, Calendar, User, ArrowRight,
  Clock, BookOpen
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { 
  getBlogs, addBlog, updateBlog, deleteBlog, 
  getFeatureRequests, updateFeatureStatus, deleteFeatureRequest,
  getBugReports, updateBugStatus, deleteBugReport,
  getApps, addChangelog, updateChangelog, deleteChangelog, getChangelogs,
  getContactMessages, markMessageRead, deleteContactMessage,
  getResources, addResource, updateResource, deleteResource
} from '../data/db';
import CustomDropdown from '../components/CustomDropdown';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const navigate = useNavigate();

  // Data States
  const [blogs, setBlogs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [apps, setApps] = useState([]);
  const [changelogs, setChangelogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);

  // Ticket Filters
  const [featureFilter, setFeatureFilter] = useState('All');
  const [bugFilter, setBugFilter] = useState('All');

  // Preview Blog State
  const [previewBlog, setPreviewBlog] = useState(null);

  // Form states
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Android');
  const [blogContent, setBlogContent] = useState('');
  const [blogReadTime, setBlogReadTime] = useState(5);
  const [blogPublished, setBlogPublished] = useState(false);

  const [changelogFormOpen, setChangelogFormOpen] = useState(false);
  const [editChangelogId, setEditChangelogId] = useState(null);
  const [changeApp, setChangeApp] = useState('');
  const [changeVersion, setChangeVersion] = useState('');
  const [changeAdded, setChangeAdded] = useState('');
  const [changeImproved, setChangeImproved] = useState('');
  const [changeFixed, setChangeFixed] = useState('');

  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState('Cheat Sheet');
  const [resourceCategory, setResourceCategory] = useState('Android');
  const [resourceUrl, setResourceUrl] = useState('');

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        navigate('/admin-login');
      } else {
        setSession(data.session);
        loadDashboardData();
      }
    }
    checkSession();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const blogData = await getBlogs(true);
      const featureData = await getFeatureRequests();
      const bugData = await getBugReports();
      const appData = await getApps();
      const logsData = await getChangelogs();
      const { data: msgData } = await getContactMessages();
      const resData = await getResources();

      setBlogs(blogData);
      setFeatures(featureData);
      setBugs(bugData);
      setApps(appData);
      setChangelogs(logsData);
      setMessages(msgData || []);
      setResources(resData || []);
      
      if (appData.length > 0) {
        setChangeApp(appData[0].id);
      }
      setHasLoaded(true);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  // --- BLOG ACTIONS ---
  const openBlogForm = (blog = null) => {
    if (blog) {
      setEditBlogId(blog.id);
      setBlogTitle(blog.title);
      setBlogCategory(blog.category);
      setBlogContent(blog.content);
      setBlogReadTime(blog.reading_time);
      setBlogPublished(blog.published);
    } else {
      setEditBlogId(null);
      setBlogTitle('');
      setBlogCategory('Android');
      setBlogContent('');
      setBlogReadTime(5);
      setBlogPublished(false);
    }
    setBlogFormOpen(true);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;

    const payload = {
      title: blogTitle.trim(),
      category: blogCategory,
      content: blogContent.trim(),
      reading_time: parseInt(blogReadTime, 10) || 5,
      published: blogPublished
    };

    let result;
    if (editBlogId) {
      result = await updateBlog(editBlogId, payload);
    } else {
      result = await addBlog(payload);
    }

    if (!result.error) {
      setBlogFormOpen(false);
      loadDashboardData();
    } else {
      alert('Failed to save blog post: ' + result.error.message);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    setBlogs(prev => prev.filter(b => b.id !== id));
    const { error } = await deleteBlog(id);
    if (error) {
      alert('Failed to delete blog post: ' + error.message);
    }
    loadDashboardData();
  };

  // --- FEATURE ACTIONS ---
  const handleFeatureStatus = async (id, status) => {
    const { error } = await updateFeatureStatus(id, status);
    if (!error) loadDashboardData();
  };

  const handleDeleteFeature = async (id) => {
    if (!window.confirm('Delete this feature request?')) return;
    setFeatures(prev => prev.filter(f => f.id !== id));
    const { error } = await deleteFeatureRequest(id);
    if (error) {
      alert('Failed to delete feature request: ' + error.message);
    }
    loadDashboardData();
  };

  // --- BUG ACTIONS ---
  const handleBugStatus = async (id, status) => {
    const { error } = await updateBugStatus(id, status);
    if (!error) loadDashboardData();
  };

  const handleDeleteBug = async (id) => {
    if (!window.confirm('Delete this bug report?')) return;
    setBugs(prev => prev.filter(b => b.id !== id));
    const { error } = await deleteBugReport(id);
    if (error) {
      alert('Failed to delete bug report: ' + error.message);
    }
    loadDashboardData();
  };

  // --- CHANGELOG ACTIONS ---
  const openChangelogForm = (log = null) => {
    if (log) {
      setEditChangelogId(log.id);
      setChangeApp(log.app_id);
      setChangeVersion(log.version);
      setChangeAdded(log.added ? log.added.join(', ') : '');
      setChangeImproved(log.improved ? log.improved.join(', ') : '');
      setChangeFixed(log.fixed ? log.fixed.join(', ') : '');
      setChangelogFormOpen(true);
    } else {
      setEditChangelogId(null);
      if (apps.length > 0) {
        setChangeApp(apps[0].id);
      } else {
        setChangeApp('');
      }
      setChangeVersion('');
      setChangeAdded('');
      setChangeImproved('');
      setChangeFixed('');
      setChangelogFormOpen(true);
    }
  };

  const handleChangelogSubmit = async (e) => {
    e.preventDefault();
    if (!changeVersion.trim()) return;

    const payload = {
      app_id: changeApp,
      version: changeVersion.trim(),
      added: changeAdded.split(',').map(s => s.trim()).filter(Boolean),
      improved: changeImproved.split(',').map(s => s.trim()).filter(Boolean),
      fixed: changeFixed.split(',').map(s => s.trim()).filter(Boolean),
      release_date: new Date().toISOString().split('T')[0]
    };

    let result;
    if (editChangelogId) {
      result = await updateChangelog(editChangelogId, payload);
    } else {
      result = await addChangelog(payload);
    }

    if (!result.error) {
      setChangelogFormOpen(false);
      setEditChangelogId(null);
      setChangeVersion('');
      setChangeAdded('');
      setChangeImproved('');
      setChangeFixed('');
      loadDashboardData();
    } else {
      alert(editChangelogId ? 'Failed to update changelog.' : 'Failed to add changelog.');
    }
  };

  const handleDeleteChangelog = async (id) => {
    if (!window.confirm('Delete this changelog version entry?')) return;
    setChangelogs(prev => prev.filter(log => log.id !== id));
    const { error } = await deleteChangelog(id);
    if (error) {
      alert('Failed to delete changelog: ' + error.message);
    }
    loadDashboardData();
  };

  // --- MESSAGE ACTIONS ---
  const handleMarkMessageRead = async (id, isRead) => {
    const { error } = await markMessageRead(id, isRead);
    if (!error) loadDashboardData();
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    setMessages(prev => prev.filter(msg => msg.id !== id));
    const { error } = await deleteContactMessage(id);
    if (error) {
      alert('Failed to delete message: ' + error.message);
    }
    loadDashboardData();
  };

  // --- RESOURCE ACTIONS ---
  const openResourceForm = (resource = null) => {
    if (resource) {
      setEditResourceId(resource.id);
      setResourceTitle(resource.title);
      setResourceDescription(resource.description);
      setResourceType(resource.type || 'Cheat Sheet');
      setResourceCategory(resource.category || 'Android');
      setResourceUrl(resource.url || '');
      setResourceFormOpen(true);
    } else {
      setEditResourceId(null);
      setResourceTitle('');
      setResourceDescription('');
      setResourceType('Cheat Sheet');
      setResourceCategory('Android');
      setResourceUrl('');
      setResourceFormOpen(true);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;

    const payload = {
      title: resourceTitle.trim(),
      description: resourceDescription.trim(),
      type: resourceType,
      category: resourceCategory,
      url: resourceUrl.trim()
    };

    let result;
    if (editResourceId) {
      result = await updateResource(editResourceId, payload);
    } else {
      result = await addResource(payload);
    }

    if (!result.error) {
      setResourceFormOpen(false);
      setEditResourceId(null);
      setResourceTitle('');
      setResourceDescription('');
      setResourceType('Cheat Sheet');
      setResourceCategory('Android');
      setResourceUrl('');
      loadDashboardData();
    } else {
      alert(editResourceId ? 'Failed to update resource.' : 'Failed to add resource.');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) return;
    setResources(prev => prev.filter(r => r.id !== id));
    const { error } = await deleteResource(id);
    if (error) {
      alert('Failed to delete resource: ' + error.message);
    }
    loadDashboardData();
  };

  // Badge stylers
  const getFeatureBadgeStyle = (status) => {
    switch (status) {
      case 'Released': return { bg: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: 'rgba(16, 185, 129, 0.15)' };
      case 'In Progress': return { bg: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.15)' };
      case 'Planned': return { bg: 'rgba(139, 92, 246, 0.05)', color: 'var(--primary)', border: 'rgba(139, 92, 246, 0.15)' };
      case 'Rejected': return { bg: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.15)' };
      default: return { bg: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.15)' }; // Under Review
    }
  };

  const getBugBadgeStyle = (status) => {
    switch (status) {
      case 'Closed': return { bg: 'rgba(107, 114, 128, 0.05)', color: '#6b7280', border: 'rgba(107, 114, 128, 0.15)' };
      case 'Fixed': return { bg: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: 'rgba(16, 185, 129, 0.15)' };
      case 'Investigating': return { bg: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.15)' };
      default: return { bg: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.15)' }; // Open
    }
  };

  // --- BLOG PREVIEW MARKDOWN PARSING ENGINE ---
  const getKeywordsForLang = (lang) => {
    const common = ['if', 'else', 'for', 'while', 'break', 'continue', 'try', 'catch', 'finally', 'return', 'throw', 'import', 'class'];
    switch (lang?.toLowerCase()) {
      case 'kotlin':
      case 'java':
        return [...common, 'val', 'var', 'fun', 'new', 'null', 'public', 'private', 'protected', 'static', 'void', 'int', 'float', 'double', 'boolean', 'as', 'by', 'when', 'package', 'interface', 'object', 'constructor', 'init', 'this', 'super', 'enum', 'annotation', 'companion', 'internal', 'expect', 'actual', 'suspend', 'inline', 'reified', 'infix', 'operator', 'tailrec', 'external', 'override', 'open', 'abstract', 'final', 'sealed'];
      case 'python':
        return [...common, 'def', 'print', 'from', 'as', 'in', 'is', 'and', 'or', 'not', 'lambda', 'with', 'assert', 'pass', 'global', 'nonlocal', 'yield', 'None', 'True', 'False'];
      case 'js':
      case 'javascript':
      case 'ts':
      case 'typescript':
        return [...common, 'const', 'let', 'var', 'function', 'new', 'null', 'undefined', 'export', 'default', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of', 'this', 'super', 'extends', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'];
      default:
        return [...common, 'val', 'var', 'fun', 'def', 'const', 'let', 'function', 'new', 'null'];
    }
  };

  const getTypesForLang = (lang) => {
    switch (lang?.toLowerCase()) {
      case 'kotlin':
      case 'java':
        return ['String', 'Int', 'Float', 'Double', 'Boolean', 'Char', 'Byte', 'Short', 'Long', 'Unit', 'Any', 'Nothing', 'List', 'Map', 'Set', 'Array', 'OrtEnvironment', 'OrtSession', 'FileUtil', 'Interpreter', 'Matrix', 'PdfRenderer', 'Bitmap', 'PrintManager', 'PrintDocumentAdapter', 'PrintAttributes', 'Context', 'Flow', 'FileEntity'];
      case 'python':
        return ['str', 'int', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'object', 'None', 'self', 'AppiumBy', 'WebDriverWait', 'EC'];
      default:
        return ['String', 'Int', 'Float', 'Double', 'Boolean', 'List', 'Map', 'Set', 'Array'];
    }
  };

  const parseInlineElements = (text) => {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/`(.*?)`/g, '<code style="font-family: monospace; background: var(--bg-card-hover); padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.85em; color: var(--accent-purple);">$1</code>');
    escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; font-weight: 600;">$1</a>');
    
    return escaped;
  };

  const highlightCode = (code, lang) => {
    if (!code) return '';
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    const tokens = [];
    let tokenCounter = 0;
    
    const addToken = (text, style) => {
      const tokenId = `___TOKEN_${tokenCounter++}___`;
      tokens.push({ id: tokenId, text, style });
      return tokenId;
    };
    
    escaped = escaped.replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g, (match) => {
      return addToken(match, 'color: #34d399;');
    });
    
    escaped = escaped.replace(/(\/\/.*|#.*)/g, (match) => {
      return addToken(match, 'color: #64748b; font-style: italic;');
    });
   
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?f?)\b/g, (match) => {
      return addToken(match, 'color: #fb923c;');
    });
    
    const langKeywords = getKeywordsForLang(lang);
    if (langKeywords.length > 0) {
      const keywordsRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
      escaped = escaped.replace(keywordsRegex, '<span style="color: #c084fc; font-weight: 600;">$1</span>');
    }
    
    const langTypes = getTypesForLang(lang);
    if (langTypes.length > 0) {
      const typesRegex = new RegExp(`\\b(${langTypes.join('|')})\\b`, 'g');
      escaped = escaped.replace(typesRegex, '<span style="color: #60a5fa; font-weight: 500;">$1</span>');
    }

    escaped = escaped.replace(/(@\w+)/g, '<span style="color: #f43f5e;">$1</span>');
    escaped = escaped.replace(/\b(\w+)(?=\()/g, '<span style="color: #38bdf8;">$1</span>');
    
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      escaped = escaped.replace(token.id, `<span style="${token.style}">${token.text}</span>`);
    }
    
    return escaped;
  };

  const renderBlogPreviewContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    let insideCodeBlock = false;
    let codeContent = [];
    let codeLang = 'code';

    return lines.map((line, index) => {
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const key = `code-${index}`;
          const codeString = codeContent.join('\n');
          const currentLang = codeLang;
          codeContent = [];
          codeLang = 'code';
          return (
            <div key={key} style={{
              margin: '1.5rem 0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                backgroundColor: 'var(--bg-card-hover)',
                padding: '0.6rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)', 
                  fontFamily: 'monospace', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{currentLang}</span>
              </div>
              
              <pre style={{
                margin: 0,
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                padding: '1.25rem',
                overflowX: 'auto',
                fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                fontSize: '0.85rem',
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                <code dangerouslySetInnerHTML={{ __html: highlightCode(codeString, currentLang) }} />
              </pre>
            </div>
          );
        } else {
          insideCodeBlock = true;
          const match = line.trim().match(/^```(\w+)/);
          codeLang = match ? match[1] : 'code';
          return null;
        }
      }

      if (insideCodeBlock) {
        codeContent.push(line);
        return null;
      }

      if (line.trim().startsWith('@[youtube]')) {
        const match = line.trim().match(/^@\[youtube\]\((.*?)\)/);
        if (match) {
          const videoId = match[1];
          return (
            <div key={index} style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden', 
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              margin: '2rem 0'
            }}>
              <iframe 
                src={`https://www.youtube.com/embed/${videoId}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%' 
                }}
              />
            </div>
          );
        }
      }

      if (line.trim().startsWith('![')) {
        const match = line.trim().match(/^!\[(.*?)\]\((.*?)\)/);
        if (match) {
          const alt = match[1];
          const url = match[2];
          return (
            <div key={index} style={{ margin: '2rem 0', textAlign: 'center' }}>
              <img 
                src={url} 
                alt={alt} 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--card-shadow)',
                  maxHeight: '400px',
                  objectFit: 'cover'
                }} 
              />
              {alt && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>{alt}</p>}
            </div>
          );
        }
      }

      if (line.trim().startsWith('> ')) {
        const quoteText = line.replace(/^>\s*/, '');
        return (
          <blockquote key={index} style={{
            borderLeft: '4px solid var(--primary)',
            background: 'var(--bg-card-hover)',
            padding: '1rem 1.5rem',
            margin: '1.5rem 0',
            borderRadius: '0 8px 8px 0',
            color: 'var(--text-primary)',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            lineHeight: '1.6',
            textAlign: 'left'
          }} dangerouslySetInnerHTML={{ __html: parseInlineElements(quoteText) }} />
        );
      }

      if (line.startsWith('### ')) {
        const text = line.replace('### ', '');
        return <h3 key={index} style={{ fontSize: '1.35rem', fontWeight: '700', marginTop: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '');
        return <h2 key={index} style={{ fontSize: '1.65rem', fontWeight: '700', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (line.startsWith('# ')) {
        const text = line.replace('# ', '');
        return <h1 key={index} style={{ fontSize: '2.00rem', fontWeight: '800', marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-primary)', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }

      if (line.trim().startsWith('- ')) {
        const text = line.trim().replace('- ', '');
        return <li key={index} style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.7', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s/, '');
        return <li key={index} style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.7', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }

      if (line.trim() === '') {
        return <div key={index} style={{ height: '1rem' }} />;
      }

      return (
        <p key={index} style={{
          fontSize: '1.05rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          marginBottom: '1.25rem',
          textAlign: 'left'
        }} dangerouslySetInnerHTML={{ __html: parseInlineElements(line) }} />
      );
    });
  };

  if (loading && !session) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Filter listings
  const filteredFeatures = featureFilter === 'All' 
    ? features 
    : features.filter(f => f.status === featureFilter);

  const filteredBugs = bugFilter === 'All'
    ? bugs
    : bugs.filter(b => b.status === bugFilter);

  return (
    <div className="admin-container fade-in" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* Title Header Card */}
      <header className="admin-header-card">
        <div style={{ textAlign: 'left' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldCheck size={16} /> Solomon Admin Panel
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            Management Console
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '10px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Reload
          </button>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '10px 16px', 
              fontSize: '0.85rem', 
              backgroundColor: '#ef4444', 
              borderColor: '#ef4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Console Layout */}
      <div className="admin-layout-grid">
        
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Navigation</span>
          </div>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`admin-sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('blogs')}
            className={`admin-sidebar-btn ${activeTab === 'blogs' ? 'active' : ''}`}
          >
            <FileText size={16} />
            <span style={{ flex: 1 }}>Manage Blogs</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', fontWeight: '700' }}>{blogs.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('features')}
            className={`admin-sidebar-btn ${activeTab === 'features' ? 'active' : ''}`}
          >
            <CheckSquare size={16} />
            <span style={{ flex: 1 }}>Feature Tickets</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', fontWeight: '700' }}>{features.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('bugs')}
            className={`admin-sidebar-btn ${activeTab === 'bugs' ? 'active' : ''}`}
          >
            <Bug size={16} />
            <span style={{ flex: 1 }}>Bug Reports</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', fontWeight: '700' }}>{bugs.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('changelogs')}
            className={`admin-sidebar-btn ${activeTab === 'changelogs' ? 'active' : ''}`}
          >
            <RefreshCw size={16} />
            <span style={{ flex: 1 }}>Release Logs</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', fontWeight: '700' }}>{changelogs.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('resources')}
            className={`admin-sidebar-btn ${activeTab === 'resources' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span style={{ flex: 1 }}>Manage Resources</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', fontWeight: '700' }}>{resources.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`admin-sidebar-btn ${activeTab === 'messages' ? 'active' : ''}`}
          >
            <Mail size={16} />
            <span style={{ flex: 1 }}>Contact Inbox</span>
            {messages.filter(m => !m.is_read).length > 0 && (
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--accent-purple)', color: '#fff', fontWeight: '800' }}>
                {messages.filter(m => !m.is_read).length} NEW
              </span>
            )}
          </button>
        </aside>

        {/* Content Pane */}
        <main style={{ minHeight: '60vh', textAlign: 'left' }}>
          {loading && !hasLoaded ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '6rem 0',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Fetching console data...</span>
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div>
                  {/* Summary Metric Counters */}
                  <div className="admin-metrics-grid">
                    <div className="admin-metric-card indigo">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p>Total Articles</p>
                        <FileText size={18} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h4>{blogs.length}</h4>
                    </div>

                    <div className="admin-metric-card purple">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p>Active Features</p>
                        <CheckSquare size={18} style={{ color: 'var(--accent-purple)' }} />
                      </div>
                      <h4>{features.filter(f => f.status !== 'Released' && f.status !== 'Rejected').length}</h4>
                    </div>

                    <div className="admin-metric-card red">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p>Open Bug Tickets</p>
                        <Bug size={18} style={{ color: '#ef4444' }} />
                      </div>
                      <h4>{bugs.filter(b => b.status === 'Open' || b.status === 'Investigating').length}</h4>
                    </div>

                    <div className="admin-metric-card emerald">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p>Unread Messages</p>
                        <Mail size={18} style={{ color: '#10b981' }} />
                      </div>
                      <h4>{messages.filter(m => !m.is_read).length}</h4>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    boxShadow: 'var(--card-shadow)'
                  }}>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ShieldCheck size={22} style={{ color: 'var(--primary)' }} /> Welcome back, Solomon!
                    </h3>
                    <p style={{ marginBottom: '1.25rem' }}>
                      This is the control center for your developer portfolio and Google Play Store compliance hub. From this gateway, you can compose technical articles, moderate ticket pipelines, track active application bug logs, publish release change logs, and answer user support inquiries.
                    </p>
                    <p style={{ margin: 0 }}>
                      Select a department from the left navigation panel to moderate database entries.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. BLOG MANAGER */}
              {activeTab === 'blogs' && (
                <div>
                  {blogFormOpen ? (
                    <form onSubmit={handleBlogSubmit} className="admin-list-card fade-in" style={{ padding: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.75rem', color: 'var(--text-primary)' }}>
                        {editBlogId ? 'Edit Article' : 'Compose New Article'}
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="admin-input-group">
                          <label>Title</label>
                          <input 
                            type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)}
                            placeholder="Article Title"
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-input-group">
                          <label>Category</label>
                          <CustomDropdown
                            options={['Android', 'AI', 'Automation', 'General']}
                            value={blogCategory}
                            onChange={setBlogCategory}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="admin-input-group">
                          <label>Read Time (Minutes)</label>
                          <input 
                            type="number" required value={blogReadTime} onChange={(e) => setBlogReadTime(e.target.value)}
                            className="admin-input"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                            <input 
                              type="checkbox" checked={blogPublished} onChange={(e) => setBlogPublished(e.target.checked)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            Publish Article (Make Visible Publicly)
                          </label>
                        </div>
                      </div>

                      <div className="admin-input-group" style={{ marginBottom: '1.75rem' }}>
                        <label>Content (Markdown Parser Supported)</label>
                        <textarea 
                          rows={14} required value={blogContent} onChange={(e) => setBlogContent(e.target.value)}
                          placeholder="Paste markdown content here..."
                          className="admin-textarea"
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={() => setBlogFormOpen(false)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>Save Changes</button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Blog Articles</h3>
                        <button onClick={() => openBlogForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Plus size={16} /> Compose Article
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {blogs.map(b => (
                          <div key={b.id} className="admin-list-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0 }}>{b.title}</h4>
                                <span style={{
                                  fontSize: '10px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: b.published ? 'rgba(16,185,129,0.06)' : 'var(--bg-card-hover)',
                                  color: b.published ? '#10b981' : 'var(--text-secondary)',
                                  border: '1px solid',
                                  borderColor: b.published ? 'rgba(16,185,129,0.18)' : 'var(--border-color)'
                                }}>
                                  {b.published ? 'Published' : 'Draft'}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0 }}>
                                Category: <strong>{b.category}</strong> | Views: {b.views || 0} | Likes: {b.likes || 0}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              <button 
                                onClick={() => setPreviewBlog(b)} 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Eye size={12} /> Preview
                              </button>
                              <button onClick={() => openBlogForm(b)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Edit2 size={12} /> Edit
                              </button>
                              <button onClick={() => handleDeleteBlog(b.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. FEATURE TICKETS */}
              {activeTab === 'features' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>User Feature Suggestions</h3>
                    
                    {/* Horizontal Kanban Filter Bar */}
                    <div className="admin-filter-bar">
                      {['All', 'Under Review', 'Planned', 'In Progress', 'Released', 'Rejected'].map(status => (
                        <button
                          key={status}
                          onClick={() => setFeatureFilter(status)}
                          className={`admin-filter-pill ${featureFilter === status ? 'active' : ''}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFeatures.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '3rem 0' }}>No tickets match this filter status.</p>
                    ) : (
                      filteredFeatures.map(f => {
                        const badgeStyle = getFeatureBadgeStyle(f.status);
                        return (
                          <div key={f.id} className="admin-list-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className="badge badge-accent" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '10px' }}>
                                  {f.apps?.name || 'General'}
                                </span>
                                
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  backgroundColor: badgeStyle.bg,
                                  color: badgeStyle.color,
                                  border: '1px solid',
                                  borderColor: badgeStyle.border
                                }}>
                                  {f.status}
                                </span>
                              </div>
                              
                              {/* Manage Status */}
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Update Status:</span>
                                <CustomDropdown
                                  options={['Under Review', 'Planned', 'In Progress', 'Released', 'Rejected']}
                                  value={f.status}
                                  onChange={(val) => handleFeatureStatus(f.id, val)}
                                  style={{ width: '150px' }}
                                />
                                
                                <button onClick={() => handleDeleteFeature(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', marginLeft: '4px' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {f.title} 
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--bg-card-hover)', color: 'var(--primary)' }}>
                                {f.votes || 0} Votes
                              </span>
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>{f.description}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 4. BUG REPORTS */}
              {activeTab === 'bugs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Bug Tickets</h3>
                    
                    {/* Bug status filter */}
                    <div className="admin-filter-bar">
                      {['All', 'Open', 'Investigating', 'Fixed', 'Closed'].map(status => (
                        <button
                          key={status}
                          onClick={() => setBugFilter(status)}
                          className={`admin-filter-pill ${bugFilter === status ? 'active' : ''}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredBugs.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '3rem 0' }}>No bugs match this status.</p>
                    ) : (
                      filteredBugs.map(b => {
                        const badgeStyle = getBugBadgeStyle(b.status);
                        return (
                          <div key={b.id} className="admin-list-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge badge-accent" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '10px' }}>
                                  {b.apps?.name || 'General'}
                                </span>
                                
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  backgroundColor: badgeStyle.bg,
                                  color: badgeStyle.color,
                                  border: '1px solid',
                                  borderColor: badgeStyle.border
                                }}>
                                  {b.status}
                                </span>

                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Ver: <strong>{b.app_version}</strong> | Dev: <strong>{b.device}</strong> | OS: <strong>{b.android_version}</strong>
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Update Status:</span>
                                <CustomDropdown
                                  options={['Open', 'Investigating', 'Fixed', 'Closed']}
                                  value={b.status}
                                  onChange={(val) => handleBugStatus(b.id, val)}
                                  style={{ width: '140px' }}
                                />

                                <button onClick={() => handleDeleteBug(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', marginLeft: '4px' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                              {b.description}
                            </p>

                            {b.logs && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>System Stack Trace / Logs</div>
                                <pre style={{
                                  background: 'rgba(0,0,0,0.03)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '10px',
                                  padding: '1.25rem',
                                  fontFamily: 'monospace',
                                  fontSize: '0.775rem',
                                  color: 'var(--text-primary)',
                                  overflowX: 'auto',
                                  margin: 0
                                }}>
                                  {b.logs}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 5. RELEASE CHANGELOGS */}
              {activeTab === 'changelogs' && (
                <div>
                  {changelogFormOpen ? (
                    <form onSubmit={handleChangelogSubmit} className="admin-list-card fade-in" style={{ padding: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        {editChangelogId ? 'Edit Version Release Note' : 'Publish Version Release Note'}
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="admin-input-group">
                          <label>Target App</label>
                          <CustomDropdown
                            options={apps.map(app => ({ value: app.id, label: app.name }))}
                            value={changeApp}
                            onChange={setChangeApp}
                          />
                        </div>

                        <div className="admin-input-group">
                          <label>Version String</label>
                          <input 
                            type="text" required placeholder="e.g. 2.1.2" value={changeVersion} onChange={(e) => setChangeVersion(e.target.value)}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-input-group">
                        <label>Features Added (Comma separated list)</label>
                        <textarea 
                          rows={2} value={changeAdded} onChange={(e) => setChangeAdded(e.target.value)}
                          placeholder="e.g. Added Cloud Sync Integration, Added Zoom controls"
                          className="admin-input"
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div className="admin-input-group">
                        <label>Improvements (Comma separated list)</label>
                        <textarea 
                          rows={2} value={changeImproved} onChange={(e) => setChangeImproved(e.target.value)}
                          placeholder="e.g. Faster parsing engines, Reduced app memory layout"
                          className="admin-input"
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div className="admin-input-group" style={{ marginBottom: '2rem' }}>
                        <label>Bug Fixes (Comma separated list)</label>
                        <textarea 
                          rows={2} value={changeFixed} onChange={(e) => setChangeFixed(e.target.value)}
                          placeholder="e.g. Fixed crash when loading HTML cells, Fixed OCR leak"
                          className="admin-input"
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={() => { setChangelogFormOpen(false); setEditChangelogId(null); }} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                          {editChangelogId ? 'Save Changes' : 'Publish Release Log'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Version Releases</h3>
                        <button onClick={() => openChangelogForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Plus size={16} /> Publish Release Log
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {changelogs.map(log => (
                          <div key={log.id} className="admin-list-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                              <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0 }}>
                                {log.apps?.name} <span style={{ color: 'var(--primary)' }}>v{log.version}</span>
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0 }}>
                                Released on: {new Date(log.release_date).toLocaleDateString()}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              <button onClick={() => openChangelogForm(log)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Edit2 size={12} /> Edit
                              </button>
                              <button onClick={() => handleDeleteChangelog(log.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5.5. MANAGE RESOURCES */}
              {activeTab === 'resources' && (
                <div>
                  {resourceFormOpen ? (
                    <form onSubmit={handleResourceSubmit} className="admin-list-card fade-in" style={{ padding: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        {editResourceId ? 'Edit Resource' : 'Add New Resource'}
                      </h3>
                      
                      <div className="admin-input-group" style={{ marginBottom: '1.25rem' }}>
                        <label>Resource Title</label>
                        <input 
                          type="text" required placeholder="e.g. Kotlin Coroutines Cheat Sheet" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)}
                          className="admin-input"
                        />
                      </div>

                      <div className="admin-input-group" style={{ marginBottom: '1.25rem' }}>
                        <label>Resource Description</label>
                        <textarea 
                          rows={3} required placeholder="Provide a detailed description of what the resource contains..." value={resourceDescription} onChange={(e) => setResourceDescription(e.target.value)}
                          className="admin-input"
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div className="admin-input-group">
                          <label>Resource Type</label>
                          <CustomDropdown
                            options={[
                              { value: 'Cheat Sheet', label: 'Cheat Sheet' },
                              { value: 'Repository', label: 'Repository' },
                              { value: 'Template', label: 'Template' },
                              { value: 'PDF', label: 'PDF' }
                            ]}
                            value={resourceType}
                            onChange={setResourceType}
                          />
                        </div>

                        <div className="admin-input-group">
                          <label>Category</label>
                          <CustomDropdown
                            options={[
                              { value: 'Android', label: 'Android' },
                              { value: 'Automation', label: 'Automation' },
                              { value: 'AI', label: 'AI' },
                              { value: 'Other', label: 'Other' }
                            ]}
                            value={resourceCategory}
                            onChange={setResourceCategory}
                          />
                        </div>
                      </div>

                      <div className="admin-input-group" style={{ marginBottom: '2rem' }}>
                        <label>URL Link</label>
                        <input 
                          type="url" required placeholder="e.g. https://github.com/..." value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)}
                          className="admin-input"
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={() => { setResourceFormOpen(false); setEditResourceId(null); }} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                          {editResourceId ? 'Save Changes' : 'Add Resource'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Shared Developer Resources</h3>
                        <button onClick={() => openResourceForm()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Plus size={16} /> Add Resource
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {resources.length === 0 ? (
                          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '3rem 0' }}>No resources published yet.</p>
                        ) : (
                          resources.map(res => (
                            <div key={res.id} className="admin-list-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                              <div>
                                <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0 }}>
                                  {res.title}
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center' }}>
                                  <span className="badge badge-accent" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {res.type}
                                  </span>
                                  <span className="badge badge-secondary" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                                    {res.category}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', whiteSpace: 'nowrap' }}>
                                    {res.url}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button onClick={() => openResourceForm(res)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={() => handleDeleteResource(res.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. CONTACT MESSAGES */}
              {activeTab === 'messages' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Contact Messages Inbox</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '3rem 0' }}>No messages in inbox.</p>
                    ) : (
                      messages.map(msg => (
                        <div 
                          key={msg.id}
                          className="admin-list-card"
                          style={{
                            borderLeft: msg.is_read ? '1px solid var(--border-color)' : '3px solid var(--primary)',
                            paddingLeft: msg.is_read ? '20px' : '18px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>{msg.name}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.65rem' }}>
                                &lt;{msg.email || 'No email provided'}&gt;
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button 
                                onClick={() => handleMarkMessageRead(msg.id, !msg.is_read)}
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700' }}
                              >
                                {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                              </button>
                              
                              <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', marginLeft: '4px' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {msg.app_id && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <span className="badge badge-accent" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '800' }}>
                                Regarding App: {apps.find(a => a.id === msg.app_id)?.name || msg.app_id}
                              </span>
                            </div>
                          )}

                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '0.75rem', marginTop: 0 }}>
                            {msg.message}
                          </p>
                          
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            Received: {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Blog Article Preview Modal Dialog */}
      {previewBlog && (
        <div className="admin-modal-overlay" onClick={() => setPreviewBlog(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div style={{ textAlign: 'left' }}>
                <span className="badge badge-accent" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}>
                  {previewBlog.category}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '6px', marginBottom: 0, letterSpacing: '-0.01em' }}>
                  {previewBlog.title}
                </h3>
              </div>
              <button className="admin-modal-close" onClick={() => setPreviewBlog(null)}>×</button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {/* Metadata */}
              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {previewBlog.reading_time} min read
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {new Date(previewBlog.created_at || new Date()).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> {previewBlog.views || 0} views
                </span>
              </div>

              {/* Formatted Content */}
              <div style={{ textAlign: 'left' }}>
                {renderBlogPreviewContent(previewBlog.content)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setPreviewBlog(null)}>Close Preview</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setPreviewBlog(null);
                  openBlogForm(previewBlog);
                }}
                style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
              >
                Edit Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
