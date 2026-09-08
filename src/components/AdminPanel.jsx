import React, { useState, useEffect } from 'react';
import { 
  Shield, Upload, Trash2, Edit3, Plus, Check, Lock, LogOut, 
  Video, Home, Calendar, RefreshCw,
  Sparkles, Heart, Phone, RotateCcw, Layers,
  TrendingUp, Users, Clock, CheckCircle2, BarChart3,
  Search, MessageSquare
} from 'lucide-react';
import { 
  saveMediaItem, getAllGalleryItems, deleteMediaItem,
  saveSectionMedia, getAllSectionMedia, deleteSectionMedia,
  getStoredRooms, saveStoredRooms, DEFAULT_ROOMS,
  getStoredBookings, saveStoredBookings, clearStoredBookings,
  getSiteSettings, saveSiteSettings
} from '../utils/storage';
import { SandalwoodTreeLogo } from './SandalwoodGraphics';

export default function AdminPanel({ 
  onClose, 
  onUpdateSettings, 
  onUpdateRooms, 
  onUpdateSectionMedia,
  initialTab = 'dashboard' 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

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
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadAllAdminData();
    }
  }, []);

  const showNotification = (text, type = 'success') => {
    setActionFeedback({ text, type });
    setTimeout(() => setActionFeedback({ text: '', type: '' }), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin73' || passwordInput === 'admin' || passwordInput === '73hills') {
      setIsAuthenticated(true);
      sessionStorage.setItem('73hills_admin_auth', 'true');
      setAuthError('');
      loadAllAdminData();
    } else {
      setAuthError('Invalid Admin Passcode. Use "admin73" or "73hills".');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('73hills_admin_auth');
  };

  const loadAllAdminData = async () => {
    try {
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

  const handleQuickPriceChange = (roomId, newPrice, extraGuestPrice) => {
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
    showNotification(`Updated price for ${rooms.find(r => r.id === roomId)?.name} to ₹${Number(newPrice).toLocaleString('en-IN')}`);
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      alert('Please select a logo image file from your device.');
      return;
    }
    setIsProcessing(true);
    try {
      const saved = await saveSectionMedia('logo', logoFile);
      const updatedMedia = { ...sectionMedia, logo: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setLogoFile(null);
      const fileInp = document.getElementById('logo-file-input');
      if (fileInp) fileInp.value = '';
      showNotification('Custom Logo uploaded successfully!');
    } catch (err) {
      alert('Failed to upload logo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Reset to default 73 Hills Sandalwood Tree logo icon?')) {
      setIsProcessing(true);
      await deleteSectionMedia('logo');
      const updatedMedia = { ...sectionMedia };
      delete updatedMedia.logo;
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setIsProcessing(false);
      showNotification('Logo reset to default.');
    }
  };

  const handleSaveBrandingText = (e) => {
    e.preventDefault();
    const updated = { ...settings, brandName, brandSubtitle };
    setSettings(updated);
    saveSiteSettings(updated);
    if (onUpdateSettings) onUpdateSettings(updated);
    showNotification('Brand name and subtitle updated!');
  };

  const handleUploadHeroMedia = async (e) => {
    e.preventDefault();
    if (!heroFile) {
      alert('Please select a photo or video file for Hero background.');
      return;
    }
    setIsProcessing(true);
    try {
      const saved = await saveSectionMedia('hero', heroFile);
      const updatedMedia = { ...sectionMedia, hero: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setHeroFile(null);
      const fileInp = document.getElementById('hero-file-input');
      if (fileInp) fileInp.value = '';
      showNotification(`Hero background ${saved.mediaType} uploaded successfully!`);
    } catch (err) {
      alert('Failed to upload hero media.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetHeroMedia = async () => {
    if (window.confirm('Reset Hero background to default?')) {
      await deleteSectionMedia('hero');
      const updatedMedia = { ...sectionMedia };
      delete updatedMedia.hero;
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      showNotification('Hero media reset to default.');
    }
  };

  const handleSaveHeroText = (e) => {
    e.preventDefault();
    const updated = { ...settings, heroTitle, heroSubtitle };
    setSettings(updated);
    saveSiteSettings(updated);
    if (onUpdateSettings) onUpdateSettings(updated);
    showNotification('Hero headlines saved successfully!');
  };

  const handleUploadAboutMedia = async (e) => {
    e.preventDefault();
    if (!aboutFile) {
      alert('Please select a photo or video for About section.');
      return;
    }
    setIsProcessing(true);
    try {
      const saved = await saveSectionMedia('about', aboutFile);
      const updatedMedia = { ...sectionMedia, about: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setAboutFile(null);
      const fileInp = document.getElementById('about-file-input');
      if (fileInp) fileInp.value = '';
      showNotification(`Resort video ${saved.mediaType} uploaded and active instantly on website!`);
    } catch (err) {
      alert('Failed to upload about media.');
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
      showNotification('Resort Video Link saved!');
    } catch (err) {
      alert('Failed to save video link.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAboutMedia = async () => {
    if (window.confirm('Reset About showcase to default?')) {
      await deleteSectionMedia('about');
      const updatedMedia = { ...sectionMedia };
      delete updatedMedia.about;
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      showNotification('About media reset to default.');
    }
  };

  const handleSaveAboutText = (e) => {
    e.preventDefault();
    const updated = { ...settings, aboutHeadline, aboutParagraph };
    setSettings(updated);
    saveSiteSettings(updated);
    if (onUpdateSettings) onUpdateSettings(updated);
    showNotification('About story content saved successfully!');
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let imageUrl = roomFormData.image;
      if (roomPhotoFile) {
        const roomId = editingRoom ? editingRoom.id : 'room-' + Date.now();
        const savedMedia = await saveSectionMedia(`room-${roomId}`, roomPhotoFile);
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
      showNotification('Room details & price saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save room.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm('Are you sure you want to remove this cottage / suite?')) {
      const updated = rooms.filter(r => r.id !== id);
      setRooms(updated);
      saveStoredRooms(updated);
      if (onUpdateRooms) onUpdateRooms(updated);
      showNotification('Room removed.');
    }
  };

  const handleResetDefaultRooms = () => {
    if (window.confirm('Reset all rooms to default 73 Hills suites & prices?')) {
      setRooms(DEFAULT_ROOMS);
      saveStoredRooms(DEFAULT_ROOMS);
      if (onUpdateRooms) onUpdateRooms(DEFAULT_ROOMS);
      showNotification('Rooms reset to defaults.');
    }
  };

  const handleUploadCelebrationMedia = async (e) => {
    e.preventDefault();
    if (!celebrationFile) {
      alert('Please select a photo or video for Celebrations section.');
      return;
    }
    setIsProcessing(true);
    try {
      const saved = await saveSectionMedia('celebrations', celebrationFile);
      const updatedMedia = { ...sectionMedia, celebrations: saved };
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      setCelebrationFile(null);
      const fileInp = document.getElementById('celebration-file-input');
      if (fileInp) fileInp.value = '';
      showNotification(`Celebration showcase ${saved.mediaType} uploaded successfully!`);
    } catch (err) {
      alert('Failed to upload celebration media.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetCelebrationMedia = async () => {
    if (window.confirm('Reset Celebration showcase to default?')) {
      await deleteSectionMedia('celebrations');
      const updatedMedia = { ...sectionMedia };
      delete updatedMedia.celebrations;
      setSectionMedia(updatedMedia);
      if (onUpdateSectionMedia) onUpdateSectionMedia(updatedMedia);
      showNotification('Celebrations media reset to default.');
    }
  };

  const handleSaveCelebrationText = (e) => {
    e.preventDefault();
    const updated = { ...settings, celebrationHeadline, celebrationParagraph };
    setSettings(updated);
    saveSiteSettings(updated);
    if (onUpdateSettings) onUpdateSettings(updated);
    showNotification('Celebration content saved!');
  };

  const handleDeviceGalleryUpload = async (e) => {
    e.preventDefault();
    if (!galleryFile) {
      alert('Please select a photo or video file from your device.');
      return;
    }
    setIsProcessing(true);
    try {
      await saveMediaItem(
        {
          title: galleryTitle || galleryFile.name.split('.')[0],
          category: galleryCategory
        },
        galleryFile
      );
      const updatedItems = await getAllGalleryItems();
      setGalleryItems(updatedItems);
      setGalleryFile(null);
      setGalleryTitle('');
      const fileInp = document.getElementById('gallery-file-input');
      if (fileInp) fileInp.value = '';
      showNotification(`Uploaded "${galleryFile.name}" to Gallery!`);
    } catch (err) {
      alert('Failed to upload gallery file.');
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
      await deleteMediaItem(id);
      const updatedItems = await getAllGalleryItems();
      setGalleryItems(updatedItems);
      showNotification('Media item deleted from Gallery.');
    }
  };

  const handleBookingStatus = (id, newStatus) => {
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
    showNotification(`Booking ${id} status set to ${newStatus}`);
  };

  const handleDeleteBooking = (id) => {
    if (window.confirm(`Delete booking record ${id}?`)) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      saveStoredBookings(updated);
      showNotification(`Booking ${id} removed.`);
    }
  };

  const handleClearAllBookings = () => {
    if (window.confirm('Clear all booking records and reset dashboard analytics to zero? Real user bookings will start fresh.')) {
      clearStoredBookings();
      setBookings([]);
      showNotification('All booking history cleared. Dashboard and analytics reset to 0.');
    }
  };

  const handleSaveContactSettings = (e) => {
    e.preventDefault();
    saveSiteSettings(settings);
    if (onUpdateSettings) onUpdateSettings(settings);
    showNotification('Contact & footer details updated successfully!');
  };

  const handleSavePolicies = (e) => {
    e.preventDefault();
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
    showNotification('Resort Rules, Privacy Policy & Receipt Settings Saved!');
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
          style={{ maxWidth: '440px', padding: '40px', textAlign: 'center' }}
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
            marginBottom: '20px'
          }}>
            <Shield size={32} color="#B38B59" />
          </div>

          <span className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>
            OWNER & ADMIN PORTAL
          </span>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '8px' }}>
            73 Hills Control Panel
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Dashboard Analytics, Live Bookings, Prices, Video Uploads & Media Manager.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Passcode: admin73"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.2em' }}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
            </div>

            {authError && (
              <div style={{ color: '#D9534F', fontSize: '0.85rem', marginBottom: '16px' }}>
                {authError}
              </div>
            )}

            <button type="submit" className="btn-gold" style={{ width: '100%', padding: '12px' }}>
              <Lock size={16} /> LOGIN TO ADMIN DASHBOARD
            </button>
          </form>

          <button 
            onClick={onClose}
            style={{ marginTop: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
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
          padding: '18px 28px',
          backgroundColor: 'var(--bg-forest)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={26} color="#B38B59" />
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#FFFFFF', lineHeight: 1 }}>
                73 Hills Executive Manager
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Real-Time Bookings, Monthly Analytics, Custom Pricing & Device Media Portal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleClearAllBookings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(217, 83, 79, 0.2)',
                color: '#FFA8A8',
                border: '1px solid rgba(255, 107, 107, 0.5)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
              title="Reset all bookings and analytics to 0"
            >
              <Trash2 size={14} /> Clear Ledger Data
            </button>

            <button 
              onClick={loadAllAdminData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button 
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E0E0E0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              <LogOut size={14} /> Logout
            </button>

            <button 
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-gold)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              Close Panel
            </button>
          </div>
        </div>

        {actionFeedback.text && (
          <div style={{
            padding: '12px 28px',
            backgroundColor: actionFeedback.type === 'error' ? '#F8D7DA' : '#D4EDDA',
            color: actionFeedback.type === 'error' ? '#721C24' : '#155724',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ {actionFeedback.text}
          </div>
        )}

        <div style={{
          display: 'flex',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 20px'
        }}>
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--color-gold)' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? 'var(--color-emerald)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px', minHeight: '460px', maxHeight: '68vh', overflowY: 'auto' }}>
          
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
                      style={{ width: '100%', padding: '12px' }}
                    >
                      <Upload size={16} />
                      {isProcessing ? 'Uploading Logo...' : 'Upload & Set Active Logo'}
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

                  <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>
                    Save Branding Text
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
                    <video src={sectionMedia.hero.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img 
                      src={sectionMedia.hero ? sectionMedia.hero.url : '/assets/hero_resort_villa.png'} 
                      alt="Hero View" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  <span className="badge-gold" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {sectionMedia.hero ? `Custom Upload (${sectionMedia.hero.mediaType.toUpperCase()})` : 'Default Resort Villa Image'}
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
                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
                    <Upload size={16} /> {isProcessing ? 'Uploading Hero Media...' : 'Upload & Set Hero Background'}
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
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>Save Hero Text</button>
              </form>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ maxWidth: '840px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                About Section Resort Full View Video & Story
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Add or change the 73 Hills Resort full view video tour. Upload an MP4/WebM video file from your device OR paste a YouTube / Video link.
              </p>

              <div style={{ marginBottom: '28px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#0D2116' }}>
                <div style={{ height: '260px', position: 'relative' }}>
                  {sectionMedia.about?.customUrl && (sectionMedia.about.customUrl.includes('youtube.com') || sectionMedia.about.customUrl.includes('youtu.be')) ? (
                    <iframe 
                      src={sectionMedia.about.customUrl.replace('watch?v=', 'embed/')} 
                      title="About Video Preview" 
                      style={{ width: '100%', height: '100%', border: 'none' }} 
                    />
                  ) : sectionMedia.about?.mediaType === 'video' || (!sectionMedia.about && true) ? (
                    <video 
                      src={sectionMedia.about?.url || 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-resort-in-the-forest-42407-large.mp4'} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <img 
                      src={sectionMedia.about ? sectionMedia.about.url : '/assets/about_sandalwood_path.png'} 
                      alt="About Showcase" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  <span className="badge-gold" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                    {sectionMedia.about ? `Active Custom (${sectionMedia.about.mediaType.toUpperCase()})` : 'Default Resort Drone Video'}
                  </span>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#132E1F', color: '#FFF' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    {sectionMedia.about ? `Active Source: ${sectionMedia.about.fileName || sectionMedia.about.customUrl || 'Uploaded File'}` : 'Default 73 Hills 73-Acres Drone Video Tour'}
                  </span>
                  {sectionMedia.about && (
                    <button onClick={handleResetAboutMedia} style={{ padding: '6px 14px', backgroundColor: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset to Default Video
                    </button>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-gold)', marginBottom: '24px' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                  Option A: Upload Resort Video or Photo from Device
                </h5>
                <form onSubmit={handleUploadAboutMedia}>
                  <div className="form-group">
                    <input 
                      id="about-file-input"
                      type="file" 
                      accept="video/*,image/*"
                      required 
                      className="form-input" 
                      onChange={(e) => setAboutFile(e.target.files[0])} 
                    />
                  </div>
                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
                    <Upload size={16} /> {isProcessing ? 'Uploading File...' : 'Upload & Save Resort Video File'}
                  </button>
                </form>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-emerald)' }}>
                  Option B: Or Enter Video Link (YouTube, Vimeo, MP4 URL)
                </h5>
                <form onSubmit={handleSaveAboutVideoUrl}>
                  <div className="form-group">
                    <input 
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="form-input"
                      value={aboutVideoUrlInput}
                      onChange={(e) => setAboutVideoUrlInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isProcessing} className="btn-outline-dark" style={{ width: '100%', padding: '10px' }}>
                    Save & Set Video Link
                  </button>
                </form>
              </div>

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
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>Save About Story Text</button>
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
                    <button type="submit" disabled={isProcessing} className="btn-gold" style={{ padding: '10px 24px' }}>
                      {isProcessing ? 'Saving...' : editingRoom ? 'Save Room Changes' : 'Create & Publish Room'}
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
                    <video src={sectionMedia.celebrations.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img 
                      src={sectionMedia.celebrations ? sectionMedia.celebrations.url : '/assets/celebration_wedding_lawn.png'} 
                      alt="Celebration Showcase" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  <span className="badge-gold" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {sectionMedia.celebrations ? `Custom Media (${sectionMedia.celebrations.mediaType.toUpperCase()})` : 'Default Wedding Lawn'}
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
                  <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
                    <Upload size={16} /> {isProcessing ? 'Uploading...' : 'Upload & Set Celebration Media'}
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
                <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>Save Celebration Content</button>
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

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="btn-gold" 
                    style={{ padding: '12px 28px' }}
                  >
                    <Upload size={16} />
                    {isProcessing ? 'Saving to Database...' : 'Upload File to Gallery'}
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

              <button type="submit" className="btn-gold" style={{ padding: '12px 28px' }}>
                Save Contact & Location Details
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
                  <Check size={18} /> SAVE POLICIES & UPDATE ALL RECEIPTS
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

