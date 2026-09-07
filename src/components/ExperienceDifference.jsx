import React from 'react';
import { Trees, Home, Wine, Sparkles } from 'lucide-react';
import { SandalwoodLeafMotif, SandalwoodSketchTree } from './SandalwoodGraphics';

export default function ExperienceDifference() {
  const highlights = [
    {
      icon: <Trees size={32} color="#B38B59" />,
      title: 'Surrounded by Nature',
      description: '73 acres of lush greenery with rare red sandalwood trees.'
    },
    {
      icon: <Home size={32} color="#B38B59" />,
      title: 'Luxury Stay',
      description: 'Elegant cottages and premium amenities for a comfortable stay.'
    },
    {
      icon: <Wine size={32} color="#B38B59" />,
      title: 'Perfect Celebrations',
      description: 'Ideal venue for weddings, parties and corporate events.'
    },
    {
      icon: <Sparkles size={32} color="#B38B59" />,
      title: 'Peace & Privacy',
      description: 'Away from the noise, close to what matters.'
    }
  ];

  return (
    <section 
      className="experience-difference-section"
      style={{ 
        padding: '70px 0 80px 0', 
        backgroundColor: 'var(--bg-cream)', 
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header Block with Flanking Sandalwood Graphic Trees */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '55px', 
          position: 'relative',
          padding: '10px 0'
        }}>
          {/* Left Flanking Sandalwood Graphic Tree */}
          <div className="experience-tree-left">
            <SandalwoodSketchTree 
              width={340} 
              height={340} 
              flipped={false} 
            />
          </div>

          {/* Right Flanking Sandalwood Graphic Tree */}
          <div className="experience-tree-right">
            <SandalwoodSketchTree 
              width={340} 
              height={340} 
              flipped={true} 
            />
          </div>

          <div className="section-subtitle" style={{ justifyContent: 'center' }}>
            WHY CHOOSE US
          </div>
          <h2 className="section-title" style={{ fontSize: '2.4rem', marginBottom: '8px', letterSpacing: '0.02em' }}>
            EXPERIENCE THE DIFFERENCE
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 0 0' }}>
            <SandalwoodLeafMotif size={26} color="#B38B59" />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {highlights.map((item, idx) => (
            <div 
              key={idx}
              className="luxury-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                position: 'relative'
              }}
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
                {item.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '10px'
              }}>
                {item.title}
              </h3>

              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}



