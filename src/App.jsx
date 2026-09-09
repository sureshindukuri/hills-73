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

import { 
  getStoredRooms, 
  getSiteSettings, 
  getAllSectionMedia,
  syncFromCloudToLocal 
} from './utils/storage';
import { subscribeToCloudUpdates } from './utils/cloudSync';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Dark / Light Mode Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('73hills_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [rooms, setRooms] = useState(getStoredRooms());
  const [settings, setSettings] = useState(getSiteSettings());
  const [sectionMedia, setSectionMedia] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('73hills_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // 1. Initial local load
    const loadInitialLocal = async () => {
      try {
        const mediaMap = await getAllSectionMedia();
        setSectionMedia(mediaMap);
      } catch (e) {
        console.warn('Failed to load local section media:', e);
      }
    };
    loadInitialLocal();

    // 2. Fetch live state from Cloud to sync all devices
    const syncCloud = async () => {
      try {
        const cloudState = await syncFromCloudToLocal();
        if (cloudState) {
          if (cloudState.settings) setSettings(cloudState.settings);
          if (cloudState.rooms) setRooms(cloudState.rooms);
          if (cloudState.sectionMedia) {
            const freshMedia = await getAllSectionMedia();
            setSectionMedia(freshMedia);
          }
        }
      } catch (e) {
        console.warn('Cloud sync error:', e);
      }
    };
    syncCloud();

    // 3. Subscribe to real-time broadcasts
    const unsubscribe = subscribeToCloudUpdates((newState) => {
      if (newState.settings) setSettings(newState.settings);
      if (newState.rooms) setRooms(newState.rooms);
      if (newState.sectionMedia) setSectionMedia(newState.sectionMedia);
    });

    // 4. Periodic background sync for active visitor devices (every 12 seconds)
    const syncInterval = setInterval(syncCloud, 12000);

    const checkAdminRoute = () => {
      const isRoute = window.location.pathname.toLowerCase().includes('/admin') || 
                      window.location.hash.toLowerCase().includes('admin');
      setAdminPanelOpen(isRoute);
    };

    checkAdminRoute();

    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('focus', syncCloud);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('focus', syncCloud);
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
        theme={theme}
        onToggleTheme={toggleTheme}
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
        theme={theme}
        onToggleTheme={toggleTheme}
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

