import React from 'react';
import { Calendar, Compass, Trees, Star, MapPin, ArrowRight, Shield } from 'lucide-react';

export default function Hero({ settings, sectionMedia = {}, onOpenBooking }) {
  const heroMedia = sectionMedia?.hero;
  const isVideo = heroMedia?.mediaType === 'video';
  const heroBgUrl = heroMedia?.url || '/assets/hero_aerial_73hills.jpg';

  return (
    <section 
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '110px',
        paddingBottom: '50px',
        overflow: 'hidden',
        backgroundColor: '#0D2116'
      }}
    >
      {/* 4K Pure Resolution Untouched Native Background */}
      {isVideo ? (
        <video 
          src={heroBgUrl} 
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.95,
            filter: 'contrast(1.04) brightness(0.98)'
          }} 
        />
      ) : (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            backgroundRepeat: 'no-repeat',
            filter: 'contrast(1.04) brightness(0.98)'
          }}
        />
      )}

      {/* Subtle Directional Ambient Vignette for Crystal Clear Text Readability without Dullness */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.48) 38%, rgba(0, 0, 0, 0.12) 65%, rgba(0, 0, 0, 0) 100%)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, transparent 22%, transparent 78%, rgba(0, 0, 0, 0.65) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Right Floating Location Pill */}
      <div 
        className="hero-aerial-badge"
        style={{
          position: 'absolute',
          top: '110px',
          right: '36px',
          zIndex: 20,
          backgroundColor: 'rgba(10, 24, 16, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(179, 139, 89, 0.45)',
          borderRadius: '9999px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
        }}
      >
        <MapPin size={14} color="#B38B59" />
        <span style={{
          color: '#FFFFFF',
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)'
        }}>
          73 ACRES AERIAL SANCTUARY • YERRAVARAM
        </span>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{ 
          maxWidth: '650px',
          padding: '10px 0'
        }}>
          
          {/* Welcome Tag with Flanking Horizontal Lines */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <span style={{ width: '30px', height: '1.5px', backgroundColor: '#B38B59', display: 'inline-block' }} />
            <span style={{
              color: '#B38B59',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)'
            }}>
              WELCOME TO 73 HILLS
            </span>
            <span style={{ width: '30px', height: '1.5px', backgroundColor: '#B38B59', display: 'inline-block' }} />
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 5.2vw, 4.5rem)',
            fontFamily: 'var(--font-serif)',
            color: '#FFFFFF',
            fontWeight: '500',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            marginBottom: '20px',
            textShadow: '0 4px 25px rgba(0, 0, 0, 0.8)'
          }}>
            A Luxury Escape Rooted<br />in Nature
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.12rem)',
            fontFamily: 'var(--font-sans)',
            color: 'rgba(255, 255, 255, 0.92)',
            fontWeight: '400',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '520px',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.85)'
          }}>
            {settings?.heroSubtitle || '73 Acres of pure serenity with Red Sandalwood & Sandalwood trees, crafted for relaxation, celebrations, and unforgettable memories.'}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '46px' }}>
            <button 
              onClick={onOpenBooking} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#B38B59',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontWeight: '700',
                fontSize: '0.875rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(179, 139, 89, 0.45)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#967041';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#B38B59';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Calendar size={16} />
              <span>BOOK NOW</span>
              <ArrowRight size={16} />
            </button>

            <a 
              href="#about" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(10, 24, 16, 0.65)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontWeight: '600',
                fontSize: '0.875rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.55)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(10, 24, 16, 0.65)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.55)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Compass size={16} />
              <span>EXPLORE TOUR</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Stats Bar with Vertical Dividers */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '24px',
            paddingTop: '20px'
          }}>
            {/* Stat 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trees size={26} color="#B38B59" />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#B38B59', fontWeight: '700', lineHeight: 1 }}>
                  73
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px', lineHeight: 1.25 }}>
                  ACRES SANDALWOOD<br />SANCTUARY
                </div>
              </div>
            </div>

            {/* Divider 1 */}
            <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

            {/* Stat 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Star size={24} color="#B38B59" fill="#B38B59" />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#B38B59', fontWeight: '700', lineHeight: 1 }}>
                  4.9
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px', lineHeight: 1.25 }}>
                  GUEST RATING<br />(30+ REVIEWS)
                </div>
              </div>
            </div>

            {/* Divider 2 */}
            <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

            {/* Stat 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={24} color="#B38B59" />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: '#B38B59', fontWeight: '700', lineHeight: 1 }}>
                  100%
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px', lineHeight: 1.25 }}>
                  NATURAL PRIVACY &<br />LAKE VIEW
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-aerial-badge {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
