import React from 'react';
import { SandalwoodTreeLogo, SandalwoodBranchGraphic } from './SandalwoodGraphics';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';

export default function Footer({ onOpenBooking, onToggleAdmin, settings = {}, sectionMedia = {} }) {
  const logoMedia = sectionMedia?.logo;
  const brandTitle = settings?.brandName || '73 HILLS';
  const brandSub = settings?.brandSubtitle || 'RESORT & REAL ESTATE';

  return (
    <footer style={{ backgroundColor: '#0D2116', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top Warm Teak Wood CTA Banner matching exact reference image! */}
      <div style={{
        backgroundColor: '#B38B59',
        color: '#FFFFFF',
        padding: '36px 0',
        position: 'relative',
        backgroundImage: 'linear-gradient(90deg, #967041 0%, #B38B59 50%, #8C6536 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#FFFFFF', fontWeight: '500' }}>
            Your perfect experience starts here.
          </h3>

          <button 
            onClick={onOpenBooking} 
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--color-emerald)',
              padding: '14px 36px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              fontSize: '0.875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            BOOK NOW
          </button>
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="container" style={{ padding: '80px 24px 40px 24px', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '48px',
          marginBottom: '60px'
        }}>
          
          {/* Col 1: Logo & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {logoMedia?.url ? (
                <img 
                  src={logoMedia.url} 
                  alt={brandTitle} 
                  style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain' }} 
                />
              ) : (
                <SandalwoodTreeLogo size={42} color="#B38B59" />
              )}
              <div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.08em', display: 'block', lineHeight: 1 }}>
                  {brandTitle}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: '700', color: '#B38B59', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                  {brandSub}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, marginBottom: '20px' }}>
              73 Acres of pure serenity with Red Sandalwood & Sandalwood trees, crafted for luxury relaxation, grand celebrations, and timeless memories.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#B38B59', marginBottom: '20px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
              {['Home', 'About Us', 'Stay Rooms', 'Celebrations', 'Gallery', 'Contact'].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '-')}`} 
                    style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#B38B59'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Important Policies */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#B38B59', marginBottom: '20px' }}>
              Important Information
            </h4>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
              {['Privacy Policy', 'Terms & Conditions', 'Cancellation Policy', 'Eco Preservation', 'Real Estate Buying'].map((item, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); alert(`${item} policy information: Please contact concierge.`); }}
                    style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#B38B59'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#B38B59', marginBottom: '20px' }}>
              Resort Location
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, marginBottom: '12px' }}>
              {settings?.location || 'HQ3Q+HP3, Yerravaram, Andhra Pradesh 531055'}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              Email: {settings?.email || 'hello@73hills.com'}
            </p>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div style={{
          paddingTop: '30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          © {new Date().getFullYear()} 73 Hills Resort & Real Estate. All Rights Reserved. Designed with Red Sandalwood Serenity.
        </div>

      </div>
    </footer>
  );
}
