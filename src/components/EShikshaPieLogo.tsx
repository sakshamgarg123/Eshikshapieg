import React from 'react';

interface LogoProps {
  className?: string;
  size?: number; // width and height in px
}

export function EShikshaPieLogoIcon({ className = '', size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-30 -30 460 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="blueSwooshGrad" x1="100" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A2E8" />
          <stop offset="50%" stopColor="#0072BC" />
          <stop offset="100%" stopColor="#0A3C63" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.25"/>
        </filter>
        <filter id="piShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Outer Red Ring with elegant brush tapered effect at top-right and bottom-right */}
      <path
        d="M 280 20 A 185 185 0 1 0 355 270"
        stroke="#E51E25"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
        filter="url(#logoShadow)"
      />
      <path
        d="M 355 270 C 375 230, 390 150, 310 70"
        stroke="#E51E25"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        filter="url(#logoShadow)"
      />
      
      <path
        d="M 90 120 
           C 160 30, 320 40, 360 180 
           C 390 290, 290 350, 240 330 
           C 330 300, 360 210, 310 140
           C 270 85, 170 80, 90 120 Z"
        fill="url(#blueSwooshGrad)"
        filter="url(#logoShadow)"
      />

      {/* Central Dark Blue Premium Pi (π) Symbol, carefully bezier-curved to match the logo */}
      <path
        d="M 125 118 
           C 145 114, 255 114, 285 118 
           C 305 120, 315 130, 312 142 
           C 309 154, 290 155, 275 152 
           C 255 150, 248 152, 245 160
           L 245 230
           C 245 280, 235 300, 265 300 
           C 285 300, 295 285, 300 270 
           C 303 260, 312 260, 312 270 
           C 308 295, 285 322, 250 322 
           C 205 322, 203 285, 203 245
           L 203 160
           C 203 150, 195 150, 185 150
           L 155 150
           C 145 150, 137 160, 137 175
           C 137 215, 139 255, 135 285
           C 132 305, 120 322, 110 322
           C 100 322, 98 312, 102 300
           C 112 270, 115 220, 113 175
           L 110 145
           C 108 130, 115 120, 125 118 Z"
        fill="#002D53"
        filter="url(#piShadow)"
      />
    </svg>
  );
}

export function EShikshaPieLogoText({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-baseline font-sans select-none ${className}`}>
      {/* Script-like styled e */}
      <span className="text-3xl font-bold font-serif italic text-[#134975] mr-1.5 transform -rotate-6 inline-block">
        e
      </span>
      {/* Clean, primary Shiksha tag */}
      <span className="text-2xl font-black text-[#0072BC] tracking-normal font-sans">
        Shiksha
      </span>
      {/* Red, bright Pie tag with a subtle representation of books above the P */}
      <span className="relative ml-1">
        {/* Abstract mini books badge above "Pie" */}
        <span className="absolute -top-[13px] right-2 flex space-x-0.5 transform -rotate-12 opacity-95">
          <span className="w-1.5 h-3 bg-red-500 rounded-xs border-r border-white/20"></span>
          <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs transform translate-y-[-2px] border-r border-white/20"></span>
          <span className="w-1.5 h-3 bg-amber-500 rounded-xs border-r border-white/20"></span>
          <span className="w-1.5 h-2.5 bg-blue-500 rounded-xs transform translate-y-[1px] border-r border-white/20"></span>
        </span>
        <span className="text-2xl font-bold font-sans text-[#E51E25]">
          Pie
        </span>
      </span>
    </div>
  );
}

export function EShikshaPieFullBrand({ className = '', iconSize = 42 }: { className?: string; iconSize?: number }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <EShikshaPieLogoIcon size={iconSize} />
      <EShikshaPieLogoText />
    </div>
  );
}

export function EShikshaPieCourseBrand({ 
  courseName = 'Arjuna', 
  className = '', 
  iconSize = 52,
  isDark = true 
}: { 
  courseName?: string; 
  className?: string; 
  iconSize?: number;
  isDark?: boolean;
}) {
  // Extract or map default courses to beautiful displays
  let cleanCourse = courseName || 'Arjuna';
  // If the course matches code names like ANVI-24 or VIKA-24, we can map to beautiful names or display them
  if (cleanCourse === 'ANVI-24') {
    cleanCourse = 'Arjuna'; 
  } else if (cleanCourse === 'VIKA-24') {
    cleanCourse = 'Vikas';
  } else if (cleanCourse === 'abhedya_gurukul') {
    cleanCourse = 'Abhedya Gurukul';
  }
  
  if (!isDark) {
    const isArjuna = cleanCourse.toLowerCase().includes('arjuna');
    const displaySpaced = isArjuna ? 'a r j u n a' : cleanCourse.toLowerCase().split('').join(' ');
    
    return (
      <div className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl select-none bg-white shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-gray-100 ${className}`}>
        <div className="relative shrink-0 flex items-center justify-center">
          <EShikshaPieLogoIcon size={iconSize + 10} />
        </div>
        <div className="flex flex-col text-left justify-center pl-1">
          <EShikshaPieLogoText />
          <div className="mt-1 flex items-center">
            <span className={`text-[19px] font-bold ${isArjuna ? 'text-[#E51E25] font-serif italic tracking-[0.2em]' : 'text-[#E51E25] tracking-[0.3em] font-sans'} uppercase leading-none block`}>
              {displaySpaced}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const spaced = cleanCourse.toUpperCase().split('').join(' ');

  return (
    <div className={`inline-flex items-center gap-4 px-5 py-3 rounded-xl border select-none bg-black border-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.8)] ${className}`}>
      {/* Circle Icon Group with high styling resemblance */}
      <div className="relative shrink-0 flex items-center justify-center p-0.5 rounded-full bg-black">
        <EShikshaPieLogoIcon size={iconSize} />
      </div>

      {/* Text block with eShikshaPie on top, andspaced course name below */}
      <div className="flex flex-col text-left justify-center pl-1">
        <EShikshaPieLogoText />
        <div className="mt-1 flex items-center">
          {/* Subtle horizontal alignment spaces */}
          <span className="text-[12px] font-black italic text-[#E51E25] tracking-[0.4em] uppercase leading-none font-sans block">
            {spaced}
          </span>
        </div>
      </div>
    </div>
  );
}

