import React from 'react';
import { Heart, Gift, Briefcase, Users, PartyPopper, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CelebrationsSection({ onOpenBooking, settings = {}, sectionMedia = {} }) {

  const celebrationMedia = sectionMedia?.celebrations;
  const isVideo = celebrationMedia?.mediaType === 'video';
  const celebrationUrl = celebrationMedia?.url || '/assets/celebration_estate_aerial.jpg';

  const eventTypes = [
    { icon: <Heart size={20} color="#B38B59" />, label: 'Weddings' },
    { icon: <Gift size={20} color="#B38B59" />, label: 'Birthdays' },
    { icon: <Briefcase size={20} color="#B38B59" />, label: 'Corporate Retreats' },
    { icon: <Users size={20} color="#B38B59" />, label: 'Family Reunions' },
    { icon: <PartyPopper size={20} color="#B38B59" />, label: 'Milestone Events' }
  ];

  return (
    <section id="celebrations" style={{ padding: '80px 0', backgroundColor: 'var(--bg-cream)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          
          {/* Left Narrative & Category Pills */}
          <div>
            <div className="section-subtitle">
              CELEBRATIONS & EVENTS
            </div>
            
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
              {settings?.celebrationHeadline || 'Make Every Moment Unforgettable'}
            </h2>

            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '26px' }}>
              {settings?.celebrationParagraph || 'Whether you are planning an intimate candle-lit wedding under sparkling sandalwood canopy, an executive corporate retreat, or a milestone family reunion, 73 Hills provides 73 acres of magical natural backdrop.'}
            </p>

            {/* Event Category Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '32px'
            }}>
              {eventTypes.map((event, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {event.icon}
                  {event.label}
                </div>
              ))}
            </div>

            {/* Event Highlights List */}
            <div style={{ display: 'grid', gap: '10px', marginBottom: '28px' }}>
              {[
                'Spacious 5,000+ guest capacity open-air garden lawn',
                'Customized gourmet catering & fine dining menu options',
                'Dedicated event planners & luxury decor team',
                'Private overnight cottage stays for bridal party & VIP guests'
              ].map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={16} color="#B38B59" style={{ flexShrink: 0 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <button onClick={onOpenBooking} className="btn-gold" style={{ padding: '12px 24px' }}>
              PLAN YOUR EVENT <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Image Showcase */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(19, 46, 31, 0.16)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#0D2116'
            }}>
              {isVideo ? (
                <video 
                  key={celebrationUrl}
                  src={celebrationUrl} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  preload="auto"
                  style={{
                    width: '100%',
                    height: 'clamp(280px, 44vw, 480px)',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                />
              ) : (
                <img 
                  src={celebrationUrl} 
                  alt="73 Hills 73 Acres Grand Celebration Estate"
                  style={{
                    width: '100%',
                    height: 'clamp(280px, 44vw, 480px)',
                    objectFit: 'cover',
                    objectPosition: 'center 45%',
                    display: 'block',
                    filter: 'contrast(1.05) brightness(0.98)'
                  }}
                />
              )}

              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(13, 33, 22, 0.92) 100%)',
                pointerEvents: 'none'
              }} />

              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                color: '#FFFFFF'
              }}>
                <span className="badge-gold" style={{ marginBottom: '6px', display: 'inline-block', fontSize: '0.675rem' }}>
                  73 ACRES GRAND CELEBRATION ESTATE
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', color: '#FFFFFF', fontWeight: '600', lineHeight: 1.2 }}>
                  Grand Open-Air Lawn & Sandalwood Canopy
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.88)', marginTop: '4px' }}>
                  Spanned across 73 acres of fragrant red sandalwood forest in Yerravaram.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
