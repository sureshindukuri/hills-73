import React, { useState, useMemo } from 'react';
import { Users, Maximize, Star, Check, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ensureThreeRooms } from '../utils/storage';

const MINI_MASTER_PHOTOS = [
  '/assets/mini_master_room_1.jpg',
  '/assets/mini_master_room_2.jpg',
  '/assets/mini_master_room_3.jpg'
];

const STAY_HUTS_PHOTOS = [
  '/assets/stay_huts_exterior_1.jpg',
  '/assets/stay_huts_interior_2.jpg'
];

export default function StayRoomsSection({ rooms = [], onSelectRoomForBooking }) {
  const [selectedRoomModal, setSelectedRoomModal] = useState(null);
  const [roomImgIndexes, setRoomImgIndexes] = useState({});

  const displayRooms = useMemo(() => {
    return ensureThreeRooms(rooms);
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
          {displayRooms.map((room, index) => {
            const isRoomAvailable = room.isAvailable !== false;
            const isMiniMaster = room.id === 'room-1' || room.name === 'Mini Family Master Room' || index === 0;
            const isStayHuts = room.id === 'room-3' || room.name === 'Stay Huts' || index === 2;

            const roomPhotos = (room.images && room.images.length > 0) 
              ? room.images 
              : (isMiniMaster 
                  ? MINI_MASTER_PHOTOS 
                  : (isStayHuts 
                      ? STAY_HUTS_PHOTOS 
                      : [room.image || '/assets/hero_resort_villa.png']));

            const activeIdx = roomImgIndexes[room.id] || 0;
            const currentImg = roomPhotos[activeIdx % roomPhotos.length];
            const hasMultiPhotos = roomPhotos.length > 1;

            const handlePrev = (e) => {
              e.stopPropagation();
              setRoomImgIndexes(prev => ({
                ...prev,
                [room.id]: ((prev[room.id] || 0) === 0 ? roomPhotos.length - 1 : (prev[room.id] || 0) - 1)
              }));
            };

            const handleNext = (e) => {
              e.stopPropagation();
              setRoomImgIndexes(prev => ({
                ...prev,
                [room.id]: ((prev[room.id] || 0) + 1) % roomPhotos.length
              }));
            };

            const handleSelectDot = (e, idx) => {
              e.stopPropagation();
              setRoomImgIndexes(prev => ({
                ...prev,
                [room.id]: idx
              }));
            };

            return (
              <div key={room.id} className="luxury-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Room Image */}
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden', backgroundColor: '#0D2116' }}>
                  <img 
                    src={currentImg} 
                    alt={room.name} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease, opacity 0.3s ease',
                      filter: 'contrast(1.05) brightness(1.02)'
                    }}
                  />

                  {/* Small arrow marks for multi-photo rooms (Mini Master Room & Stay Huts) */}
                  {hasMultiPhotos && (
                    <>
                      <button
                        onClick={handlePrev}
                        aria-label="Previous photo"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '10px',
                          transform: 'translateY(-50%)',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(13, 33, 22, 0.85)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(179, 139, 89, 0.8)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          zIndex: 6,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ChevronLeft size={16} color="#B38B59" />
                      </button>

                      <button
                        onClick={handleNext}
                        aria-label="Next photo"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '10px',
                          transform: 'translateY(-50%)',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(13, 33, 22, 0.85)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(179, 139, 89, 0.8)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          zIndex: 6,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ChevronRight size={16} color="#B38B59" />
                      </button>

                      {/* Small Indicator Dots */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 6,
                        backgroundColor: 'rgba(13, 33, 22, 0.75)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(179, 139, 89, 0.3)'
                      }}>
                        {roomPhotos.map((_, idx) => (
                          <div 
                            key={idx}
                            onClick={(e) => handleSelectDot(e, idx)}
                            style={{
                              width: idx === (activeIdx % roomPhotos.length) ? '16px' : '6px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: idx === (activeIdx % roomPhotos.length) ? '#B38B59' : 'rgba(255,255,255,0.5)',
                              cursor: 'pointer',
                              transition: 'all 0.25s ease'
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Sold Out / Unavailable Banner / Badge */}
                  {!isRoomAvailable && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      backgroundColor: 'rgba(198, 40, 40, 0.95)',
                      color: '#FFFFFF',
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      letterSpacing: '0.06em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      zIndex: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      textTransform: 'uppercase'
                    }}>
                      ✕ BOOKED / UNAVAILABLE
                    </div>
                  )}

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
                    gap: '4px',
                    zIndex: 5
                  }}>
                    <Star size={13} fill="#B38B59" color="#B38B59" />
                    {room.rating || 4.9}
                  </div>
                </div>

              {/* Room Details */}
              <div style={{ padding: '22px', flexGrow: 1, display: 'flex', flexDirection: 'column', opacity: isRoomAvailable ? 1 : 0.75 }}>
                <span className="badge-gold" style={{ width: 'fit-content', marginBottom: '8px', fontSize: '0.675rem' }}>
                  {room.subtitle}
                </span>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.55rem',
                  color: isRoomAvailable ? 'var(--text-main)' : '#888888',
                  fontWeight: '600',
                  marginBottom: '8px',
                  textDecoration: !isRoomAvailable ? 'line-through' : 'none',
                  textDecorationColor: '#D32F2F',
                  textDecorationThickness: '2px'
                }}>
                  {room.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.55 }}>
                  {room.description}
                </p>

                {/* Amenities Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={15} color="#B38B59" />
                    {room.capacity}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Maximize size={15} color="#B38B59" />
                    {room.size}
                  </div>
                  {room.allowExtraGuests !== false && Number(room.extraGuestPrice) > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B38B59', fontSize: '0.75rem', fontWeight: '500' }}>
                      +₹{Number(room.extraGuestPrice).toLocaleString('en-IN')}/extra guest
                    </div>
                  )}
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
                    <span style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontSize: '1.45rem', 
                      color: isRoomAvailable ? 'var(--color-emerald)' : '#888888', 
                      fontWeight: '700',
                      textDecoration: !isRoomAvailable ? 'line-through' : 'none',
                      textDecorationColor: '#D32F2F',
                      textDecorationThickness: '2px'
                    }}>
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
                      onClick={() => isRoomAvailable && onSelectRoomForBooking(room)} 
                      disabled={!isRoomAvailable}
                      className={isRoomAvailable ? "btn-gold" : "btn-outline-dark"}
                      style={{ 
                        padding: '8px 14px', 
                        fontSize: '0.725rem',
                        opacity: isRoomAvailable ? 1 : 0.6,
                        cursor: isRoomAvailable ? 'pointer' : 'not-allowed',
                        backgroundColor: !isRoomAvailable ? '#333333' : undefined,
                        color: !isRoomAvailable ? '#FFFFFF' : undefined,
                        borderColor: !isRoomAvailable ? '#555555' : undefined
                      }}
                    >
                      {isRoomAvailable ? "Book Now" : "Booked (Sold Out)"}
                    </button>
                  </div>
                </div>

              </div>

            </div>
            );
          })}
        </div>

      </div>

      {/* Room Details Modal */}
      {selectedRoomModal && (() => {
        const isModalRoomAvailable = selectedRoomModal.isAvailable !== false;
        return (
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

              {(() => {
                const modalPhotos = (selectedRoomModal.images && selectedRoomModal.images.length > 0)
                  ? selectedRoomModal.images
                  : ((selectedRoomModal.id === 'room-1' || selectedRoomModal.name === 'Mini Family Master Room')
                      ? MINI_MASTER_PHOTOS
                      : ((selectedRoomModal.id === 'room-3' || selectedRoomModal.name === 'Stay Huts')
                          ? STAY_HUTS_PHOTOS
                          : [selectedRoomModal.image || '/assets/hero_resort_villa.png']));
                const modalIdx = roomImgIndexes[selectedRoomModal.id] || 0;
                return (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={modalPhotos[modalIdx % modalPhotos.length]} 
                      alt={selectedRoomModal.name}
                      style={{
                        width: '100%',
                        height: 'clamp(180px, 35vw, 280px)',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '18px'
                      }}
                    />
                    {!isModalRoomAvailable && (
                      <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        backgroundColor: 'rgba(198, 40, 40, 0.95)',
                        color: '#FFFFFF',
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        letterSpacing: '0.06em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        textTransform: 'uppercase'
                      }}>
                        ✕ Currently Booked / Unavailable
                      </div>
                    )}
                  </div>
                );
              })()}

              <span className="badge-gold" style={{ fontSize: '0.675rem' }}>{selectedRoomModal.subtitle}</span>

              <h3 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', 
                margin: '8px 0', 
                lineHeight: 1.15,
                textDecoration: !isModalRoomAvailable ? 'line-through' : 'none',
                textDecorationColor: '#D32F2F',
                textDecorationThickness: '2px'
              }}>
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
                  <span style={{ 
                    fontSize: '1.5rem', 
                    fontFamily: 'var(--font-serif)', 
                    fontWeight: '700', 
                    color: isModalRoomAvailable ? 'var(--color-emerald)' : '#888888',
                    textDecoration: !isModalRoomAvailable ? 'line-through' : 'none',
                    textDecorationColor: '#D32F2F',
                    textDecorationThickness: '2px'
                  }}>
                    ₹{selectedRoomModal.price?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / night (Excl. Tax)</span>
                  {selectedRoomModal.allowExtraGuests !== false && Number(selectedRoomModal.extraGuestPrice) > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#B38B59', marginTop: '2px' }}>
                      Extra Guest Surcharge: ₹{Number(selectedRoomModal.extraGuestPrice).toLocaleString('en-IN')}/night
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!isModalRoomAvailable) return;
                    const room = selectedRoomModal;
                    setSelectedRoomModal(null);
                    onSelectRoomForBooking(room);
                  }}
                  disabled={!isModalRoomAvailable}
                  className={isModalRoomAvailable ? "btn-gold" : "btn-outline-dark"}
                  style={{ 
                    padding: '10px 20px', 
                    fontSize: '0.85rem',
                    opacity: isModalRoomAvailable ? 1 : 0.6,
                    cursor: isModalRoomAvailable ? 'pointer' : 'not-allowed',
                    backgroundColor: !isModalRoomAvailable ? '#333333' : undefined,
                    color: !isModalRoomAvailable ? '#FFFFFF' : undefined
                  }}
                >
                  {isModalRoomAvailable ? (
                    <>Proceed to Reserve <ArrowRight size={15} /></>
                  ) : (
                    'Sold Out / Fully Booked'
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </section>
  );
}
