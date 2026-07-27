import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BlobBackground from './components/BlobBackground';

// Pages
import Home from './pages/Home';
import Apps from './pages/Apps';
import AppDetail from './pages/AppDetail';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

// New Pages
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import FeatureRequests from './pages/FeatureRequests';
import Resources from './pages/Resources';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Changelog from './pages/Changelog';
import Roadmap from './pages/Roadmap';
import BugReports from './pages/BugReports';


function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const handleTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
      // Reset scroll position to top instantly to prevent jarring "struck" scroll states
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <div
      className={`page-transition-wrapper ${transitionStage}`}
      onAnimationEnd={handleTransitionEnd}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:id" element={<AppDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/feedback" element={<FeatureRequests />} />
        <Route path="/features" element={<FeatureRequests />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/changelogs" element={<Changelog />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/bugs" element={<BugReports />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export function AppContent() {
  return (
    <div className="app-wrapper">
      {/* Visual Backdrop */}
      <BlobBackground />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Page Content */}
      <main>
        <AnimatedRoutes />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
