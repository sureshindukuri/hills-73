import React, { useState, useRef } from 'react';
import { Play, CheckCircle2, Trees, X, Volume2, VolumeX, Maximize, Film } from 'lucide-react';
import { SandalwoodBotanicalArt } from './SandalwoodGraphics';

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube watch link
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=0&rel=0&loop=1&playlist=${ytMatch[1]}`;
  }
  // Vimeo link
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=0&loop=1`;
  }
  return null;
}

export default function AboutSection({ settings, sectionMedia = {} }) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const aboutMedia = sectionMedia?.about;
  const isVideo = aboutMedia ? (aboutMedia.mediaType === 'video' || !!aboutMedia.customUrl) : true;
  const aboutUrl = aboutMedia?.url || 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-in-the-forest-42407-large.mp4';
  const embedUrl = getEmbedUrl(aboutUrl);

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="about" style={{ padding: '100px 0', position: 'relative', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Resort Full View Video with Sound & Modal Playback */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(19, 46, 31, 0.16)',
                border: '1px solid var(--color-gold)',
                backgroundColor: '#0D2116',
                cursor: 'pointer'
              }}
              onClick={() => setVideoModalOpen(true)}
              className="luxury-card"
            >
              {/* If YouTube / Embed Link */}
              {embedUrl ? (
                <div style={{ position: 'relative', height: '480px', overflow: 'hidden' }}>
                  <iframe 
                    src={embedUrl}
                    title="73 Hills Resort Full View Tour"
                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : isVideo ? (
                /* Direct Video File / MP4 / WebM / Blob */
                <div style={{ position: 'relative', height: '480px' }}>
                  <video 
                    ref={videoRef}
                    src={aboutUrl} 
                    autoPlay 
                    muted={isMuted} 
                    loop 
                    playsInline 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                  
                  {/* Audio Toggle Button */}
                  <button
                    onClick={toggleSound}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 10,
                      backgroundColor: 'rgba(13, 33, 22, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      border: '1px solid var(--color-gold)',
                      borderRadius: 'var(--radius-full)',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                    title={isMuted ? 'Click to Unmute Video Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX size={16} color="#B38B59" /> : <Volume2 size={16} color="#28A745" />}
                    <span>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
                  </button>
                </div>
              ) : (
                /* Fallback Image */
                <img 
                  src={aboutUrl} 
                  alt="73 Hills Sandalwood Walkway" 
                  style={{
                    width: '100%',
                    height: '480px',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease'
                  }}
                />
              )}

              {/* Ambient Dark Forest Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(13, 33, 22, 0.15) 0%, rgba(13, 33, 22, 0) 40%, rgba(13, 33, 22, 0.85) 100%)',
                pointerEvents: 'none'
              }} />

              {/* Center Play / Expand Button Icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(253, 251, 247, 0.95)',
                  border: '2px solid var(--color-gold)',
                  color: 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 35px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 5
                }}
              >
                <Play size={32} style={{ marginLeft: '4px' }} fill="currentColor" />
              </div>

              {/* Top-Left Live Video Tag */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(13, 33, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(179, 139, 89, 0.5)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                zIndex: 5
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#4EBA6F',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #4EBA6F'
                }} />
                RESORT FULL VIEW VIDEO
              </div>

              {/* Bottom Badge with Full Video Tour Caption */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                backgroundColor: 'rgba(19, 46, 31, 0.92)',
                backdropFilter: 'blur(10px)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(179, 139, 89, 0.4)',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Trees size={20} color="#B38B59" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF' }}>
                      73 Acres Sandalwood Sanctuary Tour
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#B38B59', letterSpacing: '0.05em' }}>
                      Click to watch in cinematic 4K full-screen
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(179, 139, 89, 0.25)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  <Maximize size={12} /> EXPAND
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Content with 4K Sandalwood Botanical Illustration Artwork */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            
            <div className="section-subtitle">
              ABOUT US
            </div>

            <h2 className="section-title">
              {settings?.aboutHeadline || 'Where Nature Meets Luxury'}
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: '28px'
            }}>
              {settings?.aboutParagraph || "73 Hills is a premium resort and real estate property sprawled across 73 acres of fragrance, greenery and tranquility. Home to Red Sandalwood and Sandalwood Gandom trees, this is more than a stay — it's an experience that stays with you forever."}
            </p>

            {/* Premium Sandalwood Botanical Art Showcase Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <SandalwoodBotanicalArt width={90} height={90} shadow={false} />
              
              <div>
                <span className="badge-gold" style={{ fontSize: '0.65rem', marginBottom: '4px', display: 'inline-block' }}>
                  GENUINE BOTANICAL HERITAGE
                </span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-emerald)', fontWeight: '600' }}>
                  Santalum Album & Red Sandalwood
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                  Nurtured naturally across 73 acres of fragrant pristine forest.
                </p>
              </div>
            </div>

            {/* Bullet Features */}
            <div style={{ display: 'grid', gap: '14px', marginBottom: '32px' }}>
              {[
                '73 Acres of rare Red Sandalwood & Sandalwood tree forest estate',
                'Eco-friendly luxury wooden villas and private infinity pools',
                'Exclusive venue for weddings, corporate retreats, and private celebrations',
                'Located in pristine Yerravaram, Andhra Pradesh'
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={20} color="#B38B59" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500' }}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <a href="#stay-rooms" className="btn-gold">
              VIEW MORE
            </a>

          </div>

        </div>
      </div>

      {/* Cinematic Fullscreen Video Modal Preview */}
      {videoModalOpen && (
        <div className="modal-overlay" onClick={() => setVideoModalOpen(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '960px', width: '95%', backgroundColor: '#0A0E0C', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              backgroundColor: 'var(--bg-forest)',
              color: '#FFFFFF',
              borderBottom: '1px solid rgba(179, 139, 89, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Film size={20} color="#B38B59" />
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '600' }}>
                  73 Hills Resort — 73 Acres Full Aerial & Ground Video Experience
                </span>
              </div>

              <button
                onClick={() => setVideoModalOpen(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', minHeight: '440px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {embedUrl ? (
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={embedUrl}
                    title="73 Hills Resort Showcase"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video 
                  src={aboutUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: '#0D2116',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.85rem'
            }}>
              <span>Yerravaram, Andhra Pradesh • 73 Acres of Pure Serenity</span>
              <a href="#stay-rooms" onClick={() => setVideoModalOpen(false)} style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: '700' }}>
                Explore Cottages & Reserve →
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
