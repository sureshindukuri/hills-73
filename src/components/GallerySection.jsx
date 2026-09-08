import React, { useState, useEffect } from 'react';
import { getAllGalleryItems } from '../utils/storage';
import { Play, Maximize2, X } from 'lucide-react';

export default function GallerySection() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const list = await getAllGalleryItems();
    setItems(list);
  };

  const categories = ['All', 'Cottages', 'Nature', 'Celebrations', 'Videos'];

  const filteredItems = activeCategory === 'All' 
    ? items 
    : activeCategory === 'Videos' 
      ? items.filter(item => item.type === 'video')
      : items.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="gallery" style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <div className="section-subtitle">
              GALLERY SHOWCASE
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '4px' }}>
              Moments That Stay Forever
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div 
            className="no-scrollbar"
            style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '8px',
              paddingBottom: '4px',
              maxWidth: '100%'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--color-gold)' : 'var(--border-light)',
                  backgroundColor: activeCategory === cat ? 'var(--color-gold)' : '#FFFFFF',
                  color: activeCategory === cat ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '18px'
        }}>
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setLightboxItem(item)}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)'
              }}
              className="luxury-card"
            >
              {item.type === 'video' ? (
                <video 
                  src={item.url} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted 
                />
              ) : (
                <img 
                  src={item.url} 
                  alt={item.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
              )}

              {/* Hover overlay with title & icon */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(19, 46, 31, 0.88) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '16px',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '2px 7px', marginBottom: '3px', display: 'inline-block' }}>
                      {item.category || 'Resort'}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#FFFFFF', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </h4>
                  </div>

                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.type === 'video' ? <Play size={15} fill="#FFF" /> : <Maximize2 size={14} />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No media files found in this category. Upload photos or videos in the Admin Panel!
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="modal-overlay" onClick={() => setLightboxItem(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', width: '96%', backgroundColor: '#0A0E0C', padding: 0 }}
          >
            <button
              onClick={() => setLightboxItem(null)}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.65)',
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

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', maxHeight: '75vh', padding: '16px' }}>
              {lightboxItem.type === 'video' ? (
                <video 
                  src={lightboxItem.url} 
                  controls 
                  autoPlay 
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 'var(--radius-sm)' }} 
                />
              ) : (
                <img 
                  src={lightboxItem.url} 
                  alt={lightboxItem.title} 
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                />
              )}
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-forest)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div>
                <span className="badge-gold" style={{ fontSize: '0.65rem' }}>{lightboxItem.category}</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#FFFFFF', marginTop: '2px' }}>
                  {lightboxItem.title}
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', whiteSpace: 'nowrap' }}>
                73 Hills Sanctuary
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
