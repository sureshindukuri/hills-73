import React, { useState } from 'react';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';
import { Shield, X, Info, Trees, Building, FileText, Lock } from 'lucide-react';

export default function Footer({ onOpenBooking, onToggleAdmin, settings = {}, sectionMedia = {} }) {
  const [infoModalItem, setInfoModalItem] = useState(null);
  const logoMedia = sectionMedia?.logo;
  const brandTitle = settings?.brandName || '73 HILLS';
  const brandSub = settings?.brandSubtitle || 'RESORT & REAL ESTATE';

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Stay Rooms', href: '#stay-rooms' },
    { label: 'Celebrations', href: '#celebrations' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' }
  ];

  const infoContents = {
    'Privacy Policy': {
      title: 'Privacy Policy & Data Security',
      icon: <Lock size={22} color="#B38B59" />,
      content: settings.privacyPolicy || 'At 73 Hills Resort, your privacy is strictly protected. Guest identity records and payment data are encrypted under 256-bit SSL protocols and will never be shared with third parties. All digital transactions are authenticated via secure Indian banking channels.'
    },
    'Terms & Conditions': {
      title: 'Terms & Guest Conditions',
      icon: <FileText size={22} color="#B38B59" />,
      content: 'All guests must register with government-approved photo ID (Aadhaar, Passport, or Driving License) upon check-in. Standard check-in is from 02:00 PM and check-out is by 11:00 AM. Early check-in or late check-out is subject to availability and prior confirmation with management.'
    },
    'Cancellation Policy': {
      title: 'Cancellation & Refund Policy',
      icon: <Info size={22} color="#B38B59" />,
      content: settings.cancellationPolicy || 'Free cancellation up to 48 hours before scheduled check-in date. Cancellations made within 48 hours are subject to a 1-night retention tariff charge. Refunds are processed back to original payment method within 5-7 business days.'
    },
    'Eco Preservation': {
      title: '73 Acres Sandalwood Sanctuary Eco Guidelines',
      icon: <Trees size={22} color="#B38B59" />,
      content: '73 Hills is a biological sanctuary home to thousands of rare Red Sandalwood & Sandalwood (Santalum Album) trees. Open fires, cigarette smoking in forested areas, and damaging flora or fauna are strictly prohibited. We practice zero-plastic waste and eco-conscious hospitality.'
    },
    'Real Estate Buying': {
      title: '73 Hills Real Estate & Sandalwood Farmland Plots',
      icon: <Building size={22} color="#B38B59" />,
      content: 'Own a piece of paradise in 73 Hills! We offer premium gated estate plots and high-yield Red Sandalwood plantation farm lands with 24/7 security, drip irrigation, resort club membership, and clear legal titles. Contact our real estate concierge desk at hello@73hills.com or +91 9948445143 for brochures and private site visits.'
    }
  };

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
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href} 
                    style={{ color: 'rgba(255, 255, 255, 0.75)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#B38B59'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    {link.label}
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
              {Object.keys(infoContents).map((item, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => setInfoModalItem(item)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255, 255, 255, 0.75)', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#B38B59'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Location & Contact & Admin Portal */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#B38B59', marginBottom: '20px' }}>
              Resort Location
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, marginBottom: '12px' }}>
              {settings?.location || 'HQ3Q+HP3, Yerravaram, Andhra Pradesh 531055'}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '20px' }}>
              Email: {settings?.email || 'hello@73hills.com'}
            </p>

            {/* Admin Portal Trigger */}
            <button
              onClick={onToggleAdmin}
              style={{
                backgroundColor: 'rgba(179, 139, 89, 0.15)',
                border: '1px solid rgba(179, 139, 89, 0.4)',
                color: '#EFE7DA',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--color-gold)';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(179, 139, 89, 0.15)';
                e.target.style.color = '#EFE7DA';
              }}
            >
              <Shield size={14} />
              Admin Portal
            </button>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div style={{
          paddingTop: '30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div>
            © {new Date().getFullYear()} 73 Hills Resort & Real Estate. All Rights Reserved.
          </div>
          <div>
            Designed with Red Sandalwood Serenity • Yerravaram, Andhra Pradesh
          </div>
        </div>

      </div>

      {/* Info & Policy Modal */}
      {infoModalItem && infoContents[infoModalItem] && (
        <div className="modal-overlay" onClick={() => setInfoModalItem(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '600px', padding: '32px', backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setInfoModalItem(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {infoContents[infoModalItem].icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', fontWeight: '600' }}>
                {infoContents[infoModalItem].title}
              </h3>
            </div>

            <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '24px' }}>
              {infoContents[infoModalItem].content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setInfoModalItem(null)}
                className="btn-gold"
                style={{ padding: '8px 24px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
