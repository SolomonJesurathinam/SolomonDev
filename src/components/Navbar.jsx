import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Code2, Home, Layers, ShieldCheck, Mail } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/apps', label: 'My Apps', icon: <Layers size={18} /> },
    { path: '/privacy', label: 'Privacy Policies', icon: <ShieldCheck size={18} /> },
    { path: '/contact', label: 'Contact & Support', icon: <Mail size={18} /> },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar container glass">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <Code2 className="logo-icon" size={24} />
          <span className="logo-text">Solomon<span className="gradient-text">.J</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
        <div className="mobile-drawer glass fade-in">
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
