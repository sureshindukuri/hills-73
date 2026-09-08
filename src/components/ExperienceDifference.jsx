import React from 'react';
import { Trees, Home, Wine, Sparkles } from 'lucide-react';
import { SandalwoodLeafMotif, SandalwoodSketchTree } from './SandalwoodGraphics';

export default function ExperienceDifference() {
  const highlights = [
    {
      icon: <Trees size={30} color="#B38B59" />,
      title: 'Surrounded by Nature',
      description: '73 acres of lush greenery with rare red sandalwood trees.'
    },
    {
      icon: <Home size={30} color="#B38B59" />,
      title: 'Luxury Stay',
      description: 'Elegant cottages and premium amenities for a comfortable stay.'
    },
    {
      icon: <Wine size={30} color="#B38B59" />,
      title: 'Perfect Celebrations',
      description: 'Ideal venue for weddings, parties and corporate events.'
    },
    {
      icon: <Sparkles size={30} color="#B38B59" />,
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
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Header Block with Flanking Sandalwood Graphic Trees */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px', 
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
          <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '8px', letterSpacing: '0.02em' }}>
            EXPERIENCE THE DIFFERENCE
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 0 0' }}>
            <SandalwoodLeafMotif size={24} color="#B38B59" />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {highlights.map((item, idx) => (
            <div 
              key={idx}
              className="luxury-card"
              style={{
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-cream)',
                border: '1px solid var(--border-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {item.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '8px'
              }}>
                {item.title}
              </h3>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55
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



