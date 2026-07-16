import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Menu, X, Code2, Home, Layers, Mail, BookOpen, FolderGit 
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/apps', label: 'My Apps', icon: <Layers size={16} /> },
    { path: '/blog', label: 'Blog', icon: <BookOpen size={16} /> },
    { path: '/resources', label: 'Resources', icon: <FolderGit size={16} /> },
    { path: '/contact', label: 'Contact', icon: <Mail size={16} /> },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar container glass" style={{ maxWidth: '1200px', padding: '0 1.5rem' }}>
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <Code2 className="logo-icon" size={22} />
          <span className="logo-text" style={{ fontSize: '1.1rem' }}>Solomon<span className="gradient-text">.J</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '14px', gap: '6px' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Toggle Button */}
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer glass fade-in" style={{ padding: '1rem 0' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}


