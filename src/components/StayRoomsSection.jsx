import React, { useState, useMemo } from 'react';
import { Users, Maximize, Star, Check, ArrowRight, X } from 'lucide-react';
import { DEFAULT_ROOMS } from '../utils/storage';

export default function StayRoomsSection({ rooms = [], onSelectRoomForBooking }) {
  const [selectedRoomModal, setSelectedRoomModal] = useState(null);

  const displayRooms = useMemo(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) return DEFAULT_ROOMS;
    const mergedMap = new Map();
    DEFAULT_ROOMS.forEach(r => mergedMap.set(r.id, r));
    rooms.forEach(r => {
      if (r && r.id) {
        const def = mergedMap.get(r.id) || {};
        mergedMap.set(r.id, { ...def, ...r });
      }
    });
    const result = Array.from(mergedMap.values());
    return result.length >= 3 ? result : DEFAULT_ROOMS;
  }, [rooms]);

  return (
    <section id="stay-rooms" style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', marginBottom: '40px' }}>
          <div>
            <div className="section-subtitle">
              STAY ROOMS & VILLAS
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '8px' }}>
              Luxury Cottages Rooted in Serenity
            </h2>
          </div>
          <p style={{ maxWidth: '440px', color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Designed with natural teak wood, floor-to-ceiling glass, and panoramic views of 73 acres of sandalwood trees.
          </p>
        </div>

        {/* Room Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {displayRooms.map((room) => (
            <div key={room.id} className="luxury-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Room Image */}
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img 
                  src={room.image} 
                  alt={room.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(19, 46, 31, 0.9)',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Star size={13} fill="#B38B59" color="#B38B59" />
                  {room.rating || 4.9}
                </div>
              </div>

              {/* Room Details */}
              <div style={{ padding: '22px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="badge-gold" style={{ width: 'fit-content', marginBottom: '8px', fontSize: '0.675rem' }}>
                  {room.subtitle}
                </span>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.55rem',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {room.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.55 }}>
                  {room.description}
                </p>

                {/* Amenities Badges */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={15} color="#B38B59" />
                    {room.capacity}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Maximize size={15} color="#B38B59" />
                    {room.size}
                  </div>
                </div>

                {/* Price & Book CTA */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>
                      STARTING FROM
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: 'var(--color-emerald)', fontWeight: '700' }}>
                      ₹{room.price?.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / night</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setSelectedRoomModal(room)} 
                      className="btn-outline-dark"
                      style={{ padding: '8px 12px', fontSize: '0.725rem' }}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => onSelectRoomForBooking(room)} 
                      className="btn-gold"
                      style={{ padding: '8px 14px', fontSize: '0.725rem' }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Room Details Modal */}
      {selectedRoomModal && (
        <div className="modal-overlay" onClick={() => setSelectedRoomModal(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '680px', 
              width: '95%',
              padding: 'clamp(18px, 4vw, 32px)', 
              maxHeight: '90vh' 
            }}
          >
            <button 
              onClick={() => setSelectedRoomModal(null)}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)'
              }}
            >
              <X size={20} />
            </button>

            <img 
              src={selectedRoomModal.image} 
              alt={selectedRoomModal.name}
              style={{
                width: '100%',
                height: 'clamp(180px, 35vw, 280px)',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '18px'
              }}
            />

            <span className="badge-gold" style={{ fontSize: '0.675rem' }}>{selectedRoomModal.subtitle}</span>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', margin: '8px 0', lineHeight: 1.15 }}>
              {selectedRoomModal.name}
            </h3>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem', marginBottom: '20px' }}>
              {selectedRoomModal.description}
            </p>

            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '10px', color: 'var(--color-emerald)' }}>
              Premium Amenities Included
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '22px' }}>
              {selectedRoomModal.features?.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Check size={15} color="#B38B59" style={{ flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '12px',
              paddingTop: '16px', 
              borderTop: '1px solid var(--border-light)' 
            }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--color-emerald)' }}>
                  ₹{selectedRoomModal.price?.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / night (Excl. Tax)</span>
              </div>

              <button
                onClick={() => {
                  const room = selectedRoomModal;
                  setSelectedRoomModal(null);
                  onSelectRoomForBooking(room);
                }}
                className="btn-gold"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                Proceed to Reserve <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
