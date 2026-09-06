import React, { useState } from 'react';

interface RguktEmblemProps {
  className?: string;
}

export const RguktEmblem: React.FC<RguktEmblemProps> = ({ className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      id="rgukt-emblem-badge"
      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-[#0F5C55] via-[#0B4640] to-[#072F2B] border-2 border-amber-400/80 ring-1 ring-amber-300/40 shadow-md shadow-black/20 flex flex-col items-center justify-center shrink-0 overflow-hidden hover:scale-105 transition-transform duration-200 select-none ${className}`}
      title="Rajiv Gandhi University of Knowledge Technologies (RGUKT) - RK Valley"
    >
      {/* Subtle radial inner glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-300/15 via-transparent to-black/25 pointer-events-none" />

      {/* High-res Institutional University Emblem & Authority Badge (Default Vector) */}
      <div className="relative z-0 flex flex-col items-center justify-center w-full h-full p-0.5 leading-none">
        {/* Academic Crest Motif (Shield, Open Book, Flame) in Metallic Gold */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] shrink-0"
          aria-hidden="true"
        >
          {/* Academic Shield */}
          <path
            d="M12 2L4.5 5.2V11.5C4.5 16.5 7.8 21.2 12 22.2C16.2 21.2 19.5 16.5 19.5 11.5V5.2L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(11, 70, 64, 0.75)"
          />
          {/* Open Book of Knowledge */}
          <path
            d="M8.2 9.2C9.4 8.7 10.8 9 12 10.2C13.2 9 14.6 8.7 15.8 9.2V14.2C14.6 13.7 13.2 14 12 15.2C10.8 14 9.4 13.7 8.2 14.2V9.2Z"
            stroke="#FFFFFF"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 255, 255, 0.25)"
          />
          {/* Wisdom Torch Flame */}
          <path
            d="M12 6C12.4 6.7 12.8 7.1 12.5 7.8C12.2 8.2 11.8 8.2 11.5 7.8C11.2 7.1 11.6 6.7 12 6Z"
            fill="#FBBF24"
          />
        </svg>

        {/* RGUKT Authoritative Typography */}
        <span className="font-serif tracking-wider text-[9.5px] sm:text-[10.5px] font-bold text-white mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          RGUKT
        </span>

        {/* RKV Accent Sub-Badge / Gold Pill */}
        <span className="mt-0.5 px-1 py-[0.5px] rounded-full bg-amber-400/20 border border-amber-300/40 text-[7px] sm:text-[8px] font-semibold text-amber-300 tracking-widest uppercase leading-none shadow-2xs">
          RKV
        </span>
      </div>

      {/* Support for Real University Logo File with Graceful Fallback */}
      {!imageFailed && (
        <img
          src="/rgukt-logo.png"
          alt="RGUKT RKV Official Logo"
          className={`absolute inset-0 w-full h-full object-contain p-1 rounded-lg z-10 bg-[#072F2B] transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            setImageFailed(true);
          }}
        />
      )}
    </div>
  );
};
