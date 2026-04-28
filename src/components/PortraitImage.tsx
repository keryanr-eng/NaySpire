// EMBERVOW — painted character image renderer.
// Fills its parent and optionally crops a rectangle from the source PNG.
// Relies on the source image having a real alpha channel; the browser
// composites it naturally over the SceneBackdrop.

import React from 'react';
import type { Portrait } from '../assets/portraits';

type Props = {
  portrait: Portrait;
  className?: string;
  style?: React.CSSProperties;
  mirror?: boolean;
  title?: string;
};

export const PortraitImage: React.FC<Props> = ({ portrait, className, style, mirror, title }) => {
  const { url, sheetW, sheetH, rect } = portrait;

  // No crop — render the whole image and let `object-contain` fit it
  // into the parent while preserving aspect ratio. Alpha handles the rest.
  if (!rect) {
    return (
      <img
        src={url}
        alt={title ?? 'portrait'}
        title={title}
        draggable={false}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          transform: mirror ? 'scaleX(-1)' : undefined,
          ...style,
        }}
      />
    );
  }

  // Cropped mode — scale the whole image so `rect` fills the parent, then
  // use overflow: hidden to clip the rest. Using percentage background tricks
  // mirrors how Sprite works but for arbitrary source URLs.
  const bgW = (sheetW / rect.w) * 100;
  const bgH = (sheetH / rect.h) * 100;
  const bgX = rect.x === 0 ? 0 : (rect.x / (sheetW - rect.w)) * 100;
  const bgY = rect.y === 0 ? 0 : (rect.y / (sheetH - rect.h)) * 100;

  return (
    <div
      role="img"
      aria-label={title ?? 'portrait'}
      title={title}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${bgW}% ${bgH}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        transform: mirror ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    />
  );
};
