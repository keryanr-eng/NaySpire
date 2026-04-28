// EMBERVOW — inline SVG character portraits.
// Richer pass: layered gradients, shading, rim light, atmospheric embers.
// All portraits share a 200x280 viewBox so they scale identically.
// Palette: ash #1a120a / #2a241c, gold #d4a24c, ember #fb923c,
// seal #4c6ed4, blood #8b1e2b, bone #ecdfc3.

import React from 'react';

export interface ArtProps {
  className?: string;
}

// ---------- shared <defs> ----------

const SharedDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    {/* warm ember backlight */}
    <radialGradient id={`bg-${id}`} cx="50%" cy="65%" r="60%">
      <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
      <stop offset="40%" stopColor="#c2410c" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#0a0908" stopOpacity="0" />
    </radialGradient>
    {/* body gradient dark */}
    <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2a241c" />
      <stop offset="55%" stopColor="#15130f" />
      <stop offset="100%" stopColor="#050403" />
    </linearGradient>
    {/* cloak gradient deep red */}
    <linearGradient id={`cloak-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#5a1620" />
      <stop offset="55%" stopColor="#2a0a10" />
      <stop offset="100%" stopColor="#0c0205" />
    </linearGradient>
    {/* metal gradient */}
    <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ecdfc3" />
      <stop offset="30%" stopColor="#d4a24c" />
      <stop offset="100%" stopColor="#3a3228" />
    </linearGradient>
    {/* blade glow */}
    <linearGradient id={`blade-${id}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff1d6" />
      <stop offset="30%" stopColor="#fb923c" />
      <stop offset="60%" stopColor="#c2410c" />
      <stop offset="100%" stopColor="#1a120a" />
    </linearGradient>
    {/* rat fur */}
    <linearGradient id={`fur-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2a241c" />
      <stop offset="100%" stopColor="#0a0908" />
    </linearGradient>
    {/* wax */}
    <linearGradient id={`wax-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fef3c7" />
      <stop offset="100%" stopColor="#a89a86" />
    </linearGradient>
    {/* flame */}
    <radialGradient id={`flame-${id}`} cx="50%" cy="60%" r="55%">
      <stop offset="0%" stopColor="#fff7ed" />
      <stop offset="35%" stopColor="#fb923c" />
      <stop offset="75%" stopColor="#c2410c" />
      <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
    </radialGradient>
    {/* seal blue */}
    <radialGradient id={`seal-${id}`} cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#c7d2fe" />
      <stop offset="60%" stopColor="#4c6ed4" />
      <stop offset="100%" stopColor="#1e2a5e" />
    </radialGradient>
    {/* soft glow filter */}
    <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// shared ground shadow
const Ground: React.FC = () => (
  <ellipse cx="100" cy="262" rx="66" ry="9" fill="#000" opacity="0.7" />
);

// shared backwash halo
const Halo: React.FC<{ id: string }> = ({ id }) => (
  <circle cx="100" cy="150" r="88" fill={`url(#bg-${id})`} />
);

// ember particles floating around the figure
const Embers: React.FC<{ positions?: [number, number, number][] }> = ({
  positions = [[28, 210, 1.6], [170, 190, 1.2], [40, 110, 1], [155, 90, 1.4], [180, 240, 1], [24, 150, 1.2]],
}) => (
  <g opacity="0.85">
    {positions.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#fb923c">
        <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${y};${y - 14};${y}`} dur={`${3 + (i % 2)}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </g>
);

// -------- PLAYERS --------

const Vowbreaker: React.FC<ArtProps> = ({ className }) => {
  const id = 'vb';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />

      {/* back cloak billowing */}
      <path d="M54 260 Q38 200 56 110 Q70 70 80 60 Q82 64 80 80 Q76 140 74 190 Q74 230 72 260 Z"
            fill={`url(#cloak-${id})`} opacity="0.9" />
      <path d="M146 260 Q162 200 144 110 Q130 70 120 60 Q118 64 120 80 Q124 140 126 190 Q126 230 128 260 Z"
            fill={`url(#cloak-${id})`} opacity="0.9" />

      {/* torso */}
      <path d="M66 260 L76 120 Q100 98 124 120 L134 260 Z" fill={`url(#body-${id})`} />
      {/* chest plate */}
      <path d="M80 130 Q100 118 120 130 L118 180 Q100 188 82 180 Z" fill="#2a241c" stroke="#d4a24c" strokeWidth="1.2" />
      <line x1="100" y1="128" x2="100" y2="188" stroke="#d4a24c" strokeWidth="0.6" opacity="0.5" />
      {/* belt */}
      <rect x="76" y="190" width="48" height="8" fill="#1a120a" stroke="#d4a24c" strokeWidth="0.8" />
      <rect x="96" y="189" width="8" height="10" fill="#d4a24c" />

      {/* pauldrons */}
      <path d="M62 120 Q56 96 78 100 L82 130 Q72 134 62 130 Z" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      <path d="M138 120 Q144 96 122 100 L118 130 Q128 134 138 130 Z" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      {/* pauldron spikes */}
      <polygon points="58,120 50,104 68,112" fill="#1a120a" stroke="#d4a24c" strokeWidth="0.8" />
      <polygon points="142,120 150,104 132,112" fill="#1a120a" stroke="#d4a24c" strokeWidth="0.8" />

      {/* neck + hood frame */}
      <path d="M88 98 L88 110 L112 110 L112 98 Z" fill="#0a0908" />

      {/* hood */}
      <path d="M72 90 Q100 38 128 90 L124 114 Q100 112 76 114 Z" fill={`url(#cloak-${id})`} />
      <path d="M78 90 Q100 50 122 90" fill="none" stroke="#8b1e2b" strokeWidth="0.8" opacity="0.4" />

      {/* shadowed face */}
      <ellipse cx="100" cy="96" rx="14" ry="10" fill="#000" />
      {/* eyes glowing */}
      <ellipse cx="93" cy="94" rx="2" ry="1.4" fill="#fb923c" filter={`url(#glow-${id})`} />
      <ellipse cx="107" cy="94" rx="2" ry="1.4" fill="#fb923c" filter={`url(#glow-${id})`} />

      {/* arms */}
      <path d="M72 140 Q56 170 54 210 L60 232 Q68 220 72 200 Z" fill={`url(#body-${id})`} />
      <path d="M128 140 Q144 170 146 210 L140 232 Q132 220 128 200 Z" fill={`url(#body-${id})`} />
      {/* gauntlets */}
      <rect x="52" y="224" width="16" height="16" rx="2" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      <rect x="132" y="224" width="16" height="16" rx="2" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />

      {/* broken blade sword held right */}
      <path d="M148 238 L156 236 L168 156 L158 154 Z" fill={`url(#blade-${id})`} stroke="#d4a24c" strokeWidth="0.6" />
      <path d="M154 154 L162 152 L164 144 L156 146 Z" fill="#ecdfc3" />
      {/* jagged broken edge */}
      <path d="M158 154 L166 148 L170 158 L164 160 Z" fill="#1a120a" />
      {/* cross guard */}
      <rect x="142" y="234" width="22" height="5" rx="1" fill="#d4a24c" stroke="#1a120a" strokeWidth="0.5" />
      {/* pommel */}
      <circle cx="139" cy="242" r="4" fill="#d4a24c" stroke="#1a120a" strokeWidth="0.6" />

      {/* ember chain on chest */}
      <circle cx="100" cy="150" r="4.5" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`} />
      <path d="M96 155 Q100 170 104 155" stroke="#fb923c" strokeWidth="1.2" fill="none" opacity="0.8" />

      {/* rim light on armor */}
      <path d="M80 130 Q85 124 92 124" stroke="#fff1d6" strokeWidth="0.8" fill="none" opacity="0.35" />
      <path d="M120 130 Q115 124 108 124" stroke="#fff1d6" strokeWidth="0.8" fill="none" opacity="0.25" />

      <Embers />
    </svg>
  );
};

const Sealbinder: React.FC<ArtProps> = ({ className }) => {
  const id = 'sb';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <circle cx="100" cy="150" r="88" fill="url(#bg-sb)" opacity="0.6" />
      {/* blue wash */}
      <circle cx="100" cy="140" r="80" fill="#4c6ed4" opacity="0.12" />
      <Ground />

      {/* long robe */}
      <path d="M50 260 Q56 200 68 110 Q100 84 132 110 Q144 200 150 260 Z" fill={`url(#body-${id})`} />
      {/* sash */}
      <path d="M66 168 L134 176 L130 192 L70 184 Z" fill="#233461" stroke="#4c6ed4" strokeWidth="1" />
      <path d="M100 172 L102 194 L96 194 Z" fill="#4c6ed4" />

      {/* robe runes */}
      <g opacity="0.55" stroke="#4c6ed4" fill="none" strokeWidth="0.8">
        <circle cx="80" cy="210" r="4" />
        <circle cx="120" cy="220" r="3" />
        <path d="M88 232 L92 236 L88 240" />
        <path d="M112 244 L108 248 L112 252" />
      </g>

      {/* sleeves */}
      <path d="M58 150 Q46 200 62 240 L74 236 Q70 200 78 160 Z" fill={`url(#body-${id})`} />
      <path d="M142 150 Q154 200 138 240 L126 236 Q130 200 122 160 Z" fill={`url(#body-${id})`} />

      {/* head / cowl */}
      <path d="M70 96 Q100 42 130 96 L126 120 L74 120 Z" fill="#0a0908" />
      {/* mask */}
      <ellipse cx="100" cy="100" rx="16" ry="14" fill="#1a120a" />
      {/* forehead seal */}
      <circle cx="100" cy="90" r="5" fill="url(#seal-sb)" filter="url(#glow-sb)" />
      <line x1="100" y1="82" x2="100" y2="98" stroke="#c7d2fe" strokeWidth="1" opacity="0.8" />
      <line x1="92" y1="90" x2="108" y2="90" stroke="#c7d2fe" strokeWidth="1" opacity="0.8" />
      {/* eyes */}
      <ellipse cx="94" cy="104" rx="1.6" ry="1" fill="#c7d2fe" />
      <ellipse cx="106" cy="104" rx="1.6" ry="1" fill="#c7d2fe" />

      {/* tome held in front */}
      <rect x="78" y="176" width="44" height="28" rx="2" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      <line x1="100" y1="176" x2="100" y2="204" stroke="#d4a24c" strokeWidth="0.8" />
      <path d="M84 184 L96 184 M104 184 L116 184 M84 190 L96 190 M104 190 L116 190 M84 196 L96 196 M104 196 L116 196"
            stroke="#7a6a58" strokeWidth="0.4" />

      {/* floating sigils */}
      <g opacity="0.9">
        <g transform="translate(40 120)">
          <polygon points="0,-8 7,4 -7,4" fill="none" stroke="#4c6ed4" strokeWidth="1.4" filter="url(#glow-sb)" />
          <circle r="1.6" fill="#c7d2fe" />
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite" additive="sum" />
        </g>
        <g transform="translate(160 140)">
          <circle r="7" fill="none" stroke="#4c6ed4" strokeWidth="1.2" filter="url(#glow-sb)" />
          <line x1="-7" y1="0" x2="7" y2="0" stroke="#4c6ed4" strokeWidth="0.8" />
        </g>
        <g transform="translate(152 60)">
          <polygon points="-5,-5 5,-5 5,5 -5,5" fill="none" stroke="#4c6ed4" strokeWidth="1" />
          <circle r="1" fill="#c7d2fe" />
        </g>
      </g>

      {/* rim light */}
      <path d="M68 110 Q74 100 84 98" stroke="#c7d2fe" strokeWidth="0.6" fill="none" opacity="0.4" />
      <Embers positions={[[34, 160, 1.2], [166, 180, 1], [40, 230, 1.4], [160, 100, 1]]} />
    </svg>
  );
};

// -------- ENEMIES --------

const AshPilgrim: React.FC<ArtProps> = ({ className }) => {
  const id = 'ap';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />

      {/* body */}
      <path d="M58 260 Q64 190 74 130 Q100 104 126 130 Q136 190 142 260 Z" fill={`url(#cloak-${id})`} />
      {/* hood */}
      <path d="M70 108 Q100 52 130 108 L126 132 L74 132 Z" fill="#0a0908" />
      {/* face void */}
      <ellipse cx="100" cy="112" rx="14" ry="12" fill="#000" />
      {/* burning eyes */}
      <ellipse cx="93" cy="108" rx="2.2" ry="1.5" fill="#fb923c" filter={`url(#glow-${id})`} />
      <ellipse cx="107" cy="108" rx="2.2" ry="1.5" fill="#fb923c" filter={`url(#glow-${id})`} />
      {/* stitched mouth */}
      <line x1="93" y1="124" x2="107" y2="124" stroke="#ecdfc3" strokeWidth="0.8" />
      <line x1="95" y1="122" x2="95" y2="126" stroke="#ecdfc3" strokeWidth="0.6" />
      <line x1="99" y1="122" x2="99" y2="126" stroke="#ecdfc3" strokeWidth="0.6" />
      <line x1="103" y1="122" x2="103" y2="126" stroke="#ecdfc3" strokeWidth="0.6" />

      {/* arms holding censer */}
      <path d="M74 140 Q64 170 68 200 L78 198 Q78 172 86 148 Z" fill={`url(#cloak-${id})`} />
      <path d="M126 140 Q148 170 160 210 L150 220 Q140 186 124 156 Z" fill={`url(#cloak-${id})`} />

      {/* censer chain */}
      <path d="M152 216 L172 246" stroke="#564a3c" strokeWidth="1.2" strokeDasharray="3 2" />
      {/* censer bowl */}
      <circle cx="172" cy="252" r="12" fill="url(#metal-ap)" stroke="#1a120a" strokeWidth="1" />
      <circle cx="172" cy="252" r="6" fill="#000" />
      <circle cx="172" cy="252" r="3" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`} />
      {/* smoke plumes */}
      <path d="M172 240 Q176 230 170 222 Q164 214 170 206 Q176 198 170 190"
            stroke="#a89a86" strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* prayer beads */}
      <path d="M86 160 Q100 180 114 160" stroke="#d4a24c" strokeWidth="0.8" fill="none" />
      <circle cx="100" cy="172" r="1.8" fill="#d4a24c" />

      <Embers positions={[[30, 200, 1.3], [170, 120, 1], [45, 160, 1], [140, 90, 1.2]]} />
    </svg>
  );
};

const WickRat: React.FC<ArtProps> = ({ className }) => {
  const id = 'wr';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />

      {/* body low-slung */}
      <path d="M24 240 Q32 180 80 172 Q140 164 172 196 Q180 220 176 250 L22 250 Z"
            fill={`url(#fur-${id})`} stroke="#1a120a" strokeWidth="1" />
      {/* muscle shading */}
      <path d="M40 226 Q80 210 140 216 Q160 224 172 238" stroke="#0a0908" strokeWidth="1" fill="none" opacity="0.6" />

      {/* head */}
      <path d="M162 210 Q190 202 194 228 Q188 246 170 240 Q160 232 162 220 Z" fill={`url(#fur-${id})`} />
      {/* snout */}
      <path d="M188 230 Q196 228 196 234 Q192 238 186 236 Z" fill="#0a0908" />
      <circle cx="194" cy="232" r="1" fill="#fb923c" />
      {/* evil eye */}
      <ellipse cx="182" cy="222" rx="2" ry="1.4" fill="#fb923c" filter={`url(#glow-${id})`} />
      {/* fangs */}
      <polygon points="182,238 184,246 186,238" fill="#ecdfc3" />
      <polygon points="188,238 190,246 192,238" fill="#ecdfc3" />

      {/* ear */}
      <path d="M164 204 Q168 188 174 200 Q172 210 164 210 Z" fill="#0a0908" />
      <path d="M166 206 Q169 196 172 202" stroke="#8b1e2b" strokeWidth="0.8" fill="none" />

      {/* candle stubs on back with flames */}
      <g>
        <rect x="70" y="140" width="8" height="34" fill={`url(#wax-${id})`} stroke="#7a6a58" strokeWidth="0.4" />
        <path d="M72 144 L76 144 L77 148 L71 148 Z" fill="#564a3c" />
        <ellipse cx="74" cy="130" rx="6" ry="12" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`}>
          <animate attributeName="ry" values="12;14;10;13;12" dur="1.8s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="74" cy="132" r="3" fill="#fff7ed" opacity="0.8" />
      </g>
      <g>
        <rect x="96" y="130" width="8" height="44" fill={`url(#wax-${id})`} stroke="#7a6a58" strokeWidth="0.4" />
        <path d="M98 132 L102 132 L103 138 L97 138 Z" fill="#564a3c" />
        <ellipse cx="100" cy="116" rx="7" ry="14" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`}>
          <animate attributeName="ry" values="14;18;12;15;14" dur="2.1s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="100" cy="118" r="3.5" fill="#fff7ed" opacity="0.9" />
      </g>
      <g>
        <rect x="126" y="148" width="8" height="30" fill={`url(#wax-${id})`} stroke="#7a6a58" strokeWidth="0.4" />
        <path d="M128 150 L132 150 L133 154 L127 154 Z" fill="#564a3c" />
        <ellipse cx="130" cy="138" rx="5" ry="11" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`}>
          <animate attributeName="ry" values="11;14;10;12;11" dur="1.6s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="130" cy="140" r="2.6" fill="#fff7ed" opacity="0.85" />
      </g>

      {/* wax drips down side */}
      <path d="M78 164 L80 190 L76 192 Z" fill="#ecdfc3" opacity="0.7" />
      <path d="M104 160 L108 184 L102 186 Z" fill="#ecdfc3" opacity="0.7" />

      {/* legs */}
      <path d="M46 244 L44 262 L52 262 L54 244 Z" fill="#0a0908" />
      <path d="M74 246 L72 262 L80 262 L82 246 Z" fill="#0a0908" />
      <path d="M132 246 L130 262 L138 262 L140 246 Z" fill="#0a0908" />
      <path d="M160 244 L158 262 L166 262 L168 246 Z" fill="#0a0908" />

      {/* tail */}
      <path d="M26 242 Q6 240 8 262" stroke="#0a0908" strokeWidth="4" fill="none" strokeLinecap="round" />

      <Embers positions={[[40, 120, 1.2], [160, 100, 1], [70, 80, 1.4]]} />
    </svg>
  );
};

const SconceImp: React.FC<ArtProps> = ({ className }) => {
  const id = 'si';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />

      {/* wings back */}
      <path d="M46 140 Q12 112 20 70 Q40 110 64 132 Z" fill={`url(#cloak-${id})`} stroke="#d4a24c" strokeWidth="0.6" />
      <path d="M154 140 Q188 112 180 70 Q160 110 136 132 Z" fill={`url(#cloak-${id})`} stroke="#d4a24c" strokeWidth="0.6" />

      {/* body */}
      <path d="M72 240 Q68 160 100 130 Q132 160 128 240 Z" fill={`url(#body-${id})`} />
      {/* belly flame crack */}
      <path d="M90 200 Q100 180 110 200 L108 230 Q100 226 92 230 Z" fill={`url(#flame-${id})`} opacity="0.7" />

      {/* head */}
      <ellipse cx="100" cy="126" rx="18" ry="16" fill={`url(#body-${id})`} />
      {/* horns */}
      <path d="M86 116 L74 90 L90 110 Z" fill="#d4a24c" stroke="#1a120a" strokeWidth="0.6" />
      <path d="M114 116 L126 90 L110 110 Z" fill="#d4a24c" stroke="#1a120a" strokeWidth="0.6" />
      {/* glowing eyes */}
      <ellipse cx="92" cy="122" rx="2.4" ry="1.6" fill="#fb923c" filter={`url(#glow-${id})`} />
      <ellipse cx="108" cy="122" rx="2.4" ry="1.6" fill="#fb923c" filter={`url(#glow-${id})`} />
      {/* mouth breathing fire */}
      <path d="M92 136 Q100 148 108 136 Q104 142 100 144 Q96 142 92 136 Z" fill="#1a120a" />
      <ellipse cx="100" cy="150" rx="7" ry="9" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`}>
        <animate attributeName="ry" values="9;12;7;10;9" dur="1.6s" repeatCount="indefinite" />
      </ellipse>

      {/* tail */}
      <path d="M128 230 Q156 230 160 250 Q152 256 148 246 Q144 238 132 240 Z" fill={`url(#body-${id})`} />

      {/* arms + claws */}
      <path d="M72 170 Q54 190 58 220 L68 218 Q70 196 78 180 Z" fill={`url(#body-${id})`} />
      <path d="M128 170 Q146 190 142 220 L132 218 Q130 196 122 180 Z" fill={`url(#body-${id})`} />
      <polygon points="56,222 54,230 60,224" fill="#d4a24c" />
      <polygon points="144,222 146,230 140,224" fill="#d4a24c" />

      <Embers />
    </svg>
  );
};

const HollowChanter: React.FC<ArtProps> = ({ className }) => {
  const id = 'hc';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />

      <path d="M58 260 Q62 180 72 110 Q100 80 128 110 Q138 180 142 260 Z" fill={`url(#body-${id})`} />
      <path d="M70 92 Q100 42 130 92 L126 120 L74 120 Z" fill="#050403" />
      {/* chant trail */}
      <g opacity="0.7" stroke="#4c6ed4" strokeWidth="0.8" fill="none">
        <path d="M100 40 Q110 28 106 16" />
        <path d="M90 34 Q80 22 86 10" />
      </g>
      {/* eye */}
      <ellipse cx="100" cy="98" rx="1.8" ry="2.4" fill="#ecdfc3" />
      {/* stitched mouth big */}
      <line x1="86" y1="110" x2="114" y2="110" stroke="#ecdfc3" strokeWidth="1.2" />
      {[88, 94, 100, 106, 112].map((x) => (
        <line key={x} x1={x} y1="106" x2={x} y2="114" stroke="#ecdfc3" strokeWidth="0.8" />
      ))}
      {/* thurible */}
      <path d="M80 180 Q100 200 120 180" stroke="#d4a24c" strokeWidth="1" fill="none" />
      <circle cx="100" cy="200" r="5" fill="#d4a24c" stroke="#1a120a" strokeWidth="0.6" />
      <Embers />
    </svg>
  );
};

const ReliquaryGuard: React.FC<ArtProps> = ({ className }) => {
  const id = 'rg';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      <path d="M52 260 L62 120 Q100 96 138 120 L148 260 Z" fill={`url(#body-${id})`} stroke="#d4a24c" strokeWidth="1.2" />
      {/* plate lines */}
      <line x1="72" y1="170" x2="128" y2="170" stroke="#d4a24c" strokeWidth="1" />
      <line x1="68" y1="210" x2="132" y2="210" stroke="#d4a24c" strokeWidth="1" />
      <line x1="66" y1="240" x2="134" y2="240" stroke="#d4a24c" strokeWidth="1" />
      {/* helm */}
      <path d="M72 76 Q100 48 128 76 L128 114 L72 114 Z" fill="#050403" stroke="#d4a24c" strokeWidth="1.4" />
      <line x1="100" y1="74" x2="100" y2="114" stroke="#d4a24c" strokeWidth="1" />
      <line x1="80" y1="94" x2="92" y2="94" stroke="#fb923c" strokeWidth="1.6" filter={`url(#glow-${id})`} />
      <line x1="108" y1="94" x2="120" y2="94" stroke="#fb923c" strokeWidth="1.6" filter={`url(#glow-${id})`} />
      {/* shield */}
      <path d="M30 160 Q36 128 52 128 L52 216 Q36 214 30 188 Z" fill={`url(#body-${id})`} stroke="#d4a24c" strokeWidth="1.4" />
      <circle cx="42" cy="170" r="4" fill="#d4a24c" />
      <line x1="42" y1="136" x2="42" y2="208" stroke="#d4a24c" strokeWidth="0.6" />
      {/* sword right */}
      <line x1="164" y1="234" x2="174" y2="118" stroke={`url(#metal-${id})`} strokeWidth="5" />
      <line x1="154" y1="148" x2="184" y2="142" stroke="#d4a24c" strokeWidth="3" />
      <Embers />
    </svg>
  );
};

const SplinterShade: React.FC<ArtProps> = ({ className }) => {
  const id = 'ss';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      {/* spiky shard body */}
      <polygon points="100,60 90,100 110,106 96,160 118,150 108,200 130,186 112,240 86,232 72,190 90,182 74,134 100,122 82,80"
               fill={`url(#body-${id})`} stroke="#4c6ed4" strokeWidth="1.2" />
      {/* glints */}
      <polygon points="100,60 97,75 105,73" fill="#ecdfc3" opacity="0.9" />
      <polygon points="130,186 124,196 132,194" fill="#ecdfc3" opacity="0.7" />
      <polygon points="74,134 76,144 82,140" fill="#ecdfc3" opacity="0.6" />
      {/* eye */}
      <circle cx="96" cy="140" r="2" fill="#4c6ed4" filter={`url(#glow-${id})`} />
      <Embers />
    </svg>
  );
};

const LimbOfChoir: React.FC<ArtProps> = ({ className }) => {
  const id = 'lc';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      <ellipse cx="100" cy="240" rx="36" ry="12" fill="#2a241c" />
      <ellipse cx="100" cy="234" rx="28" ry="6" fill="#8b1e2b" />
      <path d="M84 236 Q76 170 92 120 Q98 90 100 60" stroke="#2a241c" strokeWidth="24" fill="none" strokeLinecap="round" />
      {/* stitches */}
      <line x1="86" y1="200" x2="100" y2="196" stroke="#d4a24c" strokeWidth="0.8" />
      <line x1="90" y1="170" x2="102" y2="164" stroke="#d4a24c" strokeWidth="0.8" />
      <line x1="94" y1="138" x2="104" y2="132" stroke="#d4a24c" strokeWidth="0.8" />
      {/* hand */}
      <path d="M86 60 Q88 34 102 44 Q106 30 114 42 Q122 32 124 50 Q132 50 126 66 L114 78 Z" fill={`url(#body-${id})`} />
      {/* singing mouth in palm */}
      <ellipse cx="114" cy="60" rx="5" ry="3" fill="#8b1e2b" />
      <line x1="110" y1="60" x2="118" y2="60" stroke="#ecdfc3" strokeWidth="0.8" />
      <Embers />
    </svg>
  );
};

const Candlewight: React.FC<ArtProps> = ({ className }) => {
  const id = 'cw';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      {/* wax base */}
      <path d="M66 256 Q70 220 90 216 L110 216 Q130 220 134 256 Z" fill={`url(#wax-${id})`} />
      <path d="M80 232 L80 248 M120 236 L120 250 M96 226 L96 240" stroke="#a89a86" strokeWidth="1" />
      {/* robed flame body */}
      <path d="M70 216 Q62 130 100 70 Q138 130 130 216 Z" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`} opacity="0.95">
        <animate attributeName="opacity" values="0.85;1;0.9;0.95" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M82 210 Q78 140 100 92 Q122 140 118 210 Z" fill="#fff7ed" opacity="0.85" />
      {/* weeping face */}
      <circle cx="90" cy="150" r="2" fill="#8b1e2b" />
      <circle cx="110" cy="150" r="2" fill="#8b1e2b" />
      <path d="M90 152 L86 168" stroke="#8b1e2b" strokeWidth="1" />
      <path d="M110 152 L114 168" stroke="#8b1e2b" strokeWidth="1" />
      <path d="M92 176 Q100 184 108 176" stroke="#8b1e2b" strokeWidth="1" fill="none" />
    </svg>
  );
};

const WardenOfAshes: React.FC<ArtProps> = ({ className }) => {
  const id = 'wa';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      {/* hulk */}
      <path d="M32 260 L48 110 Q100 76 152 110 L168 260 Z" fill={`url(#body-${id})`} stroke="#d4a24c" strokeWidth="1.2" />
      {/* smouldering cracks */}
      <path d="M64 150 L72 200 L66 246" stroke="#fb923c" strokeWidth="1.6" fill="none" filter={`url(#glow-${id})`} />
      <path d="M136 148 L128 202 L134 248" stroke="#fb923c" strokeWidth="1.6" fill="none" filter={`url(#glow-${id})`} />
      <path d="M100 130 L102 230" stroke="#fb923c" strokeWidth="1.6" fill="none" filter={`url(#glow-${id})`} />
      {/* pauldron spikes */}
      <polygon points="44,118 34,96 56,110" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      <polygon points="156,118 166,96 144,110" fill="#2a241c" stroke="#d4a24c" strokeWidth="1" />
      {/* helm */}
      <path d="M68 72 Q100 36 132 72 L130 112 L70 112 Z" fill="#0a0908" stroke="#d4a24c" strokeWidth="1.4" />
      <rect x="80" y="90" width="40" height="4" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`} />
      {/* cleaver */}
      <path d="M176 120 L184 260 L164 260 L166 124 Z" fill={`url(#metal-${id})`} stroke="#1a120a" strokeWidth="1" />
      <path d="M166 122 Q196 110 192 156 L170 158 Z" fill="#d4a24c" />
      <Embers />
    </svg>
  );
};

const MatronOfBells: React.FC<ArtProps> = ({ className }) => {
  const id = 'mb';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      <path d="M54 260 L64 100 Q100 80 136 100 L146 260 Z" fill={`url(#body-${id})`} stroke="#d4a24c" strokeWidth="1" />
      <path d="M68 70 Q100 40 132 70 L128 112 L72 112 Z" fill="#2a241c" />
      <line x1="76" y1="96" x2="124" y2="96" stroke="#d4a24c" strokeWidth="0.8" />
      <line x1="60" y1="136" x2="20" y2="150" stroke="#0a0908" strokeWidth="6" strokeLinecap="round" />
      <line x1="140" y1="136" x2="180" y2="150" stroke="#0a0908" strokeWidth="6" strokeLinecap="round" />
      <line x1="20" y1="154" x2="20" y2="200" stroke="#564a3c" strokeWidth="1" />
      <line x1="180" y1="154" x2="180" y2="200" stroke="#564a3c" strokeWidth="1" />
      <line x1="100" y1="180" x2="100" y2="220" stroke="#564a3c" strokeWidth="1" />
      <path d="M10 200 Q20 190 30 200 L28 222 L12 222 Z" fill="url(#metal-mb)" stroke="#1a120a" />
      <path d="M170 200 Q180 190 190 200 L188 222 L172 222 Z" fill="url(#metal-mb)" stroke="#1a120a" />
      <path d="M90 220 Q100 210 110 220 L108 244 L92 244 Z" fill="url(#metal-mb)" stroke="#1a120a" />
      <Embers />
    </svg>
  );
};

const MouthOfVault: React.FC<ArtProps> = ({ className }) => {
  const id = 'mv';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      <path d="M20 140 L48 100 L80 120 L100 94 L120 120 L152 100 L180 140 L176 212 L152 250 L122 236 L100 254 L78 236 L48 250 L24 212 Z"
            fill="#050403" stroke="#564a3c" strokeWidth="1" />
      <path d="M52 158 L84 184 L100 172 L116 184 L148 158 L144 212 L118 220 L100 214 L82 220 L56 212 Z" fill="#000" />
      {/* teeth upper */}
      {[[54,156,60,178,66,156],[72,156,80,186,88,156],[114,156,122,186,130,156],[132,156,140,178,146,156]].map((t,i)=>(
        <polygon key={i} points={`${t[0]},${t[1]} ${t[2]},${t[3]} ${t[4]},${t[5]}`} fill="#ecdfc3" />
      ))}
      {/* teeth lower */}
      {[[62,220,68,200,74,220],[88,224,96,200,104,224],[116,224,124,200,132,224]].map((t,i)=>(
        <polygon key={i} points={`${t[0]},${t[1]} ${t[2]},${t[3]} ${t[4]},${t[5]}`} fill="#ecdfc3" />
      ))}
      {/* throat fire */}
      <circle cx="100" cy="196" r="14" fill={`url(#flame-${id})`} filter={`url(#glow-${id})`}>
        <animate attributeName="r" values="12;16;11;15;12" dur="2s" repeatCount="indefinite" />
      </circle>
      <Embers />
    </svg>
  );
};

const BrokenChoirmaster: React.FC<ArtProps> = ({ className }) => {
  const id = 'bc';
  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <SharedDefs id={id} />
      <Halo id={id} />
      <Ground />
      <path d="M46 260 L58 98 Q100 70 142 98 L154 260 Z" fill="#050403" stroke="#d4a24c" strokeWidth="1.2" />
      <path d="M58 122 Q100 138 142 122 L138 150 Q100 162 62 150 Z" fill={`url(#body-${id})`} stroke="#d4a24c" strokeWidth="1" />
      <path d="M72 64 Q100 20 128 64 L126 106 L74 106 Z" fill="#ecdfc3" />
      <path d="M100 24 L98 106" stroke="#8b1e2b" strokeWidth="1.4" />
      <path d="M84 56 L116 60" stroke="#8b1e2b" strokeWidth="0.8" />
      <ellipse cx="90" cy="64" rx="2.4" ry="4" fill="#000" />
      <ellipse cx="110" cy="64" rx="2.4" ry="4" fill="#000" />
      <ellipse cx="100" cy="86" rx="4" ry="8" fill="#000" />
      <line x1="64" y1="144" x2="22" y2="86" stroke="#1a120a" strokeWidth="6" strokeLinecap="round" />
      <line x1="136" y1="144" x2="178" y2="86" stroke="#1a120a" strokeWidth="6" strokeLinecap="round" />
      <line x1="22" y1="86" x2="8" y2="64" stroke="#d4a24c" strokeWidth="2" />
      <line x1="178" y1="86" x2="192" y2="64" stroke="#d4a24c" strokeWidth="2" />
      {/* floating notes */}
      <circle cx="30" cy="48" r="3" fill="#d4a24c" filter={`url(#glow-${id})`} />
      <circle cx="170" cy="48" r="3" fill="#d4a24c" filter={`url(#glow-${id})`} />
      <circle cx="100" cy="14" r="2.4" fill="#d4a24c" filter={`url(#glow-${id})`} />
      <Embers />
    </svg>
  );
};

const Unknown: React.FC<ArtProps> = ({ className }) => (
  <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
    <SharedDefs id="uk" />
    <Halo id="uk" />
    <Ground />
    <circle cx="100" cy="110" r="28" fill="#1a120a" />
    <path d="M54 260 L68 150 Q100 132 132 150 L146 260 Z" fill="#1a120a" />
    <text x="100" y="116" textAnchor="middle" fill="#fb923c" fontSize="32" fontWeight="700">?</text>
  </svg>
);

export const ART: Record<string, React.FC<ArtProps>> = {
  player_vowbreaker: Vowbreaker,
  player_sealbinder: Sealbinder,
  player_whisperer: SplinterShade,
  player_auger: WardenOfAshes,
  e_ash_pilgrim: AshPilgrim,
  e_wick_rat: WickRat,
  e_sconce_imp: SconceImp,
  e_hollow_chanter: HollowChanter,
  e_reliquary_guard: ReliquaryGuard,
  e_splinter_shade: SplinterShade,
  e_limb_of_choir: LimbOfChoir,
  e_candlewight: Candlewight,
  e_warden_of_ashes: WardenOfAshes,
  e_matron_of_bells: MatronOfBells,
  e_mouth_of_the_vault: MouthOfVault,
  e_broken_choirmaster: BrokenChoirmaster,
};

export const CharacterArt: React.FC<ArtProps & { artId: string }> = ({ artId, className }) => {
  const C = ART[artId] ?? Unknown;
  return <C className={className} />;
};
