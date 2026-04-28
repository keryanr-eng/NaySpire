// EMBERVOW — massive, legible stat plaques.
// Designed for the top HUD: HP bar, Ember orb, Ward shield.
// Goal: every stat is readable at a glance from across the room.

import React from 'react';

// ---------- HP Plaque ----------

export const HPPlaque: React.FC<{ hp: number; max: number; label?: string }> = ({ hp, max, label }) => {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));
  const low = pct <= 30;
  return (
    <div className="relative flex flex-col items-stretch min-w-[320px]">
      {label && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-ash-900 border border-vow-gold/70 rounded text-[10px] uppercase tracking-[0.25em] text-vow-gold font-display z-10">
          {label}
        </div>
      )}
      <div className="relative h-12 rounded-lg border-2 border-vow-gold/80 bg-gradient-to-b from-ash-900 to-black overflow-hidden shadow-2xl"
           style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(212,162,76,0.35), inset 0 -6px 10px rgba(0,0,0,0.6)' }}>
        {/* Heart icon in notch */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-vow-blood/80 border border-vow-gold/70 flex items-center justify-center text-ash-100 text-lg z-10 shadow-inner">
          ♥
        </div>
        {/* Fill */}
        <div className={[
          'absolute inset-y-0 left-0 transition-[width] duration-300',
          low ? 'animate-pulse' : '',
        ].join(' ')}
             style={{
               width: `${pct}%`,
               background: low
                 ? 'linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)'
                 : 'linear-gradient(90deg, #8b1e2b 0%, #c2410c 55%, #fb923c 100%)',
               boxShadow: 'inset 0 -8px 14px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15)',
             }} />
        {/* tick marks */}
        <div className="absolute inset-0 flex opacity-20 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-ash-100/30 last:border-0" />
          ))}
        </div>
        {/* BIG HP NUMBERS */}
        <div className="absolute inset-0 flex items-center justify-center pl-8">
          <span className="font-display font-bold text-ash-100 text-2xl tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
            {hp}<span className="text-ash-300 mx-1">/</span>{max}
          </span>
        </div>
      </div>
    </div>
  );
};

// ---------- Ember (PA) Plaque ----------

export const EmberPlaque: React.FC<{ ember: number; max: number }> = ({ ember, max }) => {
  const spent = ember <= 0;
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute -top-3 px-2 py-0.5 bg-ash-900 border border-vow-gold/70 rounded text-[10px] uppercase tracking-[0.25em] text-vow-gold font-display z-10 whitespace-nowrap">
        Braise
      </div>
      <div className={[
        'relative flex items-center justify-center rounded-full border-2 border-vow-gold/80',
        'w-16 h-16',
        spent ? '' : 'animate-ember-throb',
      ].join(' ')}
           style={{
             background: spent
               ? 'radial-gradient(circle at 35% 30%, #564a3c 0%, #2a241c 55%, #0a0908 100%)'
               : 'radial-gradient(circle at 35% 28%, #fed7aa 0%, #fb923c 28%, #c2410c 62%, #7c2d12 92%)',
             boxShadow: spent
               ? 'inset 0 0 14px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.6)'
               : 'inset 0 0 18px rgba(0,0,0,0.55), 0 0 22px rgba(249,115,22,0.55), 0 0 46px rgba(249,115,22,0.3)',
           }}>
        <span className="font-display font-bold text-3xl leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
              style={{ color: spent ? '#7a6a58' : '#1a120a' }}>
          {ember}
        </span>
      </div>
      <div className="mt-1 font-display text-ember-400 text-xs tracking-widest">
        / {max}
      </div>
    </div>
  );
};

// ---------- Ward (Shield) Plaque ----------

export const WardPlaque: React.FC<{ ward: number }> = ({ ward }) => {
  if (ward <= 0) return null;
  return (
    <div className="relative flex flex-col items-center animate-ward-appear">
      <div className="absolute -top-3 px-2 py-0.5 bg-ash-900 border border-vow-seal/70 rounded text-[10px] uppercase tracking-[0.25em] text-vow-seal font-display z-10">
        Garde
      </div>
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Shield shape */}
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full drop-shadow-[0_0_16px_rgba(76,110,212,0.6)]">
          <defs>
            <linearGradient id="wardG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93a9ea" />
              <stop offset="55%" stopColor="#4c6ed4" />
              <stop offset="100%" stopColor="#233461" />
            </linearGradient>
          </defs>
          <path d="M32 2 L58 10 L58 32 Q58 52 32 62 Q6 52 6 32 L6 10 Z" fill="url(#wardG)" stroke="#d4a24c" strokeWidth="2" />
          <path d="M32 8 L52 14 L52 32 Q52 46 32 54 Q12 46 12 32 L12 14 Z" fill="none" stroke="#d4a24c" strokeWidth="0.8" opacity="0.6" />
        </svg>
        <span className="relative font-display font-bold text-2xl text-ash-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
          {ward}
        </span>
      </div>
    </div>
  );
};

// ---------- Gold Plaque ----------

export const GoldPlaque: React.FC<{ gold: number }> = ({ gold }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vow-gold/60 bg-gradient-to-b from-ash-800 to-ash-900 shadow-lg"
       style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,162,76,0.25)' }}>
    <span className="text-vow-gold text-lg">⚜</span>
    <span className="font-display font-bold text-vow-gold text-lg leading-none">{gold}</span>
  </div>
);
