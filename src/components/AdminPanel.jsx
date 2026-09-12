import React, { useState, useEffect } from 'react';
import { 
  Shield, Upload, Trash2, Edit3, Plus, Check, Lock, LogOut, 
  Video, Home, Calendar, RefreshCw,
  Sparkles, Heart, Phone, RotateCcw, Layers,
  TrendingUp, Users, Clock, BarChart3,
  Search, MessageSquare, AlertTriangle, UserCheck
} from 'lucide-react';
import { 
  saveMediaItem, getAllGalleryItems, deleteMediaItem,
  saveSectionMedia, getAllSectionMedia, deleteSectionMedia,
  getStoredRooms, saveStoredRooms, DEFAULT_ROOMS,
  getStoredBookings, saveStoredBookings, clearStoredBookings,
  getSiteSettings, saveSiteSettings, syncFromCloudToLocal
} from '../utils/storage';
import { signInWithEmailPass, logOutAdmin, onAdminAuthStateChanged, isEmailAuthorized } from '../firebase/authService';
import { saveEntireLiveStateToFirebase } from '../firebase/firestoreSync';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';
import { getEmbedUrl } from './AboutSection';

export default function AdminPanel({ 
  onClose, 
  onUpdateSettings, 
  onUpdateRooms, 
  onUpdateSectionMedia,
  onUpdateGallery,
  initialTab = 'dashboard' 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState(initialTab); 
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  const [sectionMedia, setSectionMedia] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState({});

  const [actionFeedback, setActionFeedback] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [logoFile, setLogoFile] = useState(null);
  const [brandName, setBrandName] = useState('73 HILLS');
  const [brandSubtitle, setBrandSubtitle] = useState('RESORT & REAL ESTATE');

  const [heroFile, setHeroFile] = useState(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [aboutFile, setAboutFile] = useState(null);
  const [aboutVideoUrlInput, setAboutVideoUrlInput] = useState('');
  const [aboutHeadline, setAboutHeadline] = useState('');
  const [aboutParagraph, setAboutParagraph] = useState('');

  const [celebrationFile, setCelebrationFile] = useState(null);
  const [celebrationHeadline, setCelebrationHeadline] = useState('');
  const [celebrationParagraph, setCelebrationParagraph] = useState('');

  const [editingRoom, setEditingRoom] = useState(null);
  const [roomPhotoFile, setRoomPhotoFile] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    subtitle: '',
    price: 4999,
    baseGuests: 2,
    extraGuestPrice: 800,
    maxGuests: 6,
    rating: 4.9,
    capacity: '2 - 6 Guests',
    size: '1,000 sq.ft',
    image: '/assets/hero_resort_villa.png',
    features: ['Sandalwood Forest View', 'King Bed', 'Private Deck'],
    description: ''
  });

  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('Cottages');

  // Policy & Receipt Settings
  const [checkInTime, setCheckInTime] = useState('02:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('11:00 AM');
  const [gstin, setGstin] = useState('37AAACH7373H1Z2');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [houseRules, setHouseRules] = useState([]);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [receiptFooterNote, setReceiptFooterNote] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('73hills_admin_auth');
    const email = (sessionStorage.getItem('73hills_admin_email') || '').toLowerCase().trim();
    if (authStatus === 'true' && isEmailAuthorized(email)) {
      setIsAuthenticated(true);
      setAdminUser({
        email: email,
        displayName: sessionStorage.getItem('73hills_admin_name') || 'Owner',
        photoURL: sessionStorage.getItem('73hills_admin_photo') || ''
      });
      loadAllAdminData();
    } else {
      sessionStorage.clear();
      setIsAuthenticated(false);
      setAdminUser(null);
    }

    const unsubscribe = onAdminAuthStateChanged((user) => {
      if (user && isEmailAuthorized(user.email)) {
        setIsAuthenticated(true);
        setAdminUser(user);
        loadAllAdminData();
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (text, type = 'success') => {
    setActionFeedback({ text, type });
    setTimeout(() => setActionFeedback({ text: '', type: '' }), 4500);
  };

  const handleEmailPassLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const { user, isAuthorized, error } = await signInWithEmailPass(loginEmail, loginPassword);
      if (isAuthorized && user) {
        setIsAuthenticated(true);
        setAdminUser(user);
        loadAllAdminData();
        showNotification(`Welcome back, ${user.email}!`);
      } else {
        setAuthError(error || 'Access Denied: Only users registered in Firebase Authentication have access.');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logOutAdmin();
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const loadAllAdminData = async () => {
    try {
      await syncFromCloudToLocal();

      const sMedia = await getAllSectionMedia();
      setSectionMedia(sMedia);
      const gItems = await getAllGalleryItems();
      setGalleryItems(gItems);
      const rList = getStoredRooms();
      setRooms(rList);
      const bList = getStoredBookings();
      setBookings(bList);
      const st = getSiteSettings();
      setSettings(st);

      setBrandName(st.brandName || '73 HILLS');
      setBrandSubtitle(st.brandSubtitle || 'RESORT & REAL ESTATE');
      setHeroTitle(st.heroTitle || '');
      setHeroSubtitle(st.heroSubtitle || '');
      setAboutHeadline(st.aboutHeadline || '');
      setAboutParagraph(st.aboutParagraph || '');
      setCelebrationHeadline(st.celebrationHeadline || '');
      setCelebrationParagraph(st.celebrationParagraph || '');

      setCheckInTime(st.checkInTime || '02:00 PM');
      setCheckOutTime(st.checkOutTime || '11:00 AM');
      setGstin(st.gstin || '37AAACH7373H1Z2');
      setCancellationPolicy(st.cancellationPolicy || '');
      setPrivacyPolicy(st.privacyPolicy || '');
      setHouseRules(st.houseRules || []);
      setReceiptFooterNote(st.receiptFooterNote || '');
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  // ==========================================
  // SINGLE MASTER SAVE & PUBLISH FUNCTION
  // ==========================================
  const handleSaveAllToMainPage = async () => {
    setIsProcessing(true);
    setActionFeedback({ text: '💾 Saving & publishing all changes to main page worldwide...', type: 'info' });
    try {
      let currentSectionMedia = { ...sectionMedia };

      // 1. Process pending About Video / Link / Media
      if (aboutVideoUrlInput && aboutVideoUrlInput.trim()) {
        const savedAbout = await saveSectionMedia('about', aboutVideoUrlInput.trim(), {
          title: 'Custom Resort Tour Video Link',
          mediaType: 'video'
        });
        currentSectionMedia.about = savedAbout;
        setAboutVideoUrlInput('');
      } else if (aboutFile) {
        const savedAbout = await saveSectionMedia('about', aboutFile, {
          mediaType: 'video',
          title: aboutFile.name
        });
        currentSectionMedia.about = savedAbout;
        setAboutFile(null);
        const fileInp = document.getElementById('about-file-input');
        if (fileInp) fileInp.value = '';
      }

      // 2. Process pending Hero Media
      if (heroFile) {
        const savedHero = await saveSectionMedia('hero', heroFile, {});
        currentSectionMedia.hero = savedHero;
        setHeroFile(null);
        const fileInp = document.getElementById('hero-file-input');
        if (fileInp) fileInp.value = '';
      }

      // 3. Process pending Celebration Media
      if (celebrationFile) {
        const savedCeleb = await saveSectionMedia('celebrations', celebrationFile, {});
        currentSectionMedia.celebrations = savedCeleb;
        setCelebrationFile(null);
        const fileInp = document.getElementById('celebration-file-input');
        if (fileInp) fileInp.value = '';
      }

      // 4. Process pending Logo
      if (logoFile) {
        const savedLogo = await saveSectionMedia('logo', logoFile, {});
        currentSectionMedia.logo = savedLogo;
        setLogoFile(null);
        const fileInp = document.getElementById('logo-file-input');
        if (fileInp) fileInp.value = '';
      }

      // 5. Process pending Gallery file
      if (galleryFile) {
        await saveMediaItem({
          title: galleryTitle || galleryFile.name.split('.')[0],
          category: galleryCategory
        }, galleryFile);
        setGalleryFile(null);
        setGalleryTitle('');
        const fileInp = document.getElementById('gallery-file-input');
        if (fileInp) fileInp.value = '';
      }

      // 6. Process pending Room form if name is filled
      let currentRooms = [...rooms];
      if (roomFormData.name && roomFormData.name.trim()) {
        let imageUrl = roomFormData.image || '/assets/hero_resort_villa.png';
        if (roomPhotoFile) {
          const roomId = editingRoom ? editingRoom.id : 'room-' + Date.now();
          const savedMedia = await saveSectionMedia(`room-${roomId}`, roomPhotoFile, {});
          imageUrl = savedMedia.url || savedMedia.fileName || imageUrl;
        }

        if (editingRoom) {
          currentRooms = currentRooms.map(r => r.id === editingRoom.id ? { ...roomFormData, id: editingRoom.id, image: imageUrl } : r);
        } else {
          currentRooms.push({ ...roomFormData, id: 'room-' + Date.now(), image: imageUrl });
        }
        setRooms(currentRooms);
        setEditingRoom(null);
        setRoomPhotoFile(null);
        setRoomFormData({
          name: '',
          subtitle: '',
          price: 4999,
          baseGuests: 2,
          extraGuestPrice: 800,
          maxGuests: 6,
          rating: 4.9,
          capacity: '2 - 6 Guests',
          size: '1,000 sq.ft',
          image: '/assets/hero_resort_villa.png',
          features: ['Sandalwood Forest View', 'King Bed', 'Private Deck'],
          description: ''
        });
      }

      setSectionMedia(currentSectionMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(currentSectionMedia);

      // 7. Compile updated Settings
      const currentSettings = {
        ...settings,
        brandName,
        brandSubtitle,
        heroTitle,
        heroSubtitle,
        aboutHeadline,
        aboutParagraph,
        celebrationHeadline,
        celebrationParagraph,
        checkInTime,
        checkOutTime,
        gstin,
        cancellationPolicy,
        privacyPolicy,
        houseRules,
        receiptFooterNote
      };

      setSettings(currentSettings);
      saveSiteSettings(currentSettings);
      if (onUpdateSettings) onUpdateSettings(currentSettings);

      saveStoredRooms(currentRooms);
      if (onUpdateRooms) onUpdateRooms(currentRooms);

      const allGallery = await getAllGalleryItems();
      setGalleryItems(allGallery);
      if (onUpdateGallery) onUpdateGallery(allGallery);

      // 8. Atomically push entire state to Firebase Firestore live_state
      await saveEntireLiveStateToFirebase({
        settings: currentSettings,
        rooms: currentRooms,
        sectionMedia: currentSectionMedia,
        gallery: allGallery,
        bookings: bookings
      });

      showNotification('✓ 100% SAVED! All changes are now live and visible on the main page for all visitors.');
    } catch (err) {
      console.error('Save error:', err);
      showNotification(`Save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick direct actions that also sync
  const handleQuickPriceChange = async (roomId, newPrice, extraGuestPrice) => {
    const updated = rooms.map(r => {
      if (r.id === roomId) {
        return { 
          ...r, 
          price: Number(newPrice),
          extraGuestPrice: extraGuestPrice !== undefined ? Number(extraGuestPrice) : r.extraGuestPrice
        };
      }
      return r;
    });
    setRooms(updated);
    saveStoredRooms(updated);
    if (onUpdateRooms) onUpdateRooms(updated);
    try {
      await saveEntireLiveStateToFirebase({
        settings,
        rooms: updated,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });
      showNotification(`✓ Price updated to ₹${Number(newPrice).toLocaleString('en-IN')} (Live worldwide)`);
    } catch (err) {
      showNotification(`Price updated locally.`);
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Reset to default 73 Hills Sandalwood Tree logo icon?')) {
      setIsProcessing(true);
      try {
        await deleteSectionMedia('logo');
        const updatedMedia = { ...sectionMedia };
        delete updatedMedia.logo;
        setSectionMedia(updatedMedia);
        if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia: updatedMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('Logo reset to default.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleResetHeroMedia = async () => {
    if (window.confirm('Reset Hero background to default?')) {
      setIsProcessing(true);
      try {
        await deleteSectionMedia('hero');
        const updatedMedia = { ...sectionMedia };
        delete updatedMedia.hero;
        setSectionMedia(updatedMedia);
        if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia: updatedMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('Hero media reset to default.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleResetAboutMedia = async () => {
    if (window.confirm('Reset About video showcase to default?')) {
      setIsProcessing(true);
      try {
        await deleteSectionMedia('about');
        const updatedMedia = { ...sectionMedia };
        delete updatedMedia.about;
        setSectionMedia(updatedMedia);
        if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia: updatedMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('About video reset to default.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleResetCelebrationMedia = async () => {
    if (window.confirm('Reset Celebration showcase to default?')) {
      setIsProcessing(true);
      try {
        await deleteSectionMedia('celebrations');
        const updatedMedia = { ...sectionMedia };
        delete updatedMedia.celebrations;
        setSectionMedia(updatedMedia);
        if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia: updatedMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('Celebrations media reset to default.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to remove this cottage / suite?')) {
      setIsProcessing(true);
      try {
        const updated = rooms.filter(r => r.id !== id);
        setRooms(updated);
        saveStoredRooms(updated);
        if (onUpdateRooms) onUpdateRooms(updated);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms: updated,
          sectionMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('Room removed and updated live.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleResetDefaultRooms = async () => {
    if (window.confirm('Reset all rooms to default 73 Hills suites & prices?')) {
      setIsProcessing(true);
      try {
        setRooms(DEFAULT_ROOMS);
        saveStoredRooms(DEFAULT_ROOMS);
        if (onUpdateRooms) onUpdateRooms(DEFAULT_ROOMS);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms: DEFAULT_ROOMS,
          sectionMedia,
          gallery: galleryItems,
          bookings
        });

        showNotification('Rooms reset to defaults.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteGalleryMedia = async (id, isDefault) => {
    if (isDefault) {
      alert('Default sample item cannot be deleted.');
      return;
    }
    if (window.confirm('Delete this media file from Gallery?')) {
      setIsProcessing(true);
      try {
        await deleteMediaItem(id);
        const updatedItems = await getAllGalleryItems();
        setGalleryItems(updatedItems);
        if (onUpdateGallery) onUpdateGallery(updatedItems);

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia,
          gallery: updatedItems,
          bookings
        });

        showNotification('Media item deleted from Gallery.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBookingStatus = async (id, newStatus) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        return { 
          ...b, 
          status: newStatus,
          paymentStatus: newStatus === 'Confirmed' ? 'Paid' : newStatus === 'Cancelled' ? 'Refunded / Void' : b.paymentStatus
        };
      }
      return b;
    });
    setBookings(updated);
    saveStoredBookings(updated);
    try {
      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings: updated
      });
      showNotification(`Booking ${id} status set to ${newStatus}`);
    } catch (e) {
      showNotification(`Booking status updated.`);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm(`Delete booking record ${id}?`)) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      saveStoredBookings(updated);
      try {
        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia,
          gallery: galleryItems,
          bookings: updated
        });
        showNotification(`Booking ${id} removed.`);
      } catch (e) {
        showNotification(`Booking ${id} removed.`);
      }
    }
  };

  const handleClearAllBookings = async () => {
    if (window.confirm('Clear all booking records and reset dashboard analytics to zero? Real user bookings will start fresh.')) {
      clearStoredBookings();
      setBookings([]);
      try {
        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia,
          gallery: galleryItems,
          bookings: []
        });
        showNotification('All booking history cleared. Dashboard analytics reset to 0.');
      } catch (e) {
        showNotification('All booking history cleared.');
      }
    }
  };

  const handleAddHouseRule = (e) => {
    if (e) e.preventDefault();
    if (!newRuleInput.trim()) return;
    const updated = [...houseRules, newRuleInput.trim()];
    setHouseRules(updated);
    setNewRuleInput('');
    showNotification('Rule added! Remember to click the SAVE button to publish.');
  };

  const handleDeleteHouseRule = (idx) => {
    const updated = houseRules.filter((_, i) => i !== idx);
    setHouseRules(updated);
    showNotification('Rule removed.');
  };

  // Analytics derivations
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  
  const totalGuestsCount = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (Number(b.guests) || 1), 0);

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const pendingRevenue = bookings
    .filter(b => b.status === 'Pending')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const monthlyData = {};
  bookings.forEach(b => {
    const monthKey = b.createdAt ? b.createdAt.substring(0, 7) : '2026-09';
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, revenue: 0, confirmed: 0, guests: 0 };
    }
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].guests += Number(b.guests) || 1;
    if (b.status === 'Confirmed') {
      monthlyData[monthKey].confirmed += 1;
      monthlyData[monthKey].revenue += Number(b.totalAmount) || 0;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const maxMonthRevenue = Math.max(...Object.values(monthlyData).map(m => m.revenue), 1);

  if (!isAuthenticated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '460px', width: '95%', padding: 'clamp(28px, 5vw, 44px)', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-cream)',
            border: '1px solid var(--border-light)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(179, 139, 89, 0.15)'
          }}>
            <Shield size={30} color="#B38B59" />
          </div>

          <span className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block', fontSize: '0.675rem', letterSpacing: '0.08em' }}>
            OWNER & EXECUTIVE PORTAL
          </span>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginBottom: '8px', color: 'var(--text-main)' }}>
            73 Hills Control Panel
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Secure Real-Time Management of Resort Bookings, Video Showcase, Room Tariffs & Website Content.
          </p>

          {authError && (
            <div style={{ 
              backgroundColor: 'rgba(217, 83, 79, 0.12)', 
              border: '1px solid rgba(217, 83, 79, 0.4)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '12px 14px', 
              color: '#D9534F', 
              fontSize: '0.825rem', 
              marginBottom: '20px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Authentication Error</strong>
                {authError}
              </div>
            </div>
          )}

          <form onSubmit={handleEmailPassLogin} style={{ textAlign: 'left', marginBottom: '16px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
                Firebase Admin Email
              </label>
              <input 
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="owner@hills73.com"
                className="form-input"
                style={{ marginBottom: 0, padding: '10px 12px', fontSize: '0.875rem' }}
                disabled={isAuthenticating}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
                Password
              </label>
              <input 
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ marginBottom: 0, padding: '10px 12px', fontSize: '0.875rem' }}
                disabled={isAuthenticating}
              />
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="btn-gold"
              style={{ 
                width: '100%', 
                padding: '12px 18px', 
                fontSize: '0.92rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={16} />
              {isAuthenticating ? 'Authenticating with Firebase...' : 'Sign In with Email & Password'}
            </button>
          </form>

          <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1.4 }}>
              🔒 Protected by <strong>Firebase Authentication</strong>. Only the registered owner email created in Firebase Console has access.
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.825rem' }}
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'dashboard', label: '📊 Dashboard & Analytics', icon: <TrendingUp size={16} color="#B38B59" /> },
    { id: 'branding', label: 'Logo & Branding', icon: <Sparkles size={16} color="#B38B59" /> },
    { id: 'hero', label: 'Hero Background', icon: <Video size={16} color="#B38B59" /> },
    { id: 'about', label: 'About Section & Video', icon: <Layers size={16} color="#B38B59" /> },
    { id: 'rooms', label: 'Stay & Rooms Prices', icon: <Home size={16} color="#B38B59" /> },
    { id: 'celebrations', label: 'Celebrations', icon: <Heart size={16} color="#B38B59" /> },
    { id: 'gallery', label: 'Gallery Media', icon: <Upload size={16} color="#B38B59" /> },
    { id: 'bookings', label: 'Guest Bookings Ledger', icon: <Calendar size={16} color="#B38B59" /> },
    { id: 'policies', label: '📜 Rules & Policies', icon: <Lock size={16} color="#B38B59" /> },
    { id: 'contact', label: 'Contact & Info', icon: <Phone size={16} color="#B38B59" /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1240px', width: '96%', maxHeight: '94vh', padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        
        {/* TOP HEADER WITH PROMINENT SINGLE MASTER SAVE BUTTON */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--bg-forest)',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
            <Shield size={24} color="#B38B59" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#FFFFFF', lineHeight: 1 }}>
                73 Hills Executive Manager
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Real-Time Bookings, Analytics, Pricing & Media Portal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* THE ONE AND ONLY MASTER SAVE BUTTON */}
            <button 
              onClick={handleSaveAllToMainPage}
              disabled={isProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#28A745',
                color: '#FFFFFF',
                border: '1px solid #1E7E34',
                cursor: isProcessing ? 'wait' : 'pointer',
                fontSize: '0.88rem',
                fontWeight: '800',
                letterSpacing: '0.02em',
                boxShadow: '0 3px 12px rgba(40,167,69,0.5)',
                transition: 'all 0.2s ease',
                animation: isProcessing ? 'pulse 1.5s infinite' : 'none'
              }}
              title="Save all changes and publish immediately to main website worldwide"
            >
              <Check size={18} /> {isProcessing ? 'SAVING TO MAIN PAGE...' : '🚀 SAVE ALL CHANGES TO MAIN PAGE'}
            </button>

            <button 
              onClick={loadAllAdminData}
              disabled={isProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
              title="Sync all changes with cloud database"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button 
              onClick={handleClearAllBookings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(217, 83, 79, 0.2)',
                color: '#FFA8A8',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
              title="Reset all bookings and analytics to 0"
            >
              <Trash2 size={14} /> Clear Ledger
            </button>

            {adminUser && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <UserCheck size={14} color="#75E096" />
                <span style={{ fontSize: '0.74rem', color: '#FFFFFF', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser.email || 'Owner'}
                </span>
              </div>
            )}

            <button 
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(217, 83, 79, 0.25)',
                color: '#FFA8A8',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>

            <button 
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-gold)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '700'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Action feedback bar */}
        {actionFeedback.text && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: actionFeedback.type === 'error' ? '#F8D7DA' : actionFeedback.type === 'info' ? '#D1ECF1' : '#D4EDDA',
            color: actionFeedback.type === 'error' ? '#721C24' : actionFeedback.type === 'info' ? '#0C5460' : '#155724',
            fontSize: '0.88rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            {actionFeedback.type === 'error' ? '❌' : actionFeedback.type === 'info' ? 'ℹ️' : '✓'} {actionFeedback.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div 
          className="no-scrollbar"
          style={{
            display: 'flex',
            overflowX: 'auto',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 12px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--color-gold)' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? 'var(--color-emerald)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.825rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div style={{ padding: 'clamp(16px, 3vw, 24px)', minHeight: '440px', flex: '1 1 auto', overflowY: 'auto' }}>
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span className="badge-gold">EXECUTIVE OVERVIEW</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
                    Resort Booking & Revenue Analytics
                  </h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Live Cloud Sync: <strong>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-forest)',
                  color: '#FFFFFF',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CONFIRMED REVENUE
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: '#B38B59', marginTop: '6px' }}>
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    From {confirmedBookingsCount} Paid Bookings
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      TOTAL BOOKINGS
                    </span>
                    <Calendar size={18} color="#B38B59" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: 'var(--color-emerald)', marginTop: '6px' }}>
                    {totalBookingsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#28A745', marginTop: '4px', fontWeight: '600' }}>
                    ● {confirmedBookingsCount} Confirmed & Paid
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      TOTAL GUESTS BOOKED
                    </span>
                    <Users size={18} color="#B38B59" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: 'var(--color-emerald)', marginTop: '6px' }}>
                    {totalGuestsCount} Guests
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Avg {totalBookingsCount > 0 ? (totalGuestsCount / totalBookingsCount).toFixed(1) : 0} guests per stay
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setBookingFilter('pending');
                    setActiveTab('bookings');
                  }}
                  style={{
                    backgroundColor: '#FFF9E6',
                    border: '2px solid #FFE08A',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    position: 'relative'
                  }}
                  title="Click to view all pending accounts"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#856404', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                      🟡 PENDING ACCOUNTS
                    </span>
                    <Clock size={18} color="#856404" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: '#856404', marginTop: '6px' }}>
                    {pendingBookingsCount} Leads
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#856404', marginTop: '4px', fontWeight: '600' }}>
                    ₹{pendingRevenue.toLocaleString('en-IN')} awaiting payment →
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      COTTAGES & VILLAS
                    </span>
                    <Home size={18} color="#B38B59" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '700', color: 'var(--color-emerald)', marginTop: '6px' }}>
                    {rooms.length} Suites
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Rates from ₹{Math.min(...rooms.map(r => r.price || 4999)).toLocaleString('en-IN')}/N
                  </div>
                </div>
              </div>

              {/* PENDING LEADS */}
              {pendingBookingsCount > 0 && (
                <div style={{
                  backgroundColor: '#FFFDF5',
                  border: '2px solid #FFE08A',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  marginBottom: '28px',
                  boxShadow: '0 4px 12px rgba(133, 100, 4, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ backgroundColor: '#FFE08A', color: '#856404', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800' }}>
                        ACTION REQUIRED
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#856404', margin: 0 }}>
                        🟡 Pending Accounts ({pendingBookingsCount} Users Saved Details)
                      </h4>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#FFF3CD', borderBottom: '2px solid #FFE08A' }}>
                          <th style={{ padding: '10px', color: '#856404' }}>Ref ID</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Guest Name & Contact</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Cottage Selected</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Dates & Guests</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Amount</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.filter(b => b.status === 'Pending').map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #FFEBAA', backgroundColor: '#FFFFFF' }}>
                            <td style={{ padding: '10px', fontWeight: '700', color: '#856404' }}>{b.id}</td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>{b.guestName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {b.phone}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✉️ {b.email}</div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '600' }}>{b.roomName}</td>
                            <td style={{ padding: '10px' }}>
                              <div>{b.checkIn} to {b.checkOut}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.guests} Guests</div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '700', color: '#856404' }}>
                              ₹{b.totalAmount?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button 
                                  onClick={() => handleBookingStatus(b.id, 'Confirmed')}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: '#28A745',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Check size={12} /> Confirm & Mark Paid
                                </button>
                                {b.phone && (
                                  <a 
                                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.guestName)},%20greetings%20from%2073%20Hills%20Resort!%20We%20noticed%20you%20started%20reserving%20the%20${encodeURIComponent(b.roomName)}.%20Would%20you%20like%20assistance%20completing%20your%20booking?`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: '#25D366',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      textDecoration: 'none',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <MessageSquare size={12} /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MONTHLY CHART & QUICK PRICING */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
                marginBottom: '28px'
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                    <BarChart3 size={20} color="#B38B59" />
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)' }}>
                      Monthly Booking & Revenue Trend
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sortedMonths.length === 0 ? (
                      <div style={{ padding: '28px 12px', textAlign: 'center', backgroundColor: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-emerald)', marginBottom: '4px', fontSize: '0.9rem' }}>
                          No Bookings Recorded Yet
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          As real visitors book on the website, monthly analytics and revenue charts will update automatically.
                        </span>
                      </div>
                    ) : (
                      sortedMonths.map(month => {
                        const data = monthlyData[month];
                        const pct = Math.round((data.revenue / maxMonthRevenue) * 100);
                        const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                        return (
                          <div key={month}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span><strong>{monthLabel}</strong> ({data.count} Bookings • {data.guests} Guests)</span>
                              <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>₹{data.revenue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: '10px', backgroundColor: '#F0EBE1', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#B38B59', borderRadius: '5px' }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)' }}>
                        Quick Room Price & Guest Rates
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Instant live pricing updates
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('rooms')}
                      style={{ fontSize: '0.75rem', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Manage All →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rooms.map(room => (
                      <div key={room.id} style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--color-emerald)' }}>{room.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base: {room.baseGuests || 2} Guests</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Base Price (₹)</label>
                            <input 
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '0.85rem', marginBottom: 0 }}
                              defaultValue={room.price}
                              onBlur={(e) => handleQuickPriceChange(room.id, e.target.value, room.extraGuestPrice)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Extra Guest (₹)</label>
                            <input 
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '0.85rem', marginBottom: 0 }}
                              defaultValue={room.extraGuestPrice || 800}
                              onBlur={(e) => handleQuickPriceChange(room.id, room.price, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Resort Logo & Brand Identity
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Select a custom logo image from your device and edit brand titles. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button above or below to publish live to the main website.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '28px'
              }}>
                <div style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <span className="badge-gold" style={{ marginBottom: '16px', display: 'inline-block' }}>
                    CURRENT ACTIVE LOGO
                  </span>
                  <div style={{
                    height: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    {sectionMedia.logo ? (
                      <img 
                        src={sectionMedia.logo.url} 
                        alt="Custom Logo" 
                        style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SandalwoodTreeLogo size={48} color="#B38B59" />
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-emerald)' }}>
                          73 HILLS
                        </span>
                      </div>
                    )}
                  </div>

                  {sectionMedia.logo && (
                    <button
                      onClick={handleDeleteLogo}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FFF',
                        color: '#FF6B6B',
                        border: '1px solid #FF6B6B',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <Trash2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Reset to Default Logo
                    </button>
                  )}
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: '#FFFFFF',
                  border: '2px dashed var(--color-gold)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-emerald)' }}>
                    Attach New Logo File From Device
                  </h5>

                  <div className="form-group">
                    <label className="form-label">Select Image File (PNG, JPG, SVG, WebP)</label>
                    <input 
                      id="logo-file-input"
                      type="file" 
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                    />
                  </div>

                  {logoFile && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#D4EDDA', borderRadius: '4px', border: '1px solid #C3E6CB', color: '#155724', fontSize: '0.82rem', fontWeight: '600' }}>
                      ✓ File Attached: {logoFile.name} — Will be saved when you click <strong>Save All Changes</strong>.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Brand Title & Subtitle
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Brand Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={brandName} 
                      onChange={(e) => setBrandName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Brand Subtitle</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={brandSubtitle} 
                      onChange={(e) => setBrandSubtitle(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERO BACKGROUND */}
          {activeTab === 'hero' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Hero Background Media & Headline
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Choose a background photo/video and customize the main hero headline. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button to publish live.
              </p>

              <div style={{ marginBottom: '28px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#0D2116' }}>
                <div style={{ height: '220px', position: 'relative' }}>
                  {sectionMedia.hero?.mediaType === 'video' ? (
                    <video 
                      key={sectionMedia.hero?.url || 'default-hero-video'}
                      src={sectionMedia.hero.url} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      preload="auto"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                  ) : (
                    <img 
                      src={sectionMedia.hero ? sectionMedia.hero.url : '/assets/hero_resort_villa.png'} 
                      alt="Hero View" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  <span className="badge-gold" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {sectionMedia.hero ? `Custom Upload (${(sectionMedia.hero.mediaType || 'media').toUpperCase()})` : 'Default Resort Villa Image'}
                  </span>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#132E1F', color: '#FFF' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    {sectionMedia.hero ? `Active File: ${sectionMedia.hero.fileName}` : 'Default Wallpaper Asset'}
                  </span>
                  {sectionMedia.hero && (
                    <button onClick={handleResetHeroMedia} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset to Default
                    </button>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-gold)', marginBottom: '28px' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-emerald)' }}>
                  Attach New Hero Photo or Video From Device
                </h5>
                <div className="form-group">
                  <label className="form-label">Select Device File (MP4, WebM, PNG, JPG, WebP)</label>
                  <input 
                    id="hero-file-input"
                    type="file" 
                    accept="image/*,video/*"
                    className="form-input" 
                    onChange={(e) => setHeroFile(e.target.files[0])} 
                  />
                </div>

                {heroFile && (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Attached: {heroFile.name} ({(heroFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <span style={{ color: '#28A745', fontWeight: '600' }}>✓ Ready to save</span>
                    </div>
                    {heroFile.type.startsWith('video/') ? (
                      <div style={{ maxHeight: '180px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
                        <video 
                          key={heroFile.name}
                          src={URL.createObjectURL(heroFile)} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                        />
                      </div>
                    ) : (
                      <img 
                        src={URL.createObjectURL(heroFile)} 
                        alt="Selected Preview" 
                        style={{ maxHeight: '160px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Hero Headline & Description Text
                </h5>
                <div className="form-group">
                  <label className="form-label">Hero Title</label>
                  <input type="text" className="form-input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hero Subtitle Paragraph</label>
                  <textarea rows={3} className="form-textarea" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT SECTION & VIDEO */}
          {activeTab === 'about' && (
            <div style={{ maxWidth: '840px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '4px' }}>
                    About Section Resort Video & Story
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Choose a photo or video directly from your device gallery or files. Click <strong>🚀 SAVE ALL CHANGES</strong> to publish live.
                  </p>
                </div>
              </div>

              {/* Current Active Video Card */}
              <div style={{ marginBottom: '28px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#0D2116', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <div style={{ height: '280px', position: 'relative' }}>
                  {(() => {
                    const activeUrl = aboutFile ? URL.createObjectURL(aboutFile) : (sectionMedia.about?.customVideoUrl || sectionMedia.about?.customUrl || sectionMedia.about?.url || '');
                    const embed = getEmbedUrl(activeUrl);

                    if (embed) {
                      return (
                        <iframe 
                          src={embed} 
                          title="About Video Preview" 
                          style={{ width: '100%', height: '100%', border: 'none' }} 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      );
                    }

                    const videoSrc = (typeof activeUrl === 'string' && (activeUrl.startsWith('http://') || activeUrl.startsWith('https://') || activeUrl.startsWith('data:') || activeUrl.startsWith('blob:') || activeUrl.startsWith('/')))
                      ? activeUrl
                      : 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-in-the-forest-42407-large.mp4';

                    return (
                      <video 
                        key={videoSrc}
                        src={videoSrc} 
                        controls 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        preload="auto"
                        onError={(e) => {
                          e.target.src = 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-in-the-forest-42407-large.mp4';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    );
                  })()}
                  
                  <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      backgroundColor: (aboutFile || sectionMedia.about) ? '#1B4D3E' : '#132E1F',
                      color: '#FFFFFF',
                      border: '1px solid var(--color-gold)',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4EBA6F', boxShadow: '0 0 6px #4EBA6F' }} />
                      {aboutFile ? 'NEW FILE SELECTED (READY TO SAVE)' : sectionMedia.about ? 'ACTIVE ON MAIN PAGE' : 'DEFAULT SHOWCASE'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', backgroundColor: '#132E1F', color: '#FFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFF' }}>
                        {aboutFile ? `📁 Selected File: ${aboutFile.name}` : sectionMedia.about?.fileName || '73 Hills Resort Aerial Showcase'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '3px' }}>
                        {aboutFile ? `${(aboutFile.size / (1024 * 1024)).toFixed(2)} MB — Click Save to publish` : 'Live on public website'}
                      </div>
                    </div>
                    {sectionMedia.about && (
                      <button onClick={handleResetAboutMedia} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                        <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset to Default
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload from Device Gallery or Files */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-gold)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-emerald)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} color="var(--color-gold)" /> Upload From Device Gallery or Files
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Tap below to choose any video (MP4, MOV, WebM) or photo from your phone's gallery, camera roll, or file browser:
                </p>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: '700', color: 'var(--color-emerald)', fontSize: '0.9rem' }}>
                    Select Video or Photo File
                  </label>
                  <input 
                    id="about-file-input"
                    type="file" 
                    accept="video/*,image/*" 
                    className="form-input" 
                    style={{ padding: '12px', fontSize: '0.9rem', cursor: 'pointer' }}
                    onChange={(e) => {
                      const selected = e.target.files[0];
                      if (selected) {
                        setAboutFile(selected);
                        setAboutVideoUrlInput('');
                      }
                    }} 
                  />
                </div>

                {aboutFile && (
                  <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#F0F9F4', borderRadius: 'var(--radius-sm)', border: '1px solid #C3E6CB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#155724' }}>
                        ✓ Selected: {aboutFile.name} ({(aboutFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <div style={{ maxHeight: '180px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '12px' }}>
                      <video 
                        key={aboutFile.name}
                        src={URL.createObjectURL(aboutFile)} 
                        controls 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          const saved = await saveSectionMedia('about', aboutFile, {
                            mediaType: 'video',
                            title: aboutFile.name
                          });
                          const updated = { ...sectionMedia, about: saved };
                          setSectionMedia(updated);
                          if (onUpdateSectionMedia) onUpdateSectionMedia(updated);

                          // Atomically save to Firebase live_state so all users see it immediately
                          await saveEntireLiveStateToFirebase({
                            settings,
                            rooms,
                            sectionMedia: updated,
                            gallery: galleryItems,
                            bookings
                          });

                          setAboutFile(null);
                          const fileInp = document.getElementById('about-file-input');
                          if (fileInp) fileInp.value = '';
                          showNotification('✓ Video uploaded and published live to main website!');
                        } catch (e) {
                          console.error('Failed to upload video:', e);
                          showNotification('Failed to upload video: ' + e.message, 'error');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      className="btn-gold"
                      style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: '700' }}
                    >
                      <Upload size={16} /> {isProcessing ? 'Saving & Publishing Video...' : '⚡ Save & Publish This Video to Main Page Now'}
                    </button>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  About Headline & Paragraph Content
                </h5>
                <div className="form-group">
                  <label className="form-label">About Headline</label>
                  <input type="text" className="form-input" value={aboutHeadline} onChange={(e) => setAboutHeadline(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">About Story Paragraph</label>
                  <textarea rows={4} className="form-textarea" value={aboutParagraph} onChange={(e) => setAboutParagraph(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STAY & ROOMS */}
          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)' }}>
                    Stay Cottages & Luxury Suites ({rooms.length})
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add cottages, configure nightly rates, upload photos, and manage suite details.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleResetDefaultRooms} className="btn-outline-dark" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    <RotateCcw size={14} /> Reset Defaults
                  </button>
                  <button 
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomFormData({
                        name: '',
                        subtitle: '',
                        price: 4999,
                        baseGuests: 2,
                        extraGuestPrice: 800,
                        maxGuests: 6,
                        rating: 4.9,
                        capacity: '2 - 6 Guests',
                        size: '1,000 sq.ft',
                        image: '/assets/hero_resort_villa.png',
                        features: ['Sandalwood Forest View', 'King Bed', 'Private Deck'],
                        description: ''
                      });
                    }} 
                    className="btn-gold" 
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    <Plus size={16} /> New Cottage Form
                  </button>
                </div>
              </div>

              {/* Room Form */}
              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)', marginBottom: '32px' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '16px', color: 'var(--color-emerald)' }}>
                  {editingRoom ? `Editing Suite: ${editingRoom.name}` : 'Create / Edit Luxury Cottage'}
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Room / Villa Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Red Sandalwood Villa"
                      className="form-input" 
                      value={roomFormData.name} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Subtitle / View Tag</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 73 Acres Forest Facing Luxury Suite"
                      className="form-input" 
                      value={roomFormData.subtitle} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, subtitle: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Base Nightly Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={roomFormData.price} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, price: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Base Guests Included</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={roomFormData.baseGuests || 2} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, baseGuests: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Extra Guest Surcharge / Night (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={roomFormData.extraGuestPrice || 800} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, extraGuestPrice: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="form-label">Capacity String & Size</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2 - 6 Guests, 1,200 sq.ft"
                      className="form-input" 
                      value={roomFormData.capacity} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Attach Room Photo From Device</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-input" 
                    onChange={(e) => setRoomPhotoFile(e.target.files[0])} 
                  />
                  {roomPhotoFile && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--color-emerald)', fontWeight: '600' }}>
                      📁 Attached Photo: {roomPhotoFile.name}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Room Description</label>
                  <textarea 
                    rows={3} 
                    className="form-textarea" 
                    value={roomFormData.description} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    💡 When ready, click the top or bottom <strong>🚀 SAVE ALL CHANGES TO MAIN PAGE</strong> button to make this room live!
                  </span>
                  {editingRoom && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingRoom(null);
                        setRoomFormData({
                          name: '',
                          subtitle: '',
                          price: 4999,
                          baseGuests: 2,
                          extraGuestPrice: 800,
                          maxGuests: 6,
                          rating: 4.9,
                          capacity: '2 - 6 Guests',
                          size: '1,000 sq.ft',
                          image: '/assets/hero_resort_villa.png',
                          features: ['Sandalwood Forest View', 'King Bed', 'Private Deck'],
                          description: ''
                        });
                      }} 
                      className="btn-outline-dark" 
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Room Cards */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {rooms.map(room => (
                  <div key={room.id} style={{ display: 'flex', gap: '20px', padding: '18px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', alignItems: 'center', flexWrap: 'wrap' }}>
                    <img src={room.image} alt={room.name} style={{ width: '130px', height: '95px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    
                    <div style={{ flexGrow: 1, minWidth: '220px' }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-emerald)' }}>{room.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{room.subtitle} — {room.capacity}</p>
                      <div style={{ fontWeight: '700', color: 'var(--color-gold)', marginTop: '4px' }}>
                        ₹{room.price?.toLocaleString('en-IN')} / night <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>(Base {room.baseGuests || 2}G + ₹{room.extraGuestPrice || 800}/extra)</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => {
                          setEditingRoom(room);
                          setRoomFormData({ ...room });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-outline-dark"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      <button 
                        onClick={() => handleDeleteRoom(room.id)}
                        style={{ padding: '8px 14px', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CELEBRATIONS */}
          {activeTab === 'celebrations' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Celebrations & Weddings Section Manager
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Attach celebration photos/videos and edit wedding narrative. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button to publish.
              </p>

              <div style={{ marginBottom: '28px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ height: '220px', position: 'relative' }}>
                  {sectionMedia.celebrations?.mediaType === 'video' ? (
                    <video 
                      key={sectionMedia.celebrations?.url || 'default-celebration-video'}
                      src={sectionMedia.celebrations.url} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      preload="auto"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                  ) : (
                    <img 
                      src={sectionMedia.celebrations ? sectionMedia.celebrations.url : '/assets/celebration_wedding_lawn.png'} 
                      alt="Celebration Showcase" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  <span className="badge-gold" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {sectionMedia.celebrations ? `Custom Media (${(sectionMedia.celebrations.mediaType || 'media').toUpperCase()})` : 'Default Wedding Lawn'}
                  </span>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-cream)' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    {sectionMedia.celebrations ? `Active: ${sectionMedia.celebrations.fileName}` : 'Default Celebration Image'}
                  </span>
                  {sectionMedia.celebrations && (
                    <button onClick={handleResetCelebrationMedia} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset to Default
                    </button>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-gold)', marginBottom: '28px' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-emerald)' }}>
                  Attach Celebration Photo or Video From Device
                </h5>
                <div className="form-group">
                  <label className="form-label">Select Device File (Image or Video)</label>
                  <input 
                    id="celebration-file-input"
                    type="file" 
                    accept="image/*,video/*"
                    className="form-input" 
                    onChange={(e) => setCelebrationFile(e.target.files[0])} 
                  />
                </div>

                {celebrationFile && (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Attached: {celebrationFile.name} ({(celebrationFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <span style={{ color: '#28A745', fontWeight: '600' }}>✓ Ready to save</span>
                    </div>
                    {celebrationFile.type.startsWith('video/') ? (
                      <div style={{ maxHeight: '180px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
                        <video 
                          key={celebrationFile.name}
                          src={URL.createObjectURL(celebrationFile)} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                        />
                      </div>
                    ) : (
                      <img 
                        src={URL.createObjectURL(celebrationFile)} 
                        alt="Selected Preview" 
                        style={{ maxHeight: '160px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Celebrations Headline & Story Content
                </h5>
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input type="text" className="form-input" value={celebrationHeadline} onChange={(e) => setCelebrationHeadline(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Story Paragraph</label>
                  <textarea rows={4} className="form-textarea" value={celebrationParagraph} onChange={(e) => setCelebrationParagraph(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: GALLERY MEDIA */}
          {activeTab === 'gallery' && (
            <div>
              <div style={{
                backgroundColor: 'var(--bg-cream)',
                border: '2px dashed var(--color-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                  Attach Photos or Videos to Gallery
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Select any photo or video file from your computer or phone. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button to publish.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Select Device File (Image or Video)</label>
                    <input 
                      id="gallery-file-input"
                      type="file" 
                      accept="image/*,video/*"
                      className="form-input" 
                      onChange={(e) => setGalleryFile(e.target.files[0])} 
                    />
                  </div>

                  <div>
                    <label className="form-label">Media Title / Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Twilight Pool Party View"
                      className="form-input" 
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Gallery Category</label>
                    <select 
                      className="form-select"
                      value={galleryCategory}
                      onChange={(e) => setGalleryCategory(e.target.value)}
                    >
                      <option value="Cottages">Cottages & Villas</option>
                      <option value="Nature">Nature & Sandalwood</option>
                      <option value="Celebrations">Celebrations & Events</option>
                      <option value="Videos">Resort Videos</option>
                    </select>
                  </div>
                </div>

                {galleryFile && (
                  <div style={{ padding: '12px', backgroundColor: '#D4EDDA', borderRadius: 'var(--radius-sm)', border: '1px solid #C3E6CB', color: '#155724', fontSize: '0.85rem', fontWeight: '600' }}>
                    ✓ Attached File: {galleryFile.name} ({(galleryFile.size / (1024 * 1024)).toFixed(2)} MB) — Click <strong>Save All Changes</strong> to publish!
                  </div>
                )}
              </div>

              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '16px' }}>
                All Gallery Media ({galleryItems.length} items)
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                {galleryItems.map((item) => (
                  <div key={item.id} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                    <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                      {item.type === 'video' ? (
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <span className="badge-gold" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem' }}>
                        {item.category}
                      </span>
                    </div>

                    <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ overflow: 'hidden' }}>
                        <h5 style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h5>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{item.isDefault ? 'Default' : 'Device Upload'}</span>
                      </div>

                      {!item.isDefault && (
                        <button 
                          onClick={() => handleDeleteGalleryMedia(item.id, item.isDefault)}
                          style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: '4px' }}
                          title="Delete from Gallery"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: BOOKINGS LEDGER */}
          {activeTab === 'bookings' && (() => {
            const filteredList = bookings.filter(b => {
              const matchesFilter = 
                bookingFilter === 'all' ? true :
                bookingFilter === 'pending' ? b.status === 'Pending' :
                bookingFilter === 'confirmed' ? b.status === 'Confirmed' :
                bookingFilter === 'cancelled' ? b.status === 'Cancelled' : true;

              if (!matchesFilter) return false;

              if (!bookingSearchQuery.trim()) return true;
              const q = bookingSearchQuery.toLowerCase();
              return (
                (b.id && b.id.toLowerCase().includes(q)) ||
                (b.guestName && b.guestName.toLowerCase().includes(q)) ||
                (b.phone && b.phone.toLowerCase().includes(q)) ||
                (b.email && b.email.toLowerCase().includes(q)) ||
                (b.roomName && b.roomName.toLowerCase().includes(q)) ||
                (b.transactionId && b.transactionId.toLowerCase().includes(q))
              );
            });

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)' }}>
                      Guest Bookings & Leads Ledger ({bookings.length})
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Review live reservations, pending checkouts, and guest details.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative', minWidth: '280px' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type="text" 
                      placeholder="Search name, phone, email, ID..."
                      className="form-input"
                      style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '0.85rem', height: '38px', marginBottom: 0 }}
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                    />
                    {bookingSearchQuery && (
                      <button 
                        onClick={() => setBookingSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: `All Bookings (${bookings.length})` },
                    { id: 'pending', label: `🟡 Pending Accounts (${pendingBookingsCount})`, color: '#856404', bg: '#FFF3CD' },
                    { id: 'confirmed', label: `🟢 Confirmed & Paid (${confirmedBookingsCount})`, color: '#155724', bg: '#D4EDDA' },
                    { id: 'cancelled', label: `🔴 Cancelled (${bookings.filter(b => b.status === 'Cancelled').length})`, color: '#721C24', bg: '#F8D7DA' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setBookingFilter(f.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: bookingFilter === f.id ? '2px solid var(--color-gold)' : '1px solid var(--border-light)',
                        backgroundColor: bookingFilter === f.id ? (f.bg || 'var(--bg-forest)') : '#FFFFFF',
                        color: bookingFilter === f.id ? (f.color || '#FFFFFF') : 'var(--text-main)',
                        fontWeight: bookingFilter === f.id ? '700' : '500',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: bookingFilter === f.id ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-cream)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '12px' }}>Ref ID</th>
                        <th style={{ padding: '12px' }}>Guest Contact Info</th>
                        <th style={{ padding: '12px' }}>Cottage / Suite</th>
                        <th style={{ padding: '12px' }}>Stay Dates & Guests</th>
                        <th style={{ padding: '12px' }}>Total Amount</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No bookings found matching your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredList.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: b.status === 'Pending' ? '#FFFDF8' : '#FFFFFF' }}>
                            <td style={{ padding: '12px', fontWeight: '700' }}>
                              <div style={{ color: b.status === 'Pending' ? '#856404' : 'var(--color-emerald)' }}>{b.id}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.createdAt}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '700' }}>{b.guestName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {b.phone}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✉️ {b.email}</div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{b.roomName}</td>
                            <td style={{ padding: '12px' }}>
                              <div>{b.checkIn} to {b.checkOut}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.guests} Guests ({b.nights || 1}N)</div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: '700', color: 'var(--color-emerald)', fontSize: '0.95rem' }}>
                              ₹{b.totalAmount?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                backgroundColor: b.status === 'Confirmed' ? '#D4EDDA' : b.status === 'Cancelled' ? '#F8D7DA' : '#FFF3CD',
                                color: b.status === 'Confirmed' ? '#155724' : b.status === 'Cancelled' ? '#721C24' : '#856404',
                                border: b.status === 'Pending' ? '1px solid #FFE08A' : 'none',
                                display: 'inline-block'
                              }}>
                                {b.status === 'Confirmed' ? '✓ Confirmed' : b.status === 'Pending' ? '🟡 Pending' : '✕ Cancelled'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {b.status !== 'Confirmed' && (
                                  <button 
                                    onClick={() => handleBookingStatus(b.id, 'Confirmed')}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      color: '#FFFFFF',
                                      backgroundColor: '#28A745',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Confirm
                                  </button>
                                )}

                                {b.phone && (
                                  <a 
                                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.guestName)},%20greetings%20from%2073%20Hills%20Resort!%20Regarding%20your%20booking%20${b.id}%20for%20${encodeURIComponent(b.roomName)}...`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      color: '#FFFFFF',
                                      backgroundColor: '#25D366',
                                      border: 'none',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <MessageSquare size={12} /> WhatsApp
                                  </a>
                                )}

                                {b.status !== 'Cancelled' && (
                                  <button 
                                    onClick={() => handleBookingStatus(b.id, 'Cancelled')}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                                  >
                                    Cancel
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleDeleteBooking(b.id)}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#999', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 9: RULES & POLICIES */}
          {activeTab === 'policies' && (
            <div style={{ maxWidth: '860px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: 'var(--color-emerald)', margin: 0 }}>
                  Resort Policies, Rules & Receipt Settings
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Customize timings, cancellation policy, privacy policy, house rules, and receipt details. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button to publish.
              </p>

              {/* Timings and GSTIN */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)', marginBottom: '16px' }}>
                  1. Check-In / Check-Out & Tax Identifiers
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Check-In Time</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={checkInTime} 
                      onChange={(e) => setCheckInTime(e.target.value)} 
                      placeholder="e.g. 02:00 PM"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Check-Out Time</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={checkOutTime} 
                      onChange={(e) => setCheckOutTime(e.target.value)} 
                      placeholder="e.g. 11:00 AM"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">GSTIN / Tax Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={gstin} 
                      onChange={(e) => setGstin(e.target.value)} 
                      placeholder="e.g. 37AAACH7373H1Z2"
                    />
                  </div>
                </div>
              </div>

              {/* Policies & Privacy */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)', marginBottom: '16px' }}>
                  2. Cancellation & Privacy Protection Policies
                </h5>

                <div className="form-group">
                  <label className="form-label">Cancellation & Refund Policy</label>
                  <textarea 
                    rows={3} 
                    className="form-textarea"
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    placeholder="e.g. Free cancellation up to 48 hours prior to check-in..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Privacy Policy & Guest Data Confidentiality</label>
                  <textarea 
                    rows={3} 
                    className="form-textarea"
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    placeholder="e.g. Guest personal data and booking records are encrypted..."
                  />
                </div>
              </div>

              {/* House Rules & Regulations */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                  3. Resort House Rules & Eco Guidelines
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  These rules are printed directly on guest confirmation receipts.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {houseRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', paddingRight: '12px' }}>
                        <strong>{idx + 1}.</strong> {rule}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleDeleteHouseRule(idx)}
                        style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: '4px' }}
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Type a new house rule or guideline and click Add..."
                    className="form-input" 
                    style={{ marginBottom: 0 }}
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHouseRule();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddHouseRule}
                    className="btn-outline-dark" 
                    style={{ padding: '10px 18px', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> Add Rule
                  </button>
                </div>
              </div>

              {/* Receipt Footer Note */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)', marginBottom: '12px' }}>
                  4. Printed Receipt Footer Note
                </h5>
                <input 
                  type="text" 
                  className="form-input" 
                  value={receiptFooterNote} 
                  onChange={(e) => setReceiptFooterNote(e.target.value)}
                  placeholder="e.g. Thank you for choosing 73 Hills Resort. Have a serene luxury stay!"
                />
              </div>
            </div>
          )}

          {/* TAB 10: CONTACT & INFO */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: '720px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                Contact Details & Location Coordinates
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Update customer service phone lines, inquiry email, and resort address. Click the single <strong>🚀 SAVE ALL CHANGES</strong> button to publish.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settings.phone1 || ''} 
                    onChange={(e) => setSettings({ ...settings, phone1: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Secondary Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settings.phone2 || ''} 
                    onChange={(e) => setSettings({ ...settings, phone2: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Inquiry Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={settings.email || ''} 
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resort Physical Address & Google Location Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.location || ''} 
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })} 
                />
              </div>
            </div>
          )}

        </div>

        {/* PERSISTENT FLOATING BOTTOM SAVE BAR WITH ONE MASTER BUTTON */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#0D2116',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28A745', display: 'inline-block', boxShadow: '0 0 8px #28A745' }} />
            <span style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              All modifications, uploads, and edits are published to everyone worldwide when you click Save.
            </span>
          </div>

          <button
            onClick={handleSaveAllToMainPage}
            disabled={isProcessing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#28A745',
              color: '#FFFFFF',
              border: '1px solid #1E7E34',
              cursor: isProcessing ? 'wait' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '800',
              boxShadow: '0 4px 16px rgba(40,167,69,0.5)',
              transition: 'all 0.2s ease'
            }}
          >
            <Check size={20} /> {isProcessing ? 'SAVING TO MAIN PAGE...' : '🚀 SAVE ALL CHANGES TO MAIN PAGE'}
          </button>
        </div>

      </div>
    </div>
  );
}
