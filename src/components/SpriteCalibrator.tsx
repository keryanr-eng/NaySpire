// EMBERVOW — sprite calibration overlay.
// Enabled by adding `?sprites=1` to the URL. Shows the full sheet with every
// SPRITES rect drawn over it, plus a gallery of each sprite cut out so you
// can spot-check that the coordinates are correct.

import React from 'react';
import { SHEET_URL, SHEET_W, SHEET_H, SPRITES } from '../assets/sprites';
import { Sprite } from './Sprite';

export const SpriteCalibrator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ids = Object.keys(SPRITES);
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] overflow-auto p-4 scrollbar-ember">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center mb-4">
          <h2 className="font-display text-vow-gold text-2xl">Calibrateur de sprites</h2>
          <span className="ml-4 text-ash-300 text-xs">
            Sheet: {SHEET_W}×{SHEET_H} · {ids.length} sprites
          </span>
          <button onClick={onClose}
                  className="ml-auto px-3 py-1 rounded bg-ash-700 hover:bg-ash-600 border border-ash-400 text-ash-100">
            Fermer
          </button>
        </div>

        {/* Overlaid sheet with coloured rectangles showing every cell */}
        <div className="mb-8">
          <h3 className="text-ash-200 mb-2 text-sm uppercase tracking-widest">Sheet w/ overlays</h3>
          <div className="relative inline-block border border-ash-500 bg-ash-900">
            <img src={SHEET_URL} alt="sheet" style={{ display: 'block', width: SHEET_W, height: SHEET_H }} />
            <svg viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} width={SHEET_W} height={SHEET_H}
                 className="absolute inset-0 pointer-events-none">
              {ids.map((id) => {
                const r = SPRITES[id];
                return (
                  <g key={id}>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h}
                          fill="none" stroke="#fb923c" strokeWidth={2} opacity={0.9} />
                    <text x={r.x + 4} y={r.y + 16} fontSize="14"
                          fill="#fb923c" stroke="#000" strokeWidth={0.5}
                          style={{ paintOrder: 'stroke' }}>
                      {id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Gallery: each sprite cut out individually at a readable size */}
        <h3 className="text-ash-200 mb-2 text-sm uppercase tracking-widest">Cut-out gallery</h3>
        <div className="grid grid-cols-6 gap-3">
          {ids.map((id) => {
            const r = SPRITES[id];
            // Cap preview at 160px in the larger dimension.
            const aspect = r.w / r.h;
            const w = aspect >= 1 ? 160 : Math.round(160 * aspect);
            const h = aspect >= 1 ? Math.round(160 / aspect) : 160;
            return (
              <div key={id} className="flex flex-col items-center gap-1 p-2 border border-ash-500 bg-ash-900/80 rounded">
                <div className="flex items-center justify-center" style={{ width: 160, height: 160 }}>
                  <Sprite id={id} w={w} h={h} />
                </div>
                <div className="text-[11px] text-vow-gold font-mono text-center break-all">{id}</div>
                <div className="text-[10px] text-ash-400 font-mono">
                  x:{r.x} y:{r.y} w:{r.w} h:{r.h}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-ash-300 text-xs leading-relaxed max-w-prose">
          Pour ajuster les coordonnées, modifie <code className="text-vow-gold">src/assets/sprites.ts</code>.
          Each rect is <code>&#123; x, y, w, h &#125;</code> in native pixels on the 1536×1024 sheet.
          The orange overlay on the full sheet shows what the Sprite component is currently cropping;
          if the overlay misses the art, nudge the rect.
        </div>
      </div>
    </div>
  );
};
