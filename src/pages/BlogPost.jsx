import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ThumbsUp, Eye, Share2, MessageSquare, Send, Check } from 'lucide-react';
import { getBlogById, incrementBlogViews, incrementBlogLikes, checkIfUserLikedBlog, supabase } from '../data/db';

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

const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // blue
    'linear-gradient(135deg, #10b981, #047857)', // green
    'linear-gradient(135deg, #8b5cf6, #5b21b6)', // purple
    'linear-gradient(135deg, #f59e0b, #b45309)', // amber
    'linear-gradient(135deg, #ec4899, #be185d)', // pink
    'linear-gradient(135deg, #14b8a6, #0f766e)'  // teal
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const parseInlineElements = (text) => {
  if (!text) return '';
  // Escape HTML characters
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Bold: **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text*
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Inline Code: `code`
  escaped = escaped.replace(/`(.*?)`/g, '<code style="font-family: monospace; background: var(--bg-card-hover); padding: 0.15rem 0.35rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.85em; color: var(--accent-purple);">$1</code>');
  
  // Links: [text](url)
  escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; font-weight: 600;">$1</a>');
  
  return escaped;
};

const highlightCode = (code, lang) => {
  if (!code) return '';
  
  // Escape HTML first
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  const tokens = [];
  let tokenCounter = 0;
  
  // Helper to store token
  const addToken = (text, style) => {
    const tokenId = `___TOKEN_${tokenCounter++}___`;
    tokens.push({ id: tokenId, text, style });
    return tokenId;
  };
  
  // 1. Replace string literals first (protects content inside quotes from being matched as comments or numbers)
  escaped = escaped.replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g, (match) => {
    return addToken(match, 'color: #34d399;');
  });
  
  // 2. Replace comments second
  escaped = escaped.replace(/(\/\/.*|#.*)/g, (match) => {
    return addToken(match, 'color: #64748b; font-style: italic;');
  });

  // 3. Replace numbers as tokens to prevent keyword styling overlap
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?f?)\b/g, (match) => {
    return addToken(match, 'color: #fb923c;');
  });
  
  // 4. Highlight language-specific keywords
  const langKeywords = getKeywordsForLang(lang);
  if (langKeywords.length > 0) {
    const keywordsRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(keywordsRegex, '<span style="color: #c084fc; font-weight: 600;">$1</span>');
  }
  
  // 5. Highlight language-specific types
  const langTypes = getTypesForLang(lang);
  if (langTypes.length > 0) {
    const typesRegex = new RegExp(`\\b(${langTypes.join('|')})\\b`, 'g');
    escaped = escaped.replace(typesRegex, '<span style="color: #60a5fa; font-weight: 500;">$1</span>');
  }

  // 6. Annotation decorators (e.g. @Query)
  escaped = escaped.replace(/(@\w+)/g, '<span style="color: #f43f5e;">$1</span>');
  
  // 7. Function invocation (e.g. postScale)
  escaped = escaped.replace(/\b(\w+)(?=\()/g, '<span style="color: #38bdf8;">$1</span>');
  
  // 8. Restore all tokens back in reverse order
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    escaped = escaped.replace(token.id, `<span style="${token.style}">${token.text}</span>`);
  }
  
  return escaped;
};

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      const data = await getBlogById(id);
      if (data) {
        setPost(data);
        // Increment views
        incrementBlogViews(data.id, data.views);
        
        // Fetch comments
        await fetchComments(data.id);
        
        // Check if liked in database (backed by voter fingerprint)
        const likedDb = await checkIfUserLikedBlog(data.id);
        setHasLiked(likedDb);
      }
      setLoading(false);
    }
    loadPostData();
  }, [id]);

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setComments(data);
      } else {
        // Fallback: load comments from localStorage
        const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
        setComments(localComments);
      }
    } catch (err) {
      const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
      setComments(localComments);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    // Optimistic UI updates
    const previousHasLiked = hasLiked;
    const previousLikes = post.likes || 0;
    
    const nextHasLiked = !previousHasLiked;
    const nextLikes = nextHasLiked ? previousLikes + 1 : Math.max(0, previousLikes - 1);
    
    setHasLiked(nextHasLiked);
    setPost(prev => ({ ...prev, likes: nextLikes }));
    
    try {
      const { data, error } = await incrementBlogLikes(post.id);
      if (error) {
        // Rollback on error
        setHasLiked(previousHasLiked);
        setPost(prev => ({ ...prev, likes: previousLikes }));
      } else if (data) {
        setPost(prev => ({ ...prev, likes: data.likes }));
        setHasLiked(data.userHasLiked);
      }
    } catch (err) {
      // Rollback on crash
      setHasLiked(previousHasLiked);
      setPost(prev => ({ ...prev, likes: previousLikes }));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !post) return;

    setSubmittingComment(true);
    const newComment = {
      post_id: post.id,
      name: commentName.trim(),
      message: commentText.trim()
    };

    try {
      // Attempt insert in db
      const { data, error } = await supabase
        .from('blog_comments')
        .insert([newComment])
        .select();

      if (!error && data) {
        setComments(prev => [...prev, data[0]]);
      } else {
        // Fallback to localStorage
        const commentWithMeta = {
          ...newComment,
          id: 'local_' + Math.random().toString(36).substring(2),
          created_at: new Date().toISOString()
        };
        const localComments = JSON.parse(localStorage.getItem(`comments_${post.id}`) || '[]');
        const updated = [...localComments, commentWithMeta];
        localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
        setComments(updated);
      }
    } catch (err) {
      const commentWithMeta = {
        ...newComment,
        id: 'local_' + Math.random().toString(36).substring(2),
        created_at: new Date().toISOString()
      };
      const localComments = JSON.parse(localStorage.getItem(`comments_${post.id}`) || '[]');
      const updated = [...localComments, commentWithMeta];
      localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
      setComments(updated);
    }

    setCommentName('');
    setCommentText('');
    setSubmittingComment(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Basic Markdown-like renderer for post content
  const renderContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    let insideCodeBlock = false;
    let codeContent = [];
    let codeLang = 'code';

    return lines.map((line, index) => {
      // Code Block Boundary
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
              border: '1px solid #1e293b',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {/* Code block header */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '0.6rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #1e293b'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#64748b', 
                  fontFamily: 'monospace', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{currentLang}</span>
              </div>
              
              <pre style={{
                margin: 0,
                background: '#1e293b',
                color: '#e2e8f0',
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

      // YouTube Video Embed: @[youtube](videoId)
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

      // Images: ![alt](url)
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
                  maxHeight: '450px',
                  objectFit: 'cover'
                }} 
              />
              {alt && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>{alt}</p>}
            </div>
          );
        }
      }

      // Blockquotes: > quote text
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
            lineHeight: '1.6'
          }} dangerouslySetInnerHTML={{ __html: parseInlineElements(quoteText) }} />
        );
      }

      // Headers
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '');
        return <h3 key={index} style={{ fontSize: '1.35rem', fontWeight: '700', marginTop: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '');
        return <h2 key={index} style={{ fontSize: '1.65rem', fontWeight: '700', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (line.startsWith('# ')) {
        const text = line.replace('# ', '');
        return <h1 key={index} style={{ fontSize: '2rem', fontWeight: '800', marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }

      // Lists
      if (line.trim().startsWith('- ')) {
        const text = line.trim().replace('- ', '');
        return <li key={index} style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s/, '');
        return <li key={index} style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: parseInlineElements(text) }} />;
      }

      // Standard Paragraph
      if (line.trim() === '') {
        return <div key={index} style={{ height: '1rem' }} />;
      }

      return (
        <p key={index} style={{
          fontSize: '1.05rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          marginBottom: '1.25rem'
        }} dangerouslySetInnerHTML={{ __html: parseInlineElements(line) }} />
      );
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '120px 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Article Not Found</h2>
        <Link to="/blog" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', maxWidth: '800px' }}>
      {/* Back button */}
      <Link to="/blog" style={{
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        fontSize: '0.95rem',
        transition: 'color 0.3s ease'
      }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to articles
      </Link>

      {/* Article Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            color: post.category === 'AI' ? '#4f46e5' : post.category === 'Android' ? '#0f766e' : '#d97706',
            backgroundColor: post.category === 'AI' ? 'rgba(79, 70, 229, 0.08)' : post.category === 'Android' ? 'rgba(15, 118, 110, 0.08)' : 'rgba(217, 119, 6, 0.08)',
            border: '1px solid',
            borderColor: post.category === 'AI' ? 'rgba(79, 70, 229, 0.2)' : post.category === 'Android' ? 'rgba(15, 118, 110, 0.2)' : 'rgba(217, 119, 6, 0.2)',
          }}>
            {post.category}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock style={{ width: '14px', height: '14px' }} /> {post.reading_time} min read
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          lineHeight: '1.25',
          color: 'var(--text-primary)',
          marginBottom: '1.5rem'
        }}>
          {post.title}
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#fff'
            }}>
              SJ
            </div>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Solomon J</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Android & AI QA Engineer</p>
            </div>
          </div>

          {/* Social actions */}
          <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
            <button
              onClick={handleLike}
              disabled={hasLiked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: hasLiked ? 'var(--accent-purple)' : 'var(--border-glass)',
                backgroundColor: hasLiked ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: hasLiked ? 'var(--accent-purple)' : 'var(--text-secondary)',
                cursor: hasLiked ? 'default' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <ThumbsUp style={{ width: '16px', height: '16px', fill: hasLiked ? 'var(--accent-purple)' : 'none' }} />
              {post.likes || 0}
            </button>

            <button
              onClick={copyShareLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {copiedLink ? <Check style={{ width: '16px', height: '16px', color: '#10b981' }} /> : <Share2 style={{ width: '16px', height: '16px' }} />}
            </button>

            {copiedLink && (
              <div style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'var(--accent-green)',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <Check style={{ width: '12px', height: '12px', color: '#fff' }} /> Link copied!
                {/* Tooltip Arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '13px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--accent-green)',
                  transform: 'rotate(45deg)'
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article style={{ marginBottom: '4rem' }}>
        {renderContent(post.content)}
      </article>

      {/* Comments Section */}
      <section style={{
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '3rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare style={{ color: 'var(--accent-purple)' }} />
          Discussion ({comments.length})
        </h3>

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <textarea
              placeholder="What are your thoughts on this topic?"
              required
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submittingComment}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem'
              }}
            >
              {submittingComment ? 'Posting...' : (
                <>
                  Post Comment <Send style={{ width: '14px', height: '14px' }} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Comments Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  {/* Dynamic Letter Avatar */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: getAvatarColor(c.name),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: '#fff',
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {c.name ? c.name.charAt(0) : '?'}
                  </div>

                  {/* Commenter Name, Timestamp and Body */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{c.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {c.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
