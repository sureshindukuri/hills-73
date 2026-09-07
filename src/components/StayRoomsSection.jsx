import React, { useState } from 'react';
import { Users, Maximize, Star, Check, ArrowRight, X } from 'lucide-react';

export default function StayRoomsSection({ rooms = [], onSelectRoomForBooking }) {
  const [selectedRoomModal, setSelectedRoomModal] = useState(null);

  return (
    <section id="stay-rooms" style={{ padding: '100px 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
          <div>
            <div className="section-subtitle">
              STAY ROOMS & VILLAS
            </div>
            <h2 className="section-title">
              Luxury Cottages Rooted in Serenity
            </h2>
          </div>
          <p style={{ maxWidth: '440px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Designed with natural teak wood, floor-to-ceiling glass, and panoramic views of 73 acres of sandalwood trees.
          </p>
        </div>

        {/* Room Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {rooms.map((room) => (
            <div key={room.id} className="luxury-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Room Image */}
              <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
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
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(19, 46, 31, 0.9)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Star size={14} fill="#B38B59" color="#B38B59" />
                  {room.rating || 4.9}
                </div>
              </div>

              {/* Room Details */}
              <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="badge-gold" style={{ width: 'fit-content', marginBottom: '8px' }}>
                  {room.subtitle}
                </span>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.75rem',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  {room.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                  {room.description}
                </p>

                {/* Amenities Badges */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '0.825rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#B38B59" />
                    {room.capacity}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Maximize size={16} color="#B38B59" />
                    {room.size}
                  </div>
                </div>

                {/* Price & Book CTA */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase' }}>
                      STARTING FROM
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', fontWeight: '700' }}>
                      ₹{room.price?.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / night</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedRoomModal(room)} 
                      className="btn-outline-dark"
                      style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => onSelectRoomForBooking(room)} 
                      className="btn-gold"
                      style={{ padding: '8px 16px', fontSize: '0.75rem' }}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <button 
              onClick={() => setSelectedRoomModal(null)}
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
              <X size={24} />
            </button>

            <img 
              src={selectedRoomModal.image} 
              alt={selectedRoomModal.name}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '24px'
              }}
            />

            <span className="badge-gold">{selectedRoomModal.subtitle}</span>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', margin: '12px 0 8px 0' }}>
              {selectedRoomModal.name}
            </h3>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {selectedRoomModal.description}
            </p>

            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-emerald)' }}>
              Premium Amenities Included
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              {selectedRoomModal.features?.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <Check size={16} color="#B38B59" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--color-emerald)' }}>
                  ₹{selectedRoomModal.price?.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--text-muted)' }}> / night (Excl. Tax)</span>
              </div>

              <button
                onClick={() => {
                  const room = selectedRoomModal;
                  setSelectedRoomModal(null);
                  onSelectRoomForBooking(room);
                }}
                className="btn-gold"
              >
                Proceed to Reserve <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
