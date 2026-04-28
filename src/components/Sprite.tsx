// EMBERVOW — reusable CSS sprite-sheet renderer.
// Displays one region of `public/assets/ui_sheet.png` at an arbitrary size.
//
// Technique: `background-image` + `background-position` + `background-size`.
// We pick a final width/height, compute the scale factor for the sprite,
// and scale the whole sheet proportionally so only the chosen cell shows.

import React from 'react';
import { SHEET_URL, SHEET_W, SHEET_H, SPRITES, Rect } from '../assets/sprites';

type Props = {
  /** Sprite id from SPRITES map. Wins over `rect` when both provided. */
  id?: keyof typeof SPRITES | string;
  /** Explicit rect override (pixel coords on the original sheet). */
  rect?: Rect;
  /** Target width in CSS px. Height scales from aspect unless `h` given. */
  w?: number;
  /** Target height in CSS px. */
  h?: number;
  /** If set, fill parent instead of fixed px. */
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  mirror?: boolean;
  /** Apply a CSS mix-blend-mode — used to drop dark baked backgrounds onto a scene. */
  blend?: 'lighten' | 'screen' | 'plus-lighter';
  /**
   * Feather the sprite edges so they dissolve into the scene behind it.
   * Accepts either a preset (`'character'`) or an explicit radial-gradient spec.
   * Works independently of blend mode — masks by opacity rather than color value.
   */
  feather?: 'character' | 'portrait' | string | false;
};

export const Sprite: React.FC<Props> = ({
  id,
  rect,
  w,
  h,
  fill,
  className = '',
  style,
  title,
  mirror,
  blend,
  feather,
}) => {
  const blendStyle: React.CSSProperties | undefined = blend
    ? { mixBlendMode: blend as any }
    : undefined;
  // Edge feathering — soft radial fade so the rectangle never shows.
  // `character`: taller vignette around a standing figure.
  // `portrait`: rounder for head-shot style.
  // Defaults use percentages along a radial-gradient whose 100% is the
  // ellipse touching cell corners (default CSS behaviour). This keeps
  // most of the character fully opaque and only feathers outer edges.
  const featherSpec =
    feather === 'character'
      ? 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.75) 92%, rgba(0,0,0,0) 100%)'
      : feather === 'portrait'
      ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
      : (typeof feather === 'string' ? feather : undefined);
  const featherStyle: React.CSSProperties | undefined = featherSpec
    ? ({
        WebkitMaskImage: featherSpec,
        maskImage: featherSpec,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
      } as React.CSSProperties)
    : undefined;
  const r: Rect | undefined = rect ?? (id ? SPRITES[id] : undefined);
  if (!r) {
    return (
      <div
        className={`bg-red-500/30 border border-red-500 text-[10px] text-red-200 ${className}`}
        style={{ width: w ?? 48, height: h ?? 48, ...style }}
        title={`missing sprite: ${id ?? 'unknown'}`}
      >
        {id ?? '??'}
      </div>
    );
  }

  if (fill) {
    // Fill-parent mode. Use percentage math: background-size scaled so r → 100%.
    // bgSize% = 100 * SHEET / r
    // bgPos% needs to be relative to (bgSize - containerSize), which in CSS
    // translates to: backgroundPosition: x/(SHEET-r) * 100%.
    const bgW = (SHEET_W / r.w) * 100;
    const bgH = (SHEET_H / r.h) * 100;
    const bgX = r.x === 0 ? 0 : (r.x / (SHEET_W - r.w)) * 100;
    const bgY = r.y === 0 ? 0 : (r.y / (SHEET_H - r.h)) * 100;
    return (
      <div
        role="img"
        aria-label={title ?? (typeof id === 'string' ? id : 'sprite')}
        title={title}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('${SHEET_URL}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${bgW}% ${bgH}%`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          transform: mirror ? 'scaleX(-1)' : undefined,
          ...blendStyle,
          ...featherStyle,
          ...style,
        }}
      />
    );
  }

  const finalW = w ?? r.w;
  const aspect = r.h / r.w;
  const finalH = h ?? Math.round(finalW * aspect);

  const scaleX = finalW / r.w;
  const scaleY = finalH / r.h;
  const bgW = SHEET_W * scaleX;
  const bgH = SHEET_H * scaleY;
  const bgX = -r.x * scaleX;
  const bgY = -r.y * scaleY;

  return (
    <div
      role="img"
      aria-label={title ?? (typeof id === 'string' ? id : 'sprite')}
      title={title}
      className={className}
      style={{
        width: finalW,
        height: finalH,
        backgroundImage: `url('${SHEET_URL}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        transform: mirror ? 'scaleX(-1)' : undefined,
        ...blendStyle,
        ...featherStyle,
        ...style,
      }}
    />
  );
};
