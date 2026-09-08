import React, { useState } from 'react';
import { 
  X, CheckCircle, 
  ArrowRight, CreditCard, Smartphone, Building2, Lock, Download, 
  QrCode, Check, ChevronRight, RefreshCw
} from 'lucide-react';
import { getStoredBookings, saveStoredBookings } from '../utils/storage';

export default function BookingModal({ isOpen, onClose, selectedRoom, rooms = [], settings = {} }) {
  const defaultRoom = selectedRoom || rooms[0] || {};
  const [chosenRoomId, setChosenRoomId] = useState(defaultRoom.id || '');
  const [checkIn, setCheckIn] = useState('2026-09-20');
  const [checkOut, setCheckOut] = useState('2026-09-22');
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  
  // Step state: 1 = Details Form, 2 = Payment Gateway, 3 = Confirmation Receipt
  const [currentStep, setCurrentStep] = useState(1);
  const [activeBookingId, setActiveBookingId] = useState('');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'resort'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen) return null;

  const activeRoom = rooms.find(r => r.id === chosenRoomId) || defaultRoom;

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch(e) {
      return 1;
    }
  };

  const nights = calculateNights();
  const roomBasePrice = activeRoom.price || 4999;
  const baseCapacity = activeRoom.baseGuests || 2;
  const extraGuestPrice = activeRoom.extraGuestPrice || 800;
  
  const extraGuestsCount = Math.max(0, Number(guests) - baseCapacity);
  const baseRoomTotal = roomBasePrice * nights;
  const extraGuestsTotal = extraGuestsCount * extraGuestPrice * nights;
  const subtotal = baseRoomTotal + extraGuestsTotal;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;

  // Step 1: Save details, create Pending booking record in Admin storage, and proceed to payment
  const handleSaveDetails = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill in your name, email, and mobile number.');
      return;
    }

    const bookingRefId = activeBookingId || ('BK-' + Math.floor(100000 + Math.random() * 900000));
    setActiveBookingId(bookingRefId);

    const pendingRecord = {
      id: bookingRefId,
      guestName: guestName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roomName: activeRoom.name,
      roomId: activeRoom.id,
      checkIn,
      checkOut,
      nights,
      guests: Number(guests),
      baseAmount: baseRoomTotal,
      extraGuestAmount: extraGuestsTotal,
      taxAmount: tax,
      totalAmount: grandTotal,
      status: 'Pending',
      paymentStatus: 'Payment Pending',
      paymentMethod: 'Checkout in Progress',
      transactionId: 'Awaiting Payment',
      specialRequest: specialRequest.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      savedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    // Save immediately into storage so it instantly appears in Admin Panel Pending Section
    const existing = getStoredBookings();
    const filtered = existing.filter(b => b.id !== bookingRefId);
    saveStoredBookings([pendingRecord, ...filtered]);

    setCurrentStep(2); // Proceed to Payment Gateway Step
  };

  // Step 2: Process payment and update status from Pending -> Confirmed
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const generatedTxnId = 'TXN_' + (paymentMethod === 'upi' ? 'UPI_' : paymentMethod === 'card' ? 'CC_' : 'NB_') + Math.floor(10000000 + Math.random() * 90000000);
      const bookingRefId = activeBookingId || ('BK-' + Math.floor(100000 + Math.random() * 900000));
      
      const confirmedRecord = {
        id: bookingRefId,
        guestName: guestName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        roomName: activeRoom.name,
        roomId: activeRoom.id,
        checkIn,
        checkOut,
        nights,
        guests: Number(guests),
        baseAmount: baseRoomTotal,
        extraGuestAmount: extraGuestsTotal,
        taxAmount: tax,
        totalAmount: grandTotal,
        status: 'Confirmed',
        paymentStatus: paymentMethod === 'resort' ? 'Pending (Pay at Check-In)' : 'Paid',
        paymentMethod: paymentMethod === 'upi' 
          ? `UPI (${upiId || 'Google Pay / PhonePe'})` 
          : paymentMethod === 'card' 
            ? `Card (Ending ${cardNumber.slice(-4) || '4242'})` 
            : paymentMethod === 'netbanking' 
              ? `Net Banking (${selectedBank})` 
              : 'Pay on Arrival / Resort Front Desk',
        transactionId: generatedTxnId,
        specialRequest: specialRequest.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        confirmedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      const existing = getStoredBookings();
      const updated = existing.map(b => b.id === bookingRefId ? confirmedRecord : b);
      if (!updated.some(b => b.id === bookingRefId)) {
        updated.unshift(confirmedRecord);
      }
      saveStoredBookings(updated);
      setConfirmedBooking(confirmedRecord);
      setIsProcessingPayment(false);
      setCurrentStep(3); // Receipt confirmation step
    }, 1200);
  };

  // Single-Page Clean Printable Tax Invoice & Policies Generator
  const handlePrintReceipt = () => {
    if (!confirmedBooking) return;

    const brandTitle = settings.brandName || '73 HILLS';
    const brandSub = settings.brandSubtitle || 'RESORT & REAL ESTATE';
    const resortPhone = settings.phone1 || '+91 98765 43210';
    const resortEmail = settings.email || 'hello@73hills.com';
    const resortLocation = settings.location || 'HQ3Q+HP3, Yerravaram, Andhra Pradesh 531055';
    const gstin = settings.gstin || '37AAACH7373H1Z2';
    const checkInTime = settings.checkInTime || '02:00 PM';
    const checkOutTime = settings.checkOutTime || '11:00 AM';
    const cancelPolicy = settings.cancellationPolicy || 'Free cancellation up to 48 hours prior to check-in.';
    const privPolicy = settings.privacyPolicy || 'Guest personal data and booking records are encrypted under 256-bit SSL protocols.';
    const rulesList = Array.isArray(settings.houseRules) && settings.houseRules.length > 0 ? settings.houseRules : [
      'Government-issued Photo ID (Aadhaar, Passport, or Driving License) is mandatory for all checking-in adult guests.',
      '73 Hills is an eco-preserved Sandalwood biological sanctuary. Smoking & open fires are strictly prohibited near sandalwood groves.',
      'Quiet forest sanctuary hours are observed between 10:30 PM and 6:30 AM.',
      'Swimming pool timings: 06:30 AM to 07:30 PM with standard swimwear mandatory.'
    ];

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>73 Hills Resort — Official Booking Receipt & Tax Invoice (${confirmedBooking.id})</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 10mm 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1a1a1a;
            background: #ffffff;
            font-size: 11px;
            line-height: 1.35;
            padding: 10px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #B38B59;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 800;
            color: #132E1F;
            letter-spacing: 0.05em;
          }
          .brand-sub {
            font-size: 8.5px;
            letter-spacing: 0.15em;
            color: #B38B59;
            font-weight: 700;
            text-transform: uppercase;
          }
          .resort-info {
            font-size: 9px;
            color: #555;
            margin-top: 4px;
            line-height: 1.3;
          }
          .invoice-tag {
            text-align: right;
          }
          .invoice-title {
            font-size: 15px;
            font-weight: 800;
            color: #132E1F;
            text-transform: uppercase;
          }
          .status-badge {
            display: inline-block;
            background: #E8F5E9;
            color: #2E7D32;
            border: 1px solid #A5D6A7;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 8.5px;
            font-weight: 700;
            margin-top: 4px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }
          .info-box {
            background: #F9F8F5;
            border: 1px solid #EFE7DA;
            border-radius: 4px;
            padding: 8px 10px;
          }
          .info-box-title {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #B38B59;
            margin-bottom: 4px;
            border-bottom: 1px dashed #E0D5C1;
            padding-bottom: 3px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .info-label { color: #666; font-size: 9.5px; }
          .info-val { font-weight: 700; color: #111; font-size: 9.5px; text-align: right; }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .table th {
            background: #132E1F;
            color: #FFFFFF;
            text-align: left;
            padding: 5px 8px;
            font-size: 9px;
            text-transform: uppercase;
          }
          .table td {
            padding: 5px 8px;
            border-bottom: 1px solid #EAEAEA;
            font-size: 9.5px;
          }
          .total-row {
            background: #F4EFE6;
            font-weight: 800;
            font-size: 10.5px;
            color: #132E1F;
          }
          .policies-section {
            border-top: 1.5px solid #B38B59;
            padding-top: 8px;
            margin-top: 6px;
          }
          .policy-title {
            font-size: 9.5px;
            font-weight: 800;
            color: #132E1F;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          .policy-item {
            font-size: 8px;
            color: #444;
            margin-bottom: 2px;
            padding-left: 8px;
            position: relative;
            line-height: 1.3;
          }
          .policy-item::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #B38B59;
            font-weight: bold;
          }
          .footer {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px dashed #CCC;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            color: #666;
          }
          .stamp-box {
            border: 1.5px solid #132E1F;
            padding: 4px 10px;
            border-radius: 4px;
            text-align: center;
            font-size: 8px;
            font-weight: 700;
            color: #132E1F;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">🌳 ${brandTitle}</div>
            <div class="brand-sub">${brandSub}</div>
            <div class="resort-info">
              ${resortLocation}<br/>
              Phone: ${resortPhone} | Email: ${resortEmail} | GSTIN: ${gstin}
            </div>
          </div>
          <div class="invoice-tag">
            <div class="invoice-title">Tax Invoice / Receipt</div>
            <div style="font-size: 8.5px; color: #555; margin-top: 2px;">Date: ${confirmedBooking.createdAt || new Date().toISOString().split('T')[0]}</div>
            <div class="status-badge">✓ CONFIRMED & PAID</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-box">
            <div class="info-box-title">Guest & Reservation Details</div>
            <div class="info-row"><span class="info-label">Guest Name:</span><span class="info-val">${confirmedBooking.guestName}</span></div>
            <div class="info-row"><span class="info-label">Contact Mobile:</span><span class="info-val">${confirmedBooking.phone}</span></div>
            <div class="info-row"><span class="info-label">Email Address:</span><span class="info-val">${confirmedBooking.email}</span></div>
            <div class="info-row"><span class="info-label">Reservation Ref ID:</span><span class="info-val" style="color:#B38B59;">${confirmedBooking.id}</span></div>
            <div class="info-row"><span class="info-label">Transaction ID:</span><span class="info-val">${confirmedBooking.transactionId}</span></div>
          </div>

          <div class="info-box">
            <div class="info-box-title">Stay & Accommodation Allocation</div>
            <div class="info-row"><span class="info-label">Room / Villa:</span><span class="info-val">${confirmedBooking.roomName}</span></div>
            <div class="info-row"><span class="info-label">Check-In:</span><span class="info-val">${confirmedBooking.checkIn} (From ${checkInTime})</span></div>
            <div class="info-row"><span class="info-label">Check-Out:</span><span class="info-val">${confirmedBooking.checkOut} (Until ${checkOutTime})</span></div>
            <div class="info-row"><span class="info-label">Stay Duration:</span><span class="info-val">${confirmedBooking.nights || 1} Night(s)</span></div>
            <div class="info-row"><span class="info-label">Total Guests:</span><span class="info-val">${confirmedBooking.guests} Guest(s)</span></div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty / Duration</th>
              <th style="text-align: right;">Unit Rate (₹)</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${confirmedBooking.roomName} — Luxury Villa Tariff</strong></td>
              <td style="text-align: center;">${confirmedBooking.nights || 1} Night(s)</td>
              <td style="text-align: right;">₹${Math.round((confirmedBooking.baseAmount || 0) / (confirmedBooking.nights || 1)).toLocaleString('en-IN')}</td>
              <td style="text-align: right;">₹${(confirmedBooking.baseAmount || 0).toLocaleString('en-IN')}</td>
            </tr>
            ${(confirmedBooking.extraGuestAmount || 0) > 0 ? `
            <tr>
              <td>Extra Guest Accommodation Charge</td>
              <td style="text-align: center;">${confirmedBooking.guests} Guests</td>
              <td style="text-align: right;">Dynamic</td>
              <td style="text-align: right;">₹${(confirmedBooking.extraGuestAmount || 0).toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr>
              <td>GST (18% - CGST 9% + SGST 9%)</td>
              <td style="text-align: center;">18%</td>
              <td style="text-align: right;">Tax</td>
              <td style="text-align: right;">₹${(confirmedBooking.taxAmount || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>TOTAL AMOUNT PAID:</strong></td>
              <td style="text-align: right;"><strong>₹${(confirmedBooking.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 8.5px; color: #444; margin-bottom: 8px; background: #F8F9FA; padding: 5px 8px; border-radius: 4px;">
          <strong>Payment Mode:</strong> ${confirmedBooking.paymentMethod} &bull; <strong>Status:</strong> Paid & Verified
          ${confirmedBooking.specialRequest ? `<br/><strong>Special Request:</strong> <em>"${confirmedBooking.specialRequest}"</em>` : ''}
        </div>

        <div class="policies-section">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <div class="policy-title">🌿 Resort House Rules & Eco Guidelines</div>
              ${rulesList.map(r => `<div class="policy-item">${r}</div>`).join('')}
            </div>
            <div>
              <div class="policy-title">📜 Cancellation & Refund Policy</div>
              <div class="policy-item">${cancelPolicy}</div>
              
              <div class="policy-title" style="margin-top: 4px;">🔒 Privacy & Data Protection</div>
              <div class="policy-item">${privPolicy}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>
            ${settings.receiptFooterNote || 'Thank you for choosing 73 Hills Resort. Have a serene luxury stay!'}<br/>
            Computer Generated Tax Invoice. No signature required.
          </div>
          <div class="stamp-box">
            ✓ 73 HILLS RESORT<br/>
            DIGITALLY VERIFIED
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    } else {
      window.print();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '720px', 
          width: '95%',
          maxHeight: '92vh',
          padding: 'clamp(18px, 4vw, 32px)',
          overflowY: 'auto'
        }}
      >
        
        {/* Close button */}
        <button 
          onClick={onClose}
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
            color: 'var(--text-main)',
            zIndex: 10
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Multi-step progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: currentStep >= 1 ? 'var(--color-emerald)' : 'var(--text-light)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: currentStep >= 1 ? 'var(--color-gold)' : '#DDD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
            Details
          </div>
          <ChevronRight size={13} color="#B38B59" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: currentStep >= 2 ? 'var(--color-emerald)' : 'var(--text-light)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: currentStep >= 2 ? 'var(--color-gold)' : '#DDD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
            Payment
          </div>
          <ChevronRight size={13} color="#B38B59" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: currentStep >= 3 ? 'var(--color-emerald)' : 'var(--text-light)' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: currentStep >= 3 ? 'var(--color-gold)' : '#DDD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
            Receipt
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: GUEST DETAILS & DATES FORM */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="section-subtitle">
              RESERVE YOUR STAY
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', marginTop: '4px', marginBottom: '18px', color: 'var(--color-emerald)' }}>
              Book Your Luxury Cottage
            </h2>

            <form onSubmit={handleSaveDetails}>
              
              {/* Select Villa/Room */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Choose Accommodations</label>
                <select 
                  className="form-select" 
                  value={chosenRoomId} 
                  onChange={(e) => setChosenRoomId(e.target.value)}
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ₹{r.price?.toLocaleString('en-IN')}/night (Base: {r.baseGuests || 2} Guests)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Check-In Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Check-Out Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Number of Guests</label>
                  <select 
                    className="form-select" 
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10].map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''} {num > baseCapacity ? `(+₹${extraGuestPrice}/extra)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Karthikeya Varma"
                  className="form-input" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="karthikeya@example.com"
                    className="form-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Enter mobile number"
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Special Requests (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Late check-in, Sandalwood candlelight dinner setup"
                  className="form-input" 
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                />
              </div>

              {/* Price Calculation Summary */}
              <div style={{
                backgroundColor: 'var(--bg-cream)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Base Rate: ₹{roomBasePrice.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}</span>
                  <span>₹{baseRoomTotal.toLocaleString('en-IN')}</span>
                </div>

                {extraGuestsCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Extra Guests ({extraGuestsCount} extra × ₹{extraGuestPrice} × {nights}N)</span>
                    <span>₹{extraGuestsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>GST & Resort Luxury Tax (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-emerald)', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  <span>Total Payable</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700' }}>
                SAVE DETAILS & PROCEED TO PAYMENT <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PAYMENT GATEWAY CHECKOUT SCREEN ("PAY WITH MONEY") */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge-gold">SECURE PAYMENT GATEWAY</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
                  Complete Your Payment
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL AMOUNT</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-emerald)', fontWeight: '700' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Order Summary Strip */}
            <div style={{
              backgroundColor: '#F7F4EE',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              marginBottom: '20px'
            }}>
              <div><strong>{activeRoom.name}</strong> • {nights} Night{nights > 1 ? 's' : ''} ({guests} Guest{guests > 1 ? 's' : ''})</div>
              <div>Dates: {checkIn} to {checkOut}</div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'upi', label: 'UPI / QR', icon: <Smartphone size={18} /> },
                { id: 'card', label: 'Cards', icon: <CreditCard size={18} /> },
                { id: 'netbanking', label: 'NetBanking', icon: <Building2 size={18} /> },
                { id: 'resort', label: 'Pay on Arrival', icon: <Check size={18} /> }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: paymentMethod === m.id ? 'var(--color-gold)' : 'var(--border-light)',
                    backgroundColor: paymentMethod === m.id ? '#FFFFFF' : 'var(--bg-cream)',
                    color: paymentMethod === m.id ? 'var(--color-emerald)' : 'var(--text-muted)',
                    fontWeight: paymentMethod === m.id ? '700' : '500',
                    fontSize: '0.78rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: paymentMethod === m.id ? '0 2px 8px rgba(179, 139, 89, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {/* Payment Form Container */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: 'clamp(16px, 3vw, 24px)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>

              {/* UPI Option */}
              {paymentMethod === 'upi' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Smartphone size={20} color="#B38B59" />
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Instant UPI Apps & QR Code</h4>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Simulated QR Code */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#F8F9FA',
                      border: '2px dashed var(--color-gold)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '8px'
                    }}>
                      <QrCode size={56} color="#132E1F" />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                        Scan & Pay ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ flexGrow: 1, minWidth: '220px' }}>
                      <label className="form-label">Or Enter your UPI ID (VPA)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. karthikeya@okhdfcbank or yourname@upi"
                        className="form-input" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Supports Google Pay, PhonePe, Paytm, BHIM & all Indian UPI handles.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Option */}
              {paymentMethod === 'card' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <CreditCard size={20} color="#B38B59" />
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Credit / Debit Card (Visa, Mastercard, RuPay)</h4>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4532 •••• •••• 8921"
                      className="form-input" 
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="08/29" 
                        maxLength={5}
                        className="form-input" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV / CVC</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        maxLength={4}
                        className="form-input" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Name on card"
                      className="form-input" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* NetBanking Option */}
              {paymentMethod === 'netbanking' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Building2 size={20} color="#B38B59" />
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Direct Net Banking</h4>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Your Bank</label>
                    <select 
                      className="form-select"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Pay on Arrival Option */}
              {paymentMethod === 'resort' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle size={20} color="#28A745" />
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#155724' }}>Pay at Resort Front Desk</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Reserve your villa now with zero immediate payment. The full amount of <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> can be settled upon check-in at 73 Hills Resort front desk via Cash, Card, or UPI.
                  </p>
                </div>
              )}

            </div>

            {/* Security Guarantee Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px', justifyContent: 'center' }}>
              <Lock size={14} color="#28A745" />
              <span>256-Bit SSL Encrypted • Razorpay / Bank Verified Secure Payment Portal</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-outline-dark"
                style={{ flex: '1', padding: '14px' }}
              >
                ← Back to Details
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessPayment}
                className="btn-gold"
                style={{ flex: '2', padding: '14px', fontSize: '1rem', fontWeight: '700' }}
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    PAY ₹{grandTotal.toLocaleString('en-IN')} & CONFIRM →
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: OFFICIAL LUXURY CONFIRMED RECEIPT */}
        {/* ========================================================= */}
        {currentStep === 3 && confirmedBooking && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: '#EBF7EE',
              border: '2px solid #28A745',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle size={44} color="#28A745" />
            </div>

            <span className="badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>
              BOOKING CONFIRMED & PAID
            </span>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: 'var(--color-emerald)', marginBottom: '6px' }}>
              We're Excited to Welcome You!
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your reservation reference ID is <strong>{confirmedBooking.id}</strong>. A tax receipt and confirmation email have been sent to <strong>{confirmedBooking.email}</strong>.
            </p>

            {/* Itemized Receipt Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'left',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>RESERVATION ID</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-emerald)' }}>{confirmedBooking.id}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TRANSACTION ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{confirmedBooking.transactionId}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>GUEST NAME</span>
                  <strong>{confirmedBooking.guestName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PHONE / CONTACT</span>
                  <strong>{confirmedBooking.phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ROOM / VILLA</span>
                  <strong>{confirmedBooking.roomName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>GUESTS & DURATION</span>
                  <strong>{confirmedBooking.guests} Guests • {nights} Night{nights > 1 ? 's' : ''}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CHECK-IN / OUT</span>
                  <strong>{confirmedBooking.checkIn} to {confirmedBooking.checkOut}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PAYMENT METHOD</span>
                  <strong style={{ color: 'var(--color-gold)' }}>{confirmedBooking.paymentMethod}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed var(--border-light)' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-emerald)' }}>Total Amount Paid (Tax Incl.)</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-emerald)', fontFamily: 'var(--font-serif)' }}>
                  ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Resort Policies & Rules Preview Box */}
            <div style={{
              backgroundColor: 'var(--bg-cream)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📜 Resort Rules & Guest Policies
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: '700' }}>
                  Check-in: {settings.checkInTime || '02:00 PM'} &bull; Check-out: {settings.checkOutTime || '11:00 AM'}
                </span>
              </div>

              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                {(settings.houseRules || [
                  'Government Photo ID required for all checking-in guests.',
                  'Sandalwood Eco-Sanctuary: Smoking strictly prohibited near plantation groves.',
                  'Quiet forest sanctuary hours: 10:30 PM to 06:30 AM.'
                ]).slice(0, 3).map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{rule}</li>
                ))}
              </ul>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                <strong>Cancellation Policy:</strong> {settings.cancellationPolicy || 'Free cancellation up to 48 hours prior to check-in.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handlePrintReceipt}
                className="btn-outline-dark" 
                style={{ flex: 1, padding: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={16} /> Print 1-Page Official Receipt
              </button>

              <button 
                onClick={onClose} 
                className="btn-gold" 
                style={{ flex: 2, padding: '12px' }}
              >
                RETURN TO RESORT HOME
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
