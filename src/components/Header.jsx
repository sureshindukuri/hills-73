import React, { useState, useEffect } from 'react';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';
import { Menu, X, Calendar } from 'lucide-react';

export default function Header({ onOpenBooking, onToggleAdmin, isAdminView, settings = {}, sectionMedia = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
        zIndex: 950,
        backgroundColor: (scrolled || mobileMenuOpen) ? 'rgba(253, 251, 247, 0.98)' : 'transparent',
        backgroundImage: (scrolled || mobileMenuOpen) ? 'none' : 'linear-gradient(180deg, rgba(13, 33, 22, 0.85) 0%, rgba(13, 33, 22, 0) 100%)',
        backdropFilter: (scrolled || mobileMenuOpen) ? 'blur(16px)' : 'none',
        boxShadow: (scrolled || mobileMenuOpen) ? '0 4px 20px rgba(19, 46, 31, 0.08)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: (scrolled || mobileMenuOpen) ? '1px solid rgba(179, 139, 89, 0.25)' : '1px solid transparent'
      }}
    >
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: scrolled ? '68px' : '84px',
          transition: 'height 0.3s ease'
        }}>
          
          {/* Logo Brand */}
          <a 
            href="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              textDecoration: 'none',
              minWidth: 0
            }}
          >
            {logoMedia?.url ? (
              <img 
                src={logoMedia.url} 
                alt={brandTitle} 
                style={{ 
                  height: scrolled ? '34px' : '42px', 
                  maxWidth: '140px', 
                  objectFit: 'contain',
                  transition: 'height 0.3s ease'
                }} 
              />
            ) : (
              <SandalwoodTreeLogo size={scrolled ? 34 : 40} color="#B38B59" />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: scrolled ? '1.35rem' : '1.55rem', 
                fontWeight: '700', 
                color: (scrolled || mobileMenuOpen) ? 'var(--text-main)' : '#FFFFFF', 
                letterSpacing: '0.06em',
                lineHeight: 1.05,
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease'
              }}>
                {brandTitle}
              </span>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '0.6rem', 
                fontWeight: '700', 
                color: '#B38B59', 
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: '2px',
                whiteSpace: 'nowrap'
              }}>
                {brandSub}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            {[
              { label: 'Home', href: '#home', active: true },
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
                  color: link.active ? '#B38B59' : (scrolled ? 'var(--text-main)' : '#FFFFFF'),
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  paddingBottom: '4px',
                  borderBottom: link.active ? '2px solid #B38B59' : '2px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#B38B59'}
                onMouseLeave={(e) => e.currentTarget.style.color = link.active ? '#B38B59' : (scrolled ? 'var(--text-main)' : '#FFFFFF')}
              >
                {link.label}
              </a>
            ))}

            {/* BOOK NOW Main Button */}
            <button 
              onClick={onOpenBooking}
              className="btn-gold"
              style={{ 
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: '700',
                letterSpacing: '0.06em'
              }}
            >
              <Calendar size={16} />
              BOOK NOW
            </button>
          </nav>

          {/* Mobile Actions: Compact BOOK NOW + Hamburger */}
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="mobile-actions">
            <button
              onClick={onOpenBooking}
              className="btn-gold"
              style={{ 
                padding: '7px 12px', 
                fontSize: '0.725rem',
                borderRadius: '6px',
                fontWeight: '700',
                gap: '4px'
              }}
            >
              <Calendar size={13} />
              BOOK
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                background: (scrolled || mobileMenuOpen) ? 'rgba(179, 139, 89, 0.12)' : 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(179, 139, 89, 0.4)',
                borderRadius: '6px',
                color: (scrolled || mobileMenuOpen) ? 'var(--text-main)' : '#FFFFFF',
                cursor: 'pointer',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-main)',
          borderTop: '1px solid var(--border-light)',
          padding: '20px 24px 28px 24px',
          boxShadow: '0 12px 32px rgba(19, 46, 31, 0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Home', href: '#home' },
              { label: 'About Us', href: '#about' },
              { label: 'Stay Rooms & Villas', href: '#stay-rooms' },
              { label: 'Celebrations & Events', href: '#celebrations' },
              { label: 'Gallery Showcase', href: '#gallery' },
              { label: 'Contact & Location', href: '#contact' }
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(179, 139, 89, 0.12)',
                  paddingBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: '#B38B59', fontSize: '0.9rem' }}>→</span>
              </a>
            ))}

            <div style={{ paddingTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="btn-gold"
                style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
              >
                <Calendar size={16} /> RESERVE A ROOM NOW
              </button>
            </div>
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
