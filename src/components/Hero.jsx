import React from 'react';
import { Calendar, Compass, Trees, ShieldCheck, Star } from 'lucide-react';
import { SandalwoodBranchGraphic } from './SandalwoodGraphics';

export default function Hero({ settings, sectionMedia = {}, onOpenBooking }) {
  const heroMedia = sectionMedia?.hero;
  const isVideo = heroMedia?.mediaType === 'video';
  const heroBgUrl = heroMedia?.url || '/assets/hero_resort_villa.png';

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '100px',
        paddingBottom: '60px',
        overflow: 'hidden',
        backgroundColor: '#0D2116'
      }}
    >
      {/* High-Resolution Background Media (Video or Image) */}
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
            opacity: 0.65
          }} 
        />
      ) : (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.55
          }}
        />
      )}

      {/* Dark Forest Green Ambient Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(13, 33, 22, 0.7) 0%, rgba(13, 33, 22, 0.4) 50%, rgba(13, 33, 22, 0.95) 100%)'
        }}
      />

      {/* Sandalwood Graphic Line Art Decorative Overlay (Right side background like reference image) */}
      <div style={{
        position: 'absolute',
        right: '-40px',
        top: '15%',
        pointerEvents: 'none',
        opacity: 0.35,
        transform: 'rotate(-10deg) scale(1.3)'
      }}>
        <SandalwoodBranchGraphic width={400} height={500} color="#B38B59" />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{ maxWidth: '780px' }}>
          
          {/* Welcome Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: 'rgba(179, 139, 89, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(179, 139, 89, 0.4)',
            borderRadius: 'var(--radius-full)',
            color: '#EFE7DA',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: '700',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <Trees size={14} color="#B38B59" />
            WELCOME TO 73 HILLS
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
            fontFamily: 'var(--font-serif)',
            color: '#FFFFFF',
            fontWeight: '500',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            marginBottom: '24px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            {settings?.heroTitle || 'A Luxury Escape Rooted in Nature'}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
            fontFamily: 'var(--font-sans)',
            color: 'rgba(255, 255, 255, 0.88)',
            fontWeight: '400',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '660px'
          }}>
            {settings?.heroSubtitle || '73 Acres of pure serenity with Red Sandalwood & Sandalwood trees, crafted for relaxation, celebrations, and unforgettable memories.'}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={onOpenBooking} 
              className="btn-gold" 
              style={{ padding: '16px 36px', fontSize: '0.95rem' }}
            >
              <Calendar size={18} />
              BOOK NOW
            </button>

            <a 
              href="#about" 
              className="btn-outline-gold" 
              style={{ padding: '16px 32px', fontSize: '0.95rem' }}
            >
              <Compass size={18} />
              EXPLORE MORE
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '24px',
            marginTop: '60px',
            paddingTop: '30px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            maxWidth: '620px'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#B38B59', fontWeight: '700' }}>
                73
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Acres Sandalwood Estate
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#B38B59', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                4.9 <Star size={20} fill="#B38B59" color="#B38B59" />
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Guest Rating (30+ Reviews)
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#B38B59', fontWeight: '700' }}>
                100%
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Pure Nature & Privacy
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
