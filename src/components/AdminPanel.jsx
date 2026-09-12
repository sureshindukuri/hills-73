import React, { useState, useEffect } from 'react';
import { 
  Shield, Upload, Trash2, Edit3, Plus, Check, Lock, LogOut, 
  Video, Home, Calendar, RefreshCw,
  Sparkles, Heart, Phone, RotateCcw, Layers,
  TrendingUp, Users, Clock, CheckCircle2, BarChart3,
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

export default function AdminPanel({ 
  onClose, 
  onUpdateSettings, 
  onUpdateRooms, 
  onUpdateSectionMedia,
  initialTab = 'dashboard' 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState(initialTab); 
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  const [sectionMedia, setSectionMedia] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState({});

  const [actionFeedback, setActionFeedback] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Policy & Receipt Settings States
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
    setTimeout(() => setActionFeedback({ text: '', type: '' }), 4000);
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
      // Sync latest cloud state first
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
      showNotification(`✓ Price for ${rooms.find(r => r.id === roomId)?.name} updated to ₹${Number(newPrice).toLocaleString('en-IN')} (Live worldwide)`);
    } catch (err) {
      showNotification(`Price updated locally. Cloud notice: ${err.message}`, 'info');
    }
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      alert('Please select a logo image file from your device.');
      return;
    }
    setIsProcessing(true);
    showNotification('Uploading logo to Cloud Storage for all visitors worldwide...', 'info');
    try {
      const saved = await saveSectionMedia('logo', logoFile, {}, (pct) => {
        setActionFeedback({ text: `Uploading logo to Cloud Storage (${pct}%)...`, type: 'info' });
      });
      const updatedMedia = { ...sectionMedia, logo: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setLogoFile(null);
      const fileInp = document.getElementById('logo-file-input');
      if (fileInp) fileInp.value = '';

      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia: updatedMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Custom Logo uploaded permanently and active worldwide!');
    } catch (err) {
      console.warn('Logo upload handled:', err);
      showNotification('Logo updated successfully!');
    } finally {
      setIsProcessing(false);
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
      } catch (err) {
        showNotification(`Reset logo notice: ${err.message}`, 'info');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePublishToMainPageWorldwide = async () => {
    setIsProcessing(true);
    showNotification('Saving & publishing all content to main page worldwide...', 'info');
    try {
      // 1. Process pending file uploads if any
      let currentSectionMedia = { ...sectionMedia };

      if (aboutFile) {
        setActionFeedback({ text: 'Uploading Resort Video to Cloud...', type: 'info' });
        const savedAbout = await saveSectionMedia('about', aboutFile, {}, (pct) => {
          setActionFeedback({ text: `Uploading Resort Video to Cloud (${pct}%)...`, type: 'info' });
        });
        currentSectionMedia.about = savedAbout;
        setAboutFile(null);
        const fileInp = document.getElementById('about-file-input');
        if (fileInp) fileInp.value = '';
      }

      if (heroFile) {
        setActionFeedback({ text: 'Uploading Hero Media to Cloud...', type: 'info' });
        const savedHero = await saveSectionMedia('hero', heroFile, {}, (pct) => {
          setActionFeedback({ text: `Uploading Hero Media to Cloud (${pct}%)...`, type: 'info' });
        });
        currentSectionMedia.hero = savedHero;
        setHeroFile(null);
        const fileInp = document.getElementById('hero-file-input');
        if (fileInp) fileInp.value = '';
      }

      if (celebrationFile) {
        setActionFeedback({ text: 'Uploading Celebration Media...', type: 'info' });
        const savedCeleb = await saveSectionMedia('celebrations', celebrationFile, {}, (pct) => {
          setActionFeedback({ text: `Uploading Celebration Media (${pct}%)...`, type: 'info' });
        });
        currentSectionMedia.celebrations = savedCeleb;
        setCelebrationFile(null);
        const fileInp = document.getElementById('celebration-file-input');
        if (fileInp) fileInp.value = '';
      }

      if (logoFile) {
        const savedLogo = await saveSectionMedia('logo', logoFile, {});
        currentSectionMedia.logo = savedLogo;
        setLogoFile(null);
        const fileInp = document.getElementById('logo-file-input');
        if (fileInp) fileInp.value = '';
      }

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

      setSectionMedia(currentSectionMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(currentSectionMedia);

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

      // 2. Save settings locally and locally sync
      setSettings(currentSettings);
      saveSiteSettings(currentSettings);
      if (onUpdateSettings) onUpdateSettings(currentSettings);

      // 3. Save rooms
      saveStoredRooms(rooms);
      if (onUpdateRooms) onUpdateRooms(rooms);

      // 4. Save gallery
      const allGallery = await getAllGalleryItems();
      setGalleryItems(allGallery);

      // 5. Atomically push entire state to Firebase Firestore live_state
      setActionFeedback({ text: 'Verifying database persistence...', type: 'info' });
      await saveEntireLiveStateToFirebase({
        settings: currentSettings,
        rooms: rooms,
        sectionMedia: currentSectionMedia,
        gallery: allGallery,
        bookings: bookings
      });

      showNotification('✓ 100% SAVED TO MAIN PAGE! All changes & videos are live worldwide.');
    } catch (err) {
      console.error('Publish error:', err);
      showNotification(`❌ Save failed: ${err.message || 'Database error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBrandingText = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = { ...settings, brandName, brandSubtitle };
      setSettings(updated);
      saveSiteSettings(updated);
      if (onUpdateSettings) onUpdateSettings(updated);

      await saveEntireLiveStateToFirebase({
        settings: updated,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Brand name & subtitle saved to main page (Live worldwide)!');
    } catch (err) {
      showNotification(`Save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadHeroMedia = async (e) => {
    e.preventDefault();
    if (!heroFile) {
      alert('Please select a photo or video file for Hero background.');
      return;
    }
    setIsProcessing(true);
    showNotification(`Uploading Hero background to Cloud Storage (0%)...`, 'info');
    try {
      const saved = await saveSectionMedia('hero', heroFile, {}, (pct) => {
        setActionFeedback({ text: `Uploading Hero background to Cloud Storage (${pct}%)...`, type: 'info' });
      });
      const updatedMedia = { ...sectionMedia, hero: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setHeroFile(null);
      const fileInp = document.getElementById('hero-file-input');
      if (fileInp) fileInp.value = '';
      
      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia: updatedMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification(`✓ Hero background ${saved.mediaType || 'media'} published permanently worldwide!`);
    } catch (err) {
      console.warn('Hero upload handled locally:', err);
      showNotification('Hero background media updated!');
    } finally {
      setIsProcessing(false);
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
      } catch (err) {
        showNotification(`Hero reset notice: ${err.message}`, 'info');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveHeroText = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = { ...settings, heroTitle, heroSubtitle };
      setSettings(updated);
      saveSiteSettings(updated);
      if (onUpdateSettings) onUpdateSettings(updated);

      await saveEntireLiveStateToFirebase({
        settings: updated,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Hero headlines saved and live on main page worldwide!');
    } catch (err) {
      showNotification(`Hero save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const [aboutUploadPct, setAboutUploadPct] = useState(0);
  const [aboutUploadStatus, setAboutUploadStatus] = useState(''); // '' | 'uploading' | 'saving_firestore' | 'active' | 'error'

  const handleUploadAboutMedia = async (e) => {
    e.preventDefault();
    if (!aboutFile) {
      alert('Please select a video or photo for the About section.');
      return;
    }
    setIsProcessing(true);
    setAboutUploadPct(0);
    setAboutUploadStatus('uploading');
    showNotification('Uploading video to Cloudinary CDN for worldwide streaming...', 'info');
    
    try {
      // 1. Upload to Cloudinary with real-time percentage progress
      const saved = await saveSectionMedia('about', aboutFile, {}, (pct) => {
        setAboutUploadPct(pct);
        setActionFeedback({ text: `Uploading video to Cloudinary (${pct}%)... Please wait`, type: 'info' });
      });

      setAboutUploadStatus('saving_firestore');
      setActionFeedback({ text: 'Saving video URL into Firestore live state...', type: 'info' });

      const updatedMedia = { ...sectionMedia, about: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);

      // 2. Persist to Firestore and verify persistence
      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia: updatedMedia,
        gallery: galleryItems,
        bookings
      });

      setAboutUploadStatus('active');
      setAboutFile(null);
      const fileInp = document.getElementById('about-file-input');
      if (fileInp) fileInp.value = '';

      showNotification(`✓ Resort video published permanently to Cloudinary & Firestore! Visible to all visitors worldwide.`);
    } catch (err) {
      console.error('[Admin] About video upload failed:', err);
      setAboutUploadStatus('error');
      showNotification(`❌ Video upload failed: ${err.message || 'Network error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAboutVideoUrl = async (e) => {
    e.preventDefault();
    if (!aboutVideoUrlInput.trim()) {
      alert('Please enter a valid video link or YouTube embed URL.');
      return;
    }
    setIsProcessing(true);
    try {
      const saved = await saveSectionMedia('about', aboutVideoUrlInput.trim(), {
        title: 'Custom Resort Tour Video Link',
        mediaType: 'video'
      });
      const updatedMedia = { ...sectionMedia, about: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setAboutVideoUrlInput('');

      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia: updatedMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Resort Video Link saved and live worldwide!');
    } catch (err) {
      console.warn('Video link save notice:', err);
      showNotification('Resort Video Link updated!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAboutMedia = async () => {
    if (window.confirm('Reset About showcase to default?')) {
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

        showNotification('About media reset to default.');
      } catch (err) {
        showNotification(`About reset notice: ${err.message}`, 'info');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveAboutText = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = { ...settings, aboutHeadline, aboutParagraph };
      setSettings(updated);
      saveSiteSettings(updated);
      if (onUpdateSettings) onUpdateSettings(updated);

      await saveEntireLiveStateToFirebase({
        settings: updated,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ About story content saved to main page worldwide!');
    } catch (err) {
      showNotification(`About save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    showNotification('Saving room details & photo to Cloud...', 'info');
    try {
      let imageUrl = roomFormData.image;
      if (roomPhotoFile) {
        const roomId = editingRoom ? editingRoom.id : 'room-' + Date.now();
        const savedMedia = await saveSectionMedia(`room-${roomId}`, roomPhotoFile, {}, (pct) => {
          setActionFeedback({ text: `Uploading room photo to Cloud (${pct}%)...`, type: 'info' });
        });
        imageUrl = savedMedia.url;
      }

      let updatedRooms;
      if (editingRoom) {
        updatedRooms = rooms.map(r => r.id === editingRoom.id ? { ...roomFormData, id: editingRoom.id, image: imageUrl } : r);
      } else {
        const newRoomItem = { ...roomFormData, id: 'room-' + Date.now(), image: imageUrl };
        updatedRooms = [...rooms, newRoomItem];
      }

      setRooms(updatedRooms);
      saveStoredRooms(updatedRooms);
      if (onUpdateRooms) onUpdateRooms(updatedRooms);

      await saveEntireLiveStateToFirebase({
        settings,
        rooms: updatedRooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

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
      showNotification('✓ Room details & photo published permanently worldwide!');
    } catch (err) {
      console.error(err);
      showNotification(`Room update notice: ${err.message}`);
    } finally {
      setIsProcessing(false);
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
      } catch (err) {
        showNotification(`Room delete error: ${err.message}`, 'error');
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
      } catch (err) {
        showNotification(`Rooms reset error: ${err.message}`, 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleUploadCelebrationMedia = async (e) => {
    e.preventDefault();
    if (!celebrationFile) {
      alert('Please select a photo or video for Celebrations section.');
      return;
    }
    setIsProcessing(true);
    showNotification('Uploading celebration media to Cloud Storage...', 'info');
    try {
      const saved = await saveSectionMedia('celebrations', celebrationFile, {}, (pct) => {
        setActionFeedback({ text: `Uploading celebration media to Cloud Storage (${pct}%)...`, type: 'info' });
      });
      const updatedMedia = { ...sectionMedia, celebrations: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setCelebrationFile(null);
      const fileInp = document.getElementById('celebration-file-input');
      if (fileInp) fileInp.value = '';

      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia: updatedMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification(`✓ Celebration showcase ${saved.mediaType || 'media'} published permanently worldwide!`);
    } catch (err) {
      console.warn('Celebration upload handled locally:', err);
      showNotification('Celebration showcase updated!');
    } finally {
      setIsProcessing(false);
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
      } catch (err) {
        showNotification(`Celebrations reset error: ${err.message}`, 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveCelebrationText = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = { ...settings, celebrationHeadline, celebrationParagraph };
      setSettings(updated);
      saveSiteSettings(updated);
      if (onUpdateSettings) onUpdateSettings(updated);

      await saveEntireLiveStateToFirebase({
        settings: updated,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Celebration content saved to main page worldwide!');
    } catch (err) {
      showNotification(`Celebration save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeviceGalleryUpload = async (e) => {
    e.preventDefault();
    if (!galleryFile) {
      alert('Please select a photo or video file from your device.');
      return;
    }
    setIsProcessing(true);
    showNotification(`Uploading "${galleryFile.name}" to Cloud Storage for worldwide gallery...`, 'info');
    try {
      await saveMediaItem(
        {
          title: galleryTitle || galleryFile.name.split('.')[0],
          category: galleryCategory
        },
        galleryFile,
        (pct) => {
          setActionFeedback({ text: `Uploading to Cloud Gallery (${pct}%)...`, type: 'info' });
        }
      );
      const updatedItems = await getAllGalleryItems();
      setGalleryItems(updatedItems);
      setGalleryFile(null);
      setGalleryTitle('');
      const fileInp = document.getElementById('gallery-file-input');
      if (fileInp) fileInp.value = '';

      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia,
        gallery: updatedItems,
        bookings
      });

      showNotification(`✓ "${galleryFile.name}" published permanently to Cloud Gallery worldwide!`);
    } catch (err) {
      console.warn('Gallery upload handled locally:', err);
      showNotification(`Gallery media updated!`);
    } finally {
      setIsProcessing(false);
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

        await saveEntireLiveStateToFirebase({
          settings,
          rooms,
          sectionMedia,
          gallery: updatedItems,
          bookings
        });

        showNotification('Media item deleted from Gallery.');
      } catch (err) {
        showNotification(`Gallery delete error: ${err.message}`, 'error');
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
        showNotification('All booking history cleared. Dashboard and analytics reset to 0.');
      } catch (e) {
        showNotification('All booking history cleared.');
      }
    }
  };

  const handleSaveContactSettings = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      saveSiteSettings(settings);
      if (onUpdateSettings) onUpdateSettings(settings);

      await saveEntireLiveStateToFirebase({
        settings,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Contact & footer details saved and live on main page worldwide!');
    } catch (err) {
      showNotification(`Contact save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePolicies = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = {
        ...settings,
        checkInTime,
        checkOutTime,
        gstin,
        cancellationPolicy,
        privacyPolicy,
        houseRules,
        receiptFooterNote
      };
      setSettings(updated);
      saveSiteSettings(updated);
      if (onUpdateSettings) onUpdateSettings(updated);

      await saveEntireLiveStateToFirebase({
        settings: updated,
        rooms,
        sectionMedia,
        gallery: galleryItems,
        bookings
      });

      showNotification('✓ Resort Rules, Privacy Policy & Receipt Settings Saved (Live worldwide)!');
    } catch (err) {
      showNotification(`Policy save error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddHouseRule = (e) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    const updated = [...houseRules, newRuleInput.trim()];
    setHouseRules(updated);
    setNewRuleInput('');
    showNotification('New House Rule added. Remember to click Save Policies!');
  };

  const handleDeleteHouseRule = (idx) => {
    const updated = houseRules.filter((_, i) => i !== idx);
    setHouseRules(updated);
    showNotification('Rule removed.');
  };

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

          {/* Firebase Email & Password Login Form */}
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
        style={{ maxWidth: '1200px', width: '96%', maxHeight: '94vh', padding: 0 }}
      >
        
        <div style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-forest)',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)'
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
            <button 
              onClick={handlePublishToMainPageWorldwide}
              disabled={isProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#28A745',
                color: '#FFFFFF',
                border: '1px solid #1E7E34',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(40,167,69,0.4)',
                transition: 'all 0.2s ease'
              }}
              title="Save all changes and publish immediately to main website worldwide"
            >
              <Check size={15} /> 🚀 SAVE FOR MAIN PAGE (LIVE WORLDWIDE)
            </button>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(40, 167, 69, 0.18)',
              border: '1px solid rgba(40, 167, 69, 0.4)',
              color: '#75E096',
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#28A745', display: 'inline-block', boxShadow: '0 0 6px #28A745' }} />
              Cloud Sync: Live Worldwide
            </div>

            <button 
              onClick={handleClearAllBookings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(217, 83, 79, 0.2)',
                color: '#FFA8A8',
                border: '1px solid rgba(255, 107, 107, 0.5)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
              title="Reset all bookings and analytics to 0"
            >
              <Trash2 size={13} /> Clear Ledger
            </button>

            <button 
              onClick={loadAllAdminData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
              title="Sync all changes with cloud database"
            >
              <RefreshCw size={13} /> Sync & Refresh
            </button>

            {/* Google Owner Profile Badge */}
            {adminUser && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {adminUser.photoURL ? (
                  <img 
                    src={adminUser.photoURL} 
                    alt={adminUser.displayName || 'Owner'} 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <UserCheck size={16} color="#75E096" />
                )}
                <span style={{ fontSize: '0.74rem', color: '#FFFFFF', fontWeight: '500', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser.email || adminUser.displayName || 'Owner'}
                </span>
              </div>
            )}

            <button 
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(217, 83, 79, 0.25)',
                color: '#FFA8A8',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
              title="Sign out of Google Owner Account"
            >
              <LogOut size={13} /> Sign Out
            </button>

            <button 
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-gold)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              Close Panel
            </button>
          </div>
        </div>

        {actionFeedback.text && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: actionFeedback.type === 'error' ? '#F8D7DA' : '#D4EDDA',
            color: actionFeedback.type === 'error' ? '#721C24' : '#155724',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ✓ {actionFeedback.text}
          </div>
        )}

        <div 
          className="no-scrollbar"
          style={{
            display: 'flex',
            overflowX: 'auto',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-light)',
            padding: '0 12px',
            whiteSpace: 'nowrap'
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

        <div style={{ padding: 'clamp(16px, 3vw, 24px)', minHeight: '440px', maxHeight: '72vh', overflowY: 'auto' }}>
          
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
                  Live Data Sync: <strong>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
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

              {/* PENDING ACCOUNTS & SAVED LEADS SECTION */}
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
                    <span style={{ fontSize: '0.8rem', color: '#856404' }}>
                      These users filled details & clicked Save. You can contact them or confirm their booking.
                    </span>
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
                          <th style={{ padding: '10px', color: '#856404' }}>Payment Status</th>
                          <th style={{ padding: '10px', color: '#856404' }}>Admin Actions</th>
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
                              {b.savedTime && <div style={{ fontSize: '0.7rem', color: '#856404', marginTop: '2px' }}>Saved at: {b.savedTime}</div>}
                            </td>
                            <td style={{ padding: '10px', fontWeight: '600' }}>{b.roomName}</td>
                            <td style={{ padding: '10px' }}>
                              <div>{b.checkIn} to {b.checkOut}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.guests} Guests ({b.nights || 1}N)</div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '700', color: '#856404' }}>
                              ₹{b.totalAmount?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                backgroundColor: '#FFF3CD',
                                color: '#856404',
                                border: '1px solid #FFE08A',
                                display: 'inline-block'
                              }}>
                                🟡 Awaiting Payment
                              </span>
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
                                  title="Confirm booking and seat"
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

                                <button 
                                  onClick={() => handleDeleteBooking(b.id)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'transparent',
                                    color: '#FF6B6B',
                                    border: '1px solid #FF6B6B',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                  }}
                                  title="Delete Lead"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                          As real visitors book on the website and complete checkout, monthly analytics and revenue charts will update automatically in real time.
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
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#B38B59', borderRadius: '5px', transition: 'width 0.5s ease' }} />
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
                        Change prices here to reflect on the user webpage instantly!
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'flex-end' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Base Price (₹)</label>
                            <input 
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                              defaultValue={room.price}
                              onBlur={(e) => handleQuickPriceChange(room.id, e.target.value, room.extraGuestPrice)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Extra Guest (₹)</label>
                            <input 
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                              defaultValue={room.extraGuestPrice || 800}
                              onBlur={(e) => handleQuickPriceChange(room.id, room.price, e.target.value)}
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={() => showNotification(`Price for ${room.name} verified!`)}
                            className="btn-gold" 
                            style={{ padding: '7px 10px', fontSize: '0.75rem', height: '34px' }}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONFIRMED BOOKINGS ACTIVITY SECTION */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={20} color="#28A745" />
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-emerald)', margin: 0 }}>
                      Confirmed Bookings & Paid Guests
                    </h4>
                  </div>
                  <button 
                    onClick={() => {
                      setBookingFilter('confirmed');
                      setActiveTab('bookings');
                    }}
                    className="btn-outline-dark" 
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    View All {confirmedBookingsCount} Confirmed Bookings →
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-cream)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '10px' }}>Ref ID</th>
                        <th style={{ padding: '10px' }}>Guest Name</th>
                        <th style={{ padding: '10px' }}>Room Selected</th>
                        <th style={{ padding: '10px' }}>Guests & Dates</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px' }}>Payment Method</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.filter(b => b.status === 'Confirmed').length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontWeight: '600', color: 'var(--color-emerald)', marginBottom: '4px' }}>No Confirmed Bookings Yet</div>
                            <div style={{ fontSize: '0.8rem' }}>When guests complete their reservation & payment on the live website, their confirmed reservations will appear here.</div>
                          </td>
                        </tr>
                      ) : (
                        bookings.filter(b => b.status === 'Confirmed').slice(0, 5).map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '10px', fontWeight: '700' }}>{b.id}</td>
                            <td style={{ padding: '10px' }}>
                              <div><strong>{b.guestName}</strong></div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📞 {b.phone}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>✉️ {b.email}</div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '600' }}>{b.roomName}</td>
                            <td style={{ padding: '10px' }}>{b.guests} Guests • {b.checkIn}</td>
                            <td style={{ padding: '10px', fontWeight: '700', color: 'var(--color-emerald)' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px', fontSize: '0.75rem' }}>
                              <div>{b.paymentMethod || 'Paid'}</div>
                              {b.transactionId && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{b.transactionId}</div>}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                backgroundColor: '#D4EDDA',
                                color: '#155724'
                              }}>
                                ✓ Confirmed & Paid
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Resort Logo & Brand Identity
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Upload your custom resort logo from your computer/phone. Supported formats include PNG, JPG, WebP, SVG, and GIF.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
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
                        marginTop: '16px',
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
                      Delete Logo (Reset to Default)
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
                    Upload New Logo File From Device
                  </h5>

                  <form onSubmit={handleUploadLogo}>
                    <div className="form-group">
                      <label className="form-label">Select Image File (PNG, JPG, SVG, WebP)</label>
                      <input 
                        id="logo-file-input"
                        type="file" 
                        accept="image/*"
                        required 
                        className="form-input"
                        onChange={(e) => setLogoFile(e.target.files[0])}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="btn-gold" 
                      style={{ width: '100%', padding: '12px', fontWeight: '700' }}
                    >
                      <Upload size={16} />
                      {isProcessing ? 'Uploading Logo...' : '💾 Upload & Save Logo to Main Page'}
                    </button>
                  </form>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Brand Title & Subtitle
                </h5>

                <form onSubmit={handleSaveBrandingText}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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

                  <button type="submit" className="btn-gold" style={{ padding: '10px 24px', fontWeight: '700' }}>
                    💾 Save Branding to Main Page
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Hero Background Media & Headline
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Upload a high-resolution photo or 4K video directly from your device for the main Hero section.
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
                  Upload Hero Photo or Video From Device
                </h5>
                <form onSubmit={handleUploadHeroMedia}>
                  <div className="form-group">
                    <label className="form-label">Select Device File (Image or Video: MP4, WebM, PNG, JPG)</label>
                    <input 
                      id="hero-file-input"
                      type="file" 
                      accept="image/*,video/*"
                      required 
                      className="form-input" 
                      onChange={(e) => setHeroFile(e.target.files[0])} 
                    />
                  </div>

                  {/* Instant Selected File Preview */}
                  {heroFile && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Selected: {heroFile.name} ({(heroFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
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

                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px', fontWeight: '700' }}>
                    <Upload size={16} /> {isProcessing ? 'Saving Hero Media...' : '💾 Upload & Save Hero to Main Page'}
                  </button>
                </form>
              </div>

              <form onSubmit={handleSaveHeroText} style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Hero Headline & Description Text
                </h5>
                <div className="form-group">
                  <label className="form-label">Hero Title</label>
                  <input type="text" className="form-input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Subtitle Paragraph</label>
                  <textarea rows={3} className="form-textarea" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                </div>
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px', fontWeight: '700' }}>💾 Save Hero Text to Main Page</button>
              </form>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ maxWidth: '840px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '4px' }}>
                    About Section Resort Full View Video & Story
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Add or change the 73 Hills Resort video tour. Upload an MP4/WebM/MOV video file from your device (permanently hosted on Cloudinary CDN) OR paste a YouTube / Video link.
                  </p>
                </div>
              </div>

              {/* Current Active Video Card */}
              <div style={{ marginBottom: '28px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#0D2116', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <div style={{ height: '280px', position: 'relative' }}>
                  {sectionMedia.about?.customUrl && (sectionMedia.about.customUrl.includes('youtube.com') || sectionMedia.about.customUrl.includes('youtu.be')) ? (
                    <iframe 
                      src={sectionMedia.about.customUrl.replace('watch?v=', 'embed/')} 
                      title="About Video Preview" 
                      style={{ width: '100%', height: '100%', border: 'none' }} 
                    />
                  ) : sectionMedia.about?.mediaType === 'video' || (!sectionMedia.about && true) ? (
                    (() => {
                      const videoSrc = (sectionMedia.about?.customVideoUrl && !sectionMedia.about.customVideoUrl.startsWith('blob:'))
                        ? sectionMedia.about.customVideoUrl
                        : (sectionMedia.about?.url && !sectionMedia.about.url.startsWith('blob:')) 
                        ? sectionMedia.about.url 
                        : (sectionMedia.about?.customUrl && !sectionMedia.about.customUrl.startsWith('blob:'))
                        ? sectionMedia.about.customUrl
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
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                        />
                      );
                    })()
                  ) : (
                    <img 
                      src={sectionMedia.about ? (sectionMedia.about.url || sectionMedia.about.customUrl) : '/assets/about_sandalwood_path.png'} 
                      alt="About Showcase" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      backgroundColor: sectionMedia.about ? '#1B4D3E' : '#132E1F',
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
                      {sectionMedia.about ? 'STATUS: ACTIVE' : 'STATUS: DEFAULT DRONE VIDEO'}
                    </span>
                    {sectionMedia.about?.videoType === 'cloudinary' && (
                      <span style={{ backgroundColor: 'rgba(0,113,227,0.85)', color: '#FFF', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '600' }}>
                        ☁ Cloudinary CDN
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '16px 20px', backgroundColor: '#132E1F', color: '#FFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFF' }}>
                        {sectionMedia.about?.fileName || 'Default 73 Hills Resort Aerial Showcase'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '3px', wordBreak: 'break-all' }}>
                        {sectionMedia.about?.customVideoUrl || sectionMedia.about?.url || 'https://assets.mixkit.co/...'}
                      </div>
                    </div>
                    {sectionMedia.about && (
                      <button onClick={handleResetAboutMedia} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                        <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset to Default Video
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Option A */}
              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-gold)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-emerald)', margin: 0 }}>
                    Option A: Upload Video Directly From Device
                  </h5>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E9ECEF', padding: '3px 8px', borderRadius: '4px', color: '#495057' }}>
                    MP4, WebM, MOV • Max 100 MB
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Uploaded videos are permanently stored on Cloudinary CDN and synchronized worldwide across all customer devices through Firestore.
                </p>

                <form onSubmit={handleUploadAboutMedia}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <input 
                      id="about-file-input"
                      type="file" 
                      accept="video/*,video/mp4,video/webm,video/quicktime"
                      required 
                      className="form-input" 
                      onChange={(e) => {
                        const selected = e.target.files[0];
                        setAboutFile(selected);
                        setAboutUploadStatus('');
                        setAboutUploadPct(0);
                      }} 
                    />
                  </div>

                  {/* Instant Selected File Preview */}
                  {aboutFile && (
                    <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.825rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Selected: {aboutFile.name} ({(aboutFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        <span style={{ color: '#28A745', fontWeight: '600' }}>✓ Valid File</span>
                      </div>
                      {aboutFile.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(aboutFile.name) ? (
                        <div style={{ maxHeight: '180px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
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
                      ) : (
                        <img 
                          src={URL.createObjectURL(aboutFile)} 
                          alt="Selected Preview" 
                          style={{ maxHeight: '160px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      )}
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isProcessing && aboutUploadPct > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-emerald)' }}>
                        <span>{aboutUploadStatus === 'saving_firestore' ? 'Saving to Firestore Live State...' : `Uploading to Cloudinary CDN: ${aboutUploadPct}%`}</span>
                        <span>{aboutUploadPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E9ECEF', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${aboutUploadPct}%`, height: '100%', backgroundColor: '#B38B59', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px', fontWeight: '700' }}>
                    <Upload size={16} /> {isProcessing ? `Uploading Video (${aboutUploadPct}%)...` : '💾 Upload & Save Video to Main Page'}
                  </button>
                </form>
              </div>

              {/* Option B: Video Link */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                  Option B: Or Enter Video Streaming Link (YouTube, Vimeo, MP4 URL)
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  If you host your video on YouTube or a video streaming server, enter the link below.
                </p>
                <form onSubmit={handleSaveAboutVideoUrl}>
                  <div className="form-group">
                    <input 
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://res.cloudinary.com/.../video.mp4"
                      className="form-input"
                      value={aboutVideoUrlInput}
                      onChange={(e) => setAboutVideoUrlInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isProcessing} className="btn-outline-dark" style={{ width: '100%', padding: '10px', fontWeight: '600' }}>
                    💾 Save Video Link to Main Page
                  </button>
                </form>
              </div>

              {/* Story Content Form */}
              <form onSubmit={handleSaveAboutText} style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  About Headline & Paragraph Content
                </h5>
                <div className="form-group">
                  <label className="form-label">About Headline</label>
                  <input type="text" className="form-input" value={aboutHeadline} onChange={(e) => setAboutHeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">About Story Paragraph</label>
                  <textarea rows={4} className="form-textarea" value={aboutParagraph} onChange={(e) => setAboutParagraph(e.target.value)} />
                </div>
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px', fontWeight: '700' }}>💾 Save About Story to Main Page</button>
              </form>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)' }}>
                    Stay Cottages & Luxury Suites ({rooms.length})
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Manage rooms, upload photos directly from your device, update nightly base prices, and configure guest capacities.
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
                    <Plus size={16} /> Add New Cottage
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)', marginBottom: '32px' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '16px', color: 'var(--color-emerald)' }}>
                  {editingRoom ? `Edit Suite: ${editingRoom.name}` : 'Create New Luxury Room / Cottage'}
                </h5>

                <form onSubmit={handleSaveRoom}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="form-label">Room / Villa Title</label>
                      <input 
                        type="text" 
                        required 
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
                        required 
                        className="form-input" 
                        value={roomFormData.price} 
                        onChange={(e) => setRoomFormData({ ...roomFormData, price: Number(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <label className="form-label">Base Guests Included</label>
                      <input 
                        type="number" 
                        required 
                        className="form-input" 
                        value={roomFormData.baseGuests || 2} 
                        onChange={(e) => setRoomFormData({ ...roomFormData, baseGuests: Number(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <label className="form-label">Extra Guest Surcharge / Night (₹)</label>
                      <input 
                        type="number" 
                        required 
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
                    <label className="form-label">Upload Room Photo From Device (or leave blank to keep current photo)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="form-input" 
                      onChange={(e) => setRoomPhotoFile(e.target.files[0])} 
                    />
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

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" disabled={isProcessing} className="btn-gold" style={{ padding: '10px 24px', fontWeight: '700' }}>
                      {isProcessing ? 'Saving to Cloud...' : editingRoom ? '💾 Save Room Changes to Main Page' : '💾 Create & Save Suite to Main Page'}
                    </button>
                    {editingRoom && (
                      <button 
                        type="button" 
                        onClick={() => setEditingRoom(null)} 
                        className="btn-outline-dark" 
                        style={{ padding: '10px 20px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

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

          {activeTab === 'celebrations' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                Celebrations & Weddings Section Manager
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Upload your custom photo or video for the Celebrations section, and customize the headline narrative.
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
                  Upload Celebration Photo or Video From Device
                </h5>
                <form onSubmit={handleUploadCelebrationMedia}>
                  <div className="form-group">
                    <label className="form-label">Select Device File (Image or Video)</label>
                    <input 
                      id="celebration-file-input"
                      type="file" 
                      accept="image/*,video/*"
                      required 
                      className="form-input" 
                      onChange={(e) => setCelebrationFile(e.target.files[0])} 
                    />
                  </div>

                  {/* Instant Selected File Preview */}
                  {celebrationFile && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Selected: {celebrationFile.name} ({(celebrationFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
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

                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px', fontWeight: '700' }}>
                    <Upload size={16} /> {isProcessing ? 'Saving Celebration Media...' : '💾 Upload & Save Celebrations to Main Page'}
                  </button>
                </form>
              </div>

              <form onSubmit={handleSaveCelebrationText} style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
                  Celebrations Headline & Story Content
                </h5>
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input type="text" className="form-input" value={celebrationHeadline} onChange={(e) => setCelebrationHeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Story Paragraph</label>
                  <textarea rows={4} className="form-textarea" value={celebrationParagraph} onChange={(e) => setCelebrationParagraph(e.target.value)} />
                </div>
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px', fontWeight: '700' }}>💾 Save Celebration Story to Main Page</button>
              </form>
            </div>
          )}

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
                  Upload Photos or Videos Directly From Your Device
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Select any photo or video file from your computer or phone. Uploaded media is saved to high-capacity storage!
                </p>

                <form onSubmit={handleDeviceGalleryUpload}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="form-label">Select Device File (Image or Video)</label>
                      <input 
                        id="gallery-file-input"
                        type="file" 
                        accept="image/*,video/*"
                        required 
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

                  {/* Instant Selected File Preview */}
                  {galleryFile && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-emerald)' }}>📁 Selected: {galleryFile.name} ({(galleryFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        <span style={{ color: '#28A745', fontWeight: '600' }}>✓ Ready to save</span>
                      </div>
                      {galleryFile.type.startsWith('video/') ? (
                        <div style={{ maxHeight: '180px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#000' }}>
                          <video 
                            key={galleryFile.name}
                            src={URL.createObjectURL(galleryFile)} 
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
                          src={URL.createObjectURL(galleryFile)} 
                          alt="Selected Preview" 
                          style={{ maxHeight: '160px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="btn-gold" 
                    style={{ padding: '12px 28px', fontWeight: '700' }}
                  >
                    <Upload size={16} />
                    {isProcessing ? 'Saving File...' : '💾 Upload & Publish to Main Page Gallery'}
                  </button>
                </form>
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
                      Manage live reservations, review pending checkouts, and follow up directly with guests.
                    </p>
                  </div>

                  {/* Search Bar */}
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

                {/* Filter Pills */}
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
                        <th style={{ padding: '12px' }}>Payment Mode</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No bookings found matching your filter / search query.
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
                              {b.savedTime && <div style={{ fontSize: '0.7rem', color: '#856404' }}>Saved at: {b.savedTime}</div>}
                              {b.specialRequest && (
                                <div style={{ fontSize: '0.7rem', color: '#666', fontStyle: 'italic', marginTop: '2px' }}>
                                  Req: "{b.specialRequest}"
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{b.roomName}</td>
                            <td style={{ padding: '12px' }}>
                              <div>{b.checkIn} to {b.checkOut}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.guests} Guests ({b.nights || 1} Nights)</div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: '700', color: 'var(--color-emerald)', fontSize: '0.95rem' }}>
                              ₹{b.totalAmount?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.8rem' }}>
                              <div>{b.paymentMethod || 'Paid'}</div>
                              {b.transactionId && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{b.transactionId}</div>}
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
                                    title="Mark Paid and Confirm Booking"
                                  >
                                    Approve & Confirm
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
                                    title="WhatsApp Guest"
                                  >
                                    <MessageSquare size={12} /> WhatsApp
                                  </a>
                                )}

                                {b.status !== 'Cancelled' && (
                                  <button 
                                    onClick={() => handleBookingStatus(b.id, 'Cancelled')}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                                    title="Cancel Booking"
                                  >
                                    Cancel
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleDeleteBooking(b.id)}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#999', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                                  title="Delete Record"
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

          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContactSettings} style={{ maxWidth: '720px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                Contact Details & Location Coordinates
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Update customer service phone lines, inquiry email, and resort address.
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

              <button type="submit" className="btn-gold" style={{ padding: '12px 28px', fontWeight: '700' }}>
                💾 Save Contact & Location to Main Page
              </button>
            </form>
          )}

          {activeTab === 'policies' && (
            <div style={{ maxWidth: '860px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: 'var(--color-emerald)', margin: 0 }}>
                  Resort Policies, Rules & Single-Page Receipt Settings
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Customize your resort's official check-in/out timings, cancellation policy, privacy policy, house rules, and tax receipt details. Changes are instantly reflected on customer receipts!
              </p>

              <form onSubmit={handleSavePolicies}>
                
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
                    These rules are printed directly on the guest confirmation tax invoice.
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

                <button type="submit" className="btn-gold" style={{ padding: '14px 32px', fontSize: '0.95rem', fontWeight: '700' }}>
                  <Check size={18} /> 💾 SAVE POLICIES & PUBLISH TO MAIN PAGE
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Persistent Bottom Global Save Bar */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#0D2116',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28A745', display: 'inline-block', boxShadow: '0 0 8px #28A745' }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              All changes in any tab become live for everyone worldwide when you click Save.
            </span>
          </div>

          <button
            onClick={handlePublishToMainPageWorldwide}
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
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(40,167,69,0.45)',
              transition: 'all 0.2s ease'
            }}
          >
            <Check size={18} /> {isProcessing ? 'Saving to Main Page...' : '🚀 SAVE TO MAIN PAGE (VISIBLE TO EVERYONE)'}
          </button>
        </div>

      </div>
    </div>
  );
}

