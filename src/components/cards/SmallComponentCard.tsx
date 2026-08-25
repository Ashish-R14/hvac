import { useState } from 'react';
import { GlassCard } from '../../design-system/primitives';
import useTilt from '../../hooks/useTilt.js';
import { CLOUDINARY_IMAGES } from '../../cloudinaryImages';
import './cards.css';

const IMAGES: Record<string, string> = { PUMP: CLOUDINARY_IMAGES.pump, EXP: CLOUDINARY_IMAGES.expansionValve, COND: CLOUDINARY_IMAGES.condenser, BMS: CLOUDINARY_IMAGES.bms, DUCT: CLOUDINARY_IMAGES.ductwork, PIPE: CLOUDINARY_IMAGES.piping, FILTER: CLOUDINARY_IMAGES.filter, VFD: CLOUDINARY_IMAGES.vfd };

interface SmallComponentCardProps {
  code: string;
  icon: string;
  title: string;
  desc: string;
  col: string;
}

/**
 * SmallComponentCard — same props/content/image-fallback logic as
 * the original (code, icon, title, desc, col). Uses a gentler tilt
 * (3°) than the larger cards since these sit in a denser grid.
 */
export default function SmallComponentCard({ code, icon, title, desc, col }: SmallComponentCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const tilt = useTilt(3);
  const imgSrc = IMAGES[code];

  return (
    <GlassCard
      ref={tilt.ref}
      interactive
      className="ds-glass-card--tilt ds-glass-card--accent cw-small-card"
      style={{ '--accent': col }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="cw-small-card__media">
        {imgSrc && !imgErr ? (
          <img src={imgSrc} alt={title} onError={() => setImgErr(true)} className="cw-small-card__img" />
        ) : (
          <div className="cw-small-card__media-fallback"><span>{icon}</span></div>
        )}
        <div className="cw-small-card__media-fade" />
        <div className="cw-small-card__icon">{icon}</div>
        <div className="cw-small-card__code">{code}</div>
      </div>
      <div className="cw-small-card__body">
        <div className="cw-small-card__title">{title}</div>
        <div className="cw-small-card__desc">{desc}</div>
      </div>
    </GlassCard>
  );
}
