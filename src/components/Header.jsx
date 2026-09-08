import React, { useState, useEffect } from 'react';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';
import { Menu, X, Calendar, Sun, Moon } from 'lucide-react';

export default function Header({ 
  onOpenBooking, 
  onToggleAdmin, 
  isAdminView, 
  settings = {}, 
  sectionMedia = {},
  theme = 'light',
  onToggleTheme
}) {
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
  const isDark = theme === 'dark';

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 950,
        backgroundColor: (scrolled || mobileMenuOpen) ? 'var(--header-scrolled-bg)' : 'transparent',
        backgroundImage: (scrolled || mobileMenuOpen) 
          ? 'none' 
          : 'linear-gradient(180deg, rgba(7, 18, 13, 0.88) 0%, rgba(7, 18, 13, 0) 100%)',
        backdropFilter: (scrolled || mobileMenuOpen) ? 'blur(16px)' : 'none',
        boxShadow: (scrolled || mobileMenuOpen) ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: (scrolled || mobileMenuOpen) ? '1px solid var(--border-light)' : '1px solid transparent'
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
              <SandalwoodTreeLogo size={scrolled ? 34 : 40} color="var(--color-gold)" />
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
                color: 'var(--color-gold)', 
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-nav">
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
                  color: link.active ? 'var(--color-gold)' : (scrolled ? 'var(--text-main)' : '#FFFFFF'),
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  paddingBottom: '4px',
                  borderBottom: link.active ? '2px solid var(--color-gold)' : '2px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.color = link.active ? 'var(--color-gold)' : (scrolled ? 'var(--text-main)' : '#FFFFFF')}
              >
                {link.label}
              </a>
            ))}

            {/* Dark / Light Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                style={{
                  background: (scrolled || mobileMenuOpen) 
                    ? 'var(--bg-cream)' 
                    : 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  color: isDark ? '#FFD166' : (scrolled ? 'var(--color-gold-dark)' : '#FFD166'),
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(15deg) scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

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

          {/* Mobile Actions: Theme Toggle + Compact BOOK NOW + Hamburger */}
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="mobile-actions">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                style={{
                  background: (scrolled || mobileMenuOpen) ? 'var(--bg-cream)' : 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  color: isDark ? '#FFD166' : (scrolled ? 'var(--color-gold-dark)' : '#FFD166'),
                  cursor: 'pointer',
                  padding: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

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
                background: (scrolled || mobileMenuOpen) ? 'var(--bg-cream)' : 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-light)',
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
          backgroundColor: 'var(--drawer-bg)',
          borderTop: '1px solid var(--border-light)',
          padding: '20px 24px 28px 24px',
          boxShadow: 'var(--shadow-lg)',
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
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>→</span>
              </a>
            ))}

            {/* Mobile Drawer Theme Quick Switcher */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginTop: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDark ? <Sun size={18} color="#FFD166" /> : <Moon size={18} color="var(--color-gold)" />}
                  <span>{isDark ? 'Light Theme Mode' : 'Dark Theme Mode'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: '700' }}>
                  {isDark ? 'Switch to Light' : 'Switch to Dark'}
                </span>
              </button>
            )}

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
