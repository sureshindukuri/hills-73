import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactSection({ settings }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Direct routing to owner's number: 9948445143
    const ownerRaw = settings?.phone1 || '9948445143';
    const cleanDigits = ownerRaw.replace(/[^0-9]/g, '');
    const recipientPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    const messageText = `🌿 *New Website Inquiry - 73 Hills Resort* 🌿\n\n` +
      `👤 *Guest Name:* ${formData.name.trim()}\n` +
      `✉️ *Email:* ${formData.email.trim()}\n` +
      `📞 *Phone / Contact:* ${formData.phone?.trim() || 'Not provided'}\n\n` +
      `💬 *Inquiry Message:* \n"${formData.message.trim()}"`;

    const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(messageText)}`;

    // Open WhatsApp directly to send message to owner
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 6000);
  };

  return (
    <section id="contact" style={{ padding: '100px 0', backgroundColor: 'var(--bg-cream)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="section-subtitle" style={{ justifyContent: 'center' }}>
            GET IN TOUCH
          </div>
          <h2 className="section-title">
            We'd Love to Hear From You
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Contact Details List (Left Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            {/* Email */}
            <div className="luxury-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-cream)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={20} color="#B38B59" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>
                  OFFICIAL EMAIL
                </span>
                <a href={`mailto:${settings?.email || 'hello@73hills.com'}`} style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none', marginTop: '2px' }}>
                  {settings?.email || 'hello@73hills.com'}
                </a>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct Concierge Desk</span>
              </div>
            </div>

            {/* Location */}
            <div className="luxury-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-cream)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={20} color="#B38B59" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>
                  RESORT LOCATION
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '2px', lineHeight: 1.4 }}>
                  {settings?.location || 'HQ3Q+HP3, Yerravaram, Andhra Pradesh 531055'}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>73 Acres Sandalwood Sanctuary</span>
              </div>
            </div>

          </div>

          {/* Form Card (Right Side) */}
          <div className="luxury-card" style={{ padding: '36px', backgroundColor: '#FFFFFF' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 size={56} color="#28A745" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-emerald)', marginBottom: '8px' }}>
                  Inquiry Forwarded Directly to Owner!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto' }}>
                  WhatsApp has opened with your message ready to send directly to the owner (+91 9948445143). Our team will connect with you promptly!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="John Doe"
                      className="form-input" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="john@example.com"
                      className="form-input" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="Your contact or WhatsApp number"
                    className="form-input" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="Tell us about your trip dates or event requirements..."
                    className="form-textarea" 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-gold" style={{ width: '100%', padding: '14px' }}>
                  <Send size={16} /> SEND MESSAGE
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
