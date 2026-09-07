import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ExperienceDifference from './components/ExperienceDifference';
import StayRoomsSection from './components/StayRoomsSection';
import CelebrationsSection from './components/CelebrationsSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';

import { getStoredRooms, getSiteSettings, getAllSectionMedia } from './utils/storage';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const [rooms, setRooms] = useState(getStoredRooms());
  const [settings, setSettings] = useState(getSiteSettings());
  const [sectionMedia, setSectionMedia] = useState({});

  useEffect(() => {
    // Load section media (logo, hero video/image, about media, celebrations media, etc.)
    const loadMedia = async () => {
      try {
        const mediaMap = await getAllSectionMedia();
        setSectionMedia(mediaMap);
      } catch (e) {
        console.warn('Failed to load section media:', e);
      }
    };
    loadMedia();

    const checkAdminRoute = () => {
      const isRoute = window.location.pathname.toLowerCase().includes('/admin') || 
                      window.location.hash.toLowerCase().includes('admin');
      setAdminPanelOpen(isRoute);
    };

    checkAdminRoute();

    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminPanelOpen(false);
    if (window.location.pathname.toLowerCase().includes('/admin')) {
      window.history.pushState({}, '', '/');
    } else if (window.location.hash.toLowerCase().includes('admin')) {
      window.location.hash = '';
    }
  };

  const handleOpenBooking = (room = null) => {
    setSelectedRoomForBooking(room);
    setBookingModalOpen(true);
  };

  const handleToggleAdmin = () => {
    setAdminPanelOpen(!adminPanelOpen);
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <Header 
        settings={settings}
        sectionMedia={sectionMedia}
        onOpenBooking={() => handleOpenBooking()}
        onToggleAdmin={handleToggleAdmin}
        isAdminView={adminPanelOpen}
      />

      {/* Main Website Sections */}
      <main style={{ flexGrow: 1 }}>
        <Hero 
          settings={settings} 
          sectionMedia={sectionMedia}
          onOpenBooking={() => handleOpenBooking()} 
        />

        <AboutSection 
          settings={settings} 
          sectionMedia={sectionMedia}
        />

        <ExperienceDifference />

        <StayRoomsSection 
          rooms={rooms}
          onSelectRoomForBooking={(room) => handleOpenBooking(room)}
        />

        <CelebrationsSection 
          settings={settings}
          sectionMedia={sectionMedia}
          onOpenBooking={() => handleOpenBooking()} 
        />

        <GallerySection />

        <ContactSection 
          settings={settings} 
        />
      </main>

      {/* Footer */}
      <Footer 
        settings={settings} 
        sectionMedia={sectionMedia}
        onOpenBooking={() => handleOpenBooking()}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        rooms={rooms}
        settings={settings}
      />

      {/* Admin Panel Modal (/admin) */}
      {adminPanelOpen && (
        <AdminPanel 
          onClose={handleCloseAdmin}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onUpdateRooms={(newRooms) => setRooms(newRooms)}
          onUpdateSectionMedia={(newSectionMedia) => setSectionMedia(newSectionMedia)}
        />
      )}

    </div>
  );
}

