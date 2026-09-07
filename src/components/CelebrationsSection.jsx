import React, { useState } from 'react';
import { Heart, Gift, Briefcase, Users, PartyPopper, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CelebrationsSection({ onOpenBooking, settings = {}, sectionMedia = {} }) {
  const [inquireSent, setInquireSent] = useState(false);

  const celebrationMedia = sectionMedia?.celebrations;
  const isVideo = celebrationMedia?.mediaType === 'video';
  const celebrationUrl = celebrationMedia?.url || '/assets/celebration_wedding_lawn.png';

  const eventTypes = [
    { icon: <Heart size={24} color="#B38B59" />, label: 'Weddings' },
    { icon: <Gift size={24} color="#B38B59" />, label: 'Birthdays' },
    { icon: <Briefcase size={24} color="#B38B59" />, label: 'Corporate Events' },
    { icon: <Users size={24} color="#B38B59" />, label: 'Family Gatherings' },
    { icon: <PartyPopper size={24} color="#B38B59" />, label: 'Special Occasions' }
  ];

  return (
    <section id="celebrations" style={{ padding: '100px 0', backgroundColor: 'var(--bg-cream)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px',
          alignItems: 'center'
        }}>
          
          {/* Left Narrative & Category Pills */}
          <div>
            <div className="section-subtitle">
              CELEBRATIONS
            </div>
            
            <h2 className="section-title">
              {settings?.celebrationHeadline || 'Make Every Moment Unforgettable'}
            </h2>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              {settings?.celebrationParagraph || 'Whether you are planning an intimate candle-lit wedding under sparkling sandalwood canopy, an executive corporate retreat, or a milestone family reunion, 73 Hills provides 73 acres of magical natural backdrop.'}
            </p>

            {/* Event Category Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '40px'
            }}>
              {eventTypes.map((event, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
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
            <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
              {[
                'Spacious 5,000+ guest capacity open-air garden lawn',
                'Customized gourmet catering & fine dining menu options',
                'Dedicated event planners & luxury decor team',
                'Private overnight cottage stays for bridal party & VIP guests'
              ].map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.925rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={18} color="#B38B59" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <button onClick={onOpenBooking} className="btn-gold">
              PLAN YOUR EVENT <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Image Showcase */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)'
            }}>
              {isVideo ? (
                <video 
                  src={celebrationUrl} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  style={{
                    width: '100%',
                    height: '480px',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                />
              ) : (
                <img 
                  src={celebrationUrl} 
                  alt="73 Hills Outdoor Celebration Lawn"
                  style={{
                    width: '100%',
                    height: '480px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              )}

              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(19, 46, 31, 0.9) 100%)'
              }} />

              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                right: '30px',
                color: '#FFFFFF'
              }}>
                <span className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  GRAND WEDDING VENUE
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#FFFFFF', fontWeight: '600' }}>
                  Natural Forest Lawn & Sparkling Canopy
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '4px' }}>
                  Spanned across 73 acres of fragrant red sandalwood estate.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
