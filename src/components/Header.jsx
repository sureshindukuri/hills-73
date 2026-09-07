import React, { useState, useEffect } from 'react';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';
import { Menu, X, Shield, Calendar, Phone } from 'lucide-react';

export default function Header({ onOpenBooking, onToggleAdmin, isAdminView, settings = {}, sectionMedia = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoMedia = sectionMedia?.logo;
  const brandTitle = settings?.brandName || '73 HILLS';
  const brandSub = settings?.brandSubtitle || 'RESORT & REAL ESTATE';

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        backgroundColor: scrolled ? 'rgba(253, 251, 247, 0.96)' : 'transparent',
        backgroundImage: scrolled ? 'none' : 'linear-gradient(180deg, rgba(13, 33, 22, 0.8) 0%, rgba(13, 33, 22, 0) 100%)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(19, 46, 31, 0.08)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(179, 139, 89, 0.2)' : '1px solid transparent'
      }}
    >
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: scrolled ? '72px' : '90px',
          transition: 'height 0.3s ease'
        }}>
          
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            {logoMedia?.url ? (
              <img 
                src={logoMedia.url} 
                alt={brandTitle} 
                style={{ 
                  height: scrolled ? '38px' : '46px', 
                  maxWidth: '160px', 
                  objectFit: 'contain',
                  transition: 'height 0.3s ease'
                }} 
              />
            ) : (
              <SandalwoodTreeLogo size={scrolled ? 38 : 44} color="#B38B59" />
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: scrolled ? '1.5rem' : '1.75rem', 
                fontWeight: '700', 
                color: scrolled ? 'var(--text-main)' : '#FFFFFF', 
                letterSpacing: '0.08em',
                lineHeight: 1,
                transition: 'color 0.3s ease'
              }}>
                {brandTitle}
              </span>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                color: '#B38B59', 
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginTop: '3px'
              }}>
                {brandSub}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            {[
              { label: 'Home', href: '#' },
              { label: 'About', href: '#about' },
              { label: 'Stay Rooms', href: '#stay-rooms' },
              { label: 'Celebrations', href: '#celebrations' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'Contact', href: '#contact' }
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: scrolled ? 'var(--text-main)' : '#FFFFFF',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.target.style.color = '#B38B59'}
                onMouseLeave={(e) => e.target.style.color = scrolled ? 'var(--text-main)' : '#FFFFFF'}
              >
                {link.label}
              </a>
            ))}

            {/* BOOK NOW Main Button */}
            <button 
              onClick={onOpenBooking}
              className="btn-gold"
              style={{ padding: '10px 22px' }}
            >
              <Calendar size={16} />
              BOOK NOW
            </button>
          </nav>

          {/* Mobile Menu Trigger */}
          <div style={{ display: 'none', gap: '12px' }} className="mobile-actions">
            <button
              onClick={onOpenBooking}
              className="btn-gold"
              style={{ padding: '8px 14px', fontSize: '0.75rem' }}
            >
              BOOK NOW
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-main)',
          borderTop: '1px solid var(--border-light)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Home', href: '#' },
              { label: 'About Us', href: '#about' },
              { label: 'Stay Rooms', href: '#stay-rooms' },
              { label: 'Celebrations', href: '#celebrations' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'Contact', href: '#contact' }
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(179, 139, 89, 0.1)',
                  paddingBottom: '10px'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Responsive Style Injection */}
      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
