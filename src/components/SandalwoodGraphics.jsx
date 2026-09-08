import React from 'react';

/**
 * High-Definition Botanical Sandalwood Artwork Asset Component
 * Renders a ultra-luxurious 4K Sandalwood illustration with gold frame accents.
 */
export const SandalwoodBotanicalArt = ({ className = "", width = 320, height = 360, shadow = true }) => {
  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: shadow ? '0 12px 30px rgba(19, 46, 31, 0.12)' : 'none',
        border: '1px solid var(--color-gold)',
        backgroundColor: '#FAF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <img 
        src="/assets/sandalwood_botanical_graphic.png" 
        alt="Sandalwood Botanical Illustration"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
};

/**
 * Enhanced High-Visibility Vector SVG Graphic of Sandalwood Plant Branch
 * Features rich warm bronze-gold gradient strokes and filled leaves.
 */
export const SandalwoodBranchGraphic = ({ className = "", width = 320, height = 380, opacity = 1 }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 320 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, filter: 'drop-shadow(0px 4px 10px rgba(179, 139, 89, 0.25))' }}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C7A778" />
          <stop offset="50%" stopColor="#B38B59" />
          <stop offset="100%" stopColor="#8C6536" />
        </linearGradient>
        <linearGradient id="leafFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#132E1F" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#B38B59" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Main Curved Sandalwood Stem */}
      <path 
        d="M260 380 Q 200 260 160 160 Q 120 80 60 20" 
        stroke="url(#goldGradient)" 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />
      <path 
        d="M160 160 Q 220 110 280 80" 
        stroke="url(#goldGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M110 230 Q 40 180 10 120" 
        stroke="url(#goldGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M210 250 Q 270 230 310 190" 
        stroke="url(#goldGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />

      {/* Top Leaves Cluster */}
      <g>
        <path d="M60 20 Q 30 15 25 45 Q 50 50 60 20 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M60 20 Q 90 5 102 30 Q 82 52 60 20 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M60 20 Q 50 -5 60 -18 Q 72 -5 60 20 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
      </g>

      {/* Sandalwood Leaves - Left Branch */}
      <g>
        <path d="M10 120 Q -15 95 0 70 Q 25 82 10 120 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M10 120 Q 30 95 48 102 Q 35 125 10 120 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M40 180 Q 12 155 24 130 Q 48 150 40 180 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M65 198 Q 82 175 100 185 Q 88 208 65 198 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
      </g>

      {/* Sandalwood Leaves - Right Upper Branch */}
      <g>
        <path d="M280 80 Q 305 55 320 72 Q 302 95 280 80 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M280 80 Q 280 102 258 108 Q 258 85 280 80 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M220 110 Q 250 88 262 105 Q 238 128 220 110 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M190 132 Q 172 110 190 92 Q 208 110 190 132 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
      </g>

      {/* Sandalwood Leaves - Main Mid Section */}
      <g>
        <path d="M160 160 Q 125 135 138 108 Q 166 130 160 160 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="2" />
        <path d="M160 160 Q 195 168 200 195 Q 172 188 160 160 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="2" />
        <path d="M210 250 Q 245 225 262 248 Q 232 272 210 250 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
        <path d="M260 215 Q 285 192 302 208 Q 285 232 260 215 Z" fill="url(#leafFill)" stroke="url(#goldGradient)" strokeWidth="1.8" />
      </g>

      {/* Sandalwood Flowers / Berries Details */}
      <g fill="url(#goldGradient)">
        <circle cx="160" cy="90" r="4.5" />
        <circle cx="175" cy="80" r="3.5" />
        <circle cx="145" cy="100" r="4" />
        <circle cx="270" cy="150" r="4.5" />
        <circle cx="285" cy="140" r="3.5" />
      </g>
    </svg>
  );
};

/**
 * Sandalwood Leaf Motif for section banners and headers
 */
export const SandalwoodLeafMotif = ({ size = 32, color = "#B38B59" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 36 C20 36 6 26 6 16 C6 8.268 12.268 2 20 2 C27.732 2 34 8.268 34 16 C34 26 20 36 20 36 Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.18" />
    <path d="M20 36 L20 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M20 20 Q 28 14 30 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M20 25 Q 12 19 10 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Majestic Sandalwood Tree Logo Icon
 */
export const SandalwoodTreeLogo = ({ size = 42, color = "#B38B59" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Ring */}
    <circle cx="30" cy="30" r="28" stroke={color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
    
    {/* Tree Crown */}
    <path d="M30 8 C18 8 10 18 10 28 C10 36 16 42 24 45 L24 52 L36 52 L36 45 C44 42 50 36 50 28 C50 18 42 8 30 8 Z" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.8" />
    
    {/* Tree Branches & Trunk */}
    <path d="M30 52 L30 25 M30 35 L20 25 M30 35 L40 25 M30 28 L22 18 M30 28 L38 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    
    {/* Foliage Ornaments */}
    <circle cx="30" cy="16" r="4.5" fill={color} fillOpacity="0.4" />
    <circle cx="20" cy="24" r="4" fill={color} fillOpacity="0.4" />
    <circle cx="40" cy="24" r="4" fill={color} fillOpacity="0.4" />
    <circle cx="25" cy="32" r="3.5" fill={color} fillOpacity="0.3" />
    <circle cx="35" cy="32" r="3.5" fill={color} fillOpacity="0.3" />
  </svg>
);

/**
 * High-Definition Vintage Sandalwood Sketch Tree (Matching Reference Artwork)
 * Renders an ultra-luxurious botanical line art tree with roots, trunk & foliage.
 * Uses mix-blend-mode: multiply to blend seamlessly on cream backgrounds.
 */
/**
 * Sandalwood Tree Line-Art Graphic (No Underground Roots, Grass Base, Pure Transparent Line Art)
 */
export const SandalwoodSketchTree = ({ 
  width = 220, 
  height = 220, 
  flipped = false, 
  color = "#B38B59",
  className = "",
  style = {} 
}) => {
  return (
    <div 
      className={`sandalwood-sketch-tree-wrapper ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        transform: flipped ? 'scaleX(-1)' : 'none',
        display: 'inline-block',
        position: 'relative',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style
      }}
    >
      <img 
        src="/assets/sandalwood_grass_tree_transparent.png" 
        alt="Sandalwood Tree Botanical Line Art" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
};

/**
 * High-Definition Bamboo Plants & Grass Graphic Artwork Component
 * Renders an ultra-luxurious botanical illustration of bamboo plants with natural grass base.
 * Specially rendered with transparency and ambient luxury lighting for both Dark & Light modes.
 */
export const BambooGrassGraphic = ({
  width = '100%',
  height = 'auto',
  maxHeight = 220,
  className = "",
  style = {}
}) => {
  return (
    <div 
      className={`bamboo-grass-graphic-wrapper ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        pointerEvents: 'none',
        overflow: 'visible',
        padding: '6px 4px 2px 4px',
        ...style
      }}
    >
      {/* Radiant Golden-Emerald Ambient Aura for Dark Theme Contrast */}
      <div className="bamboo-ambient-glow" />

      <img 
        src="/assets/bamboo_grass_luxury.png" 
        alt="73 Hills Bamboo & Botanical Grass Illustration" 
        className="bamboo-grass-graphic-img"
        style={{
          width: '100%',
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          objectFit: 'contain',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
};






