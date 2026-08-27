import { useId } from 'react';
import type { LaminationType, RoundedCorner, SpiralColor } from '../types';
import type { PreviewShapes } from '../lib/previewGeometry';

// The drawing itself: one inline SVG, no assets. Everything it knows comes from
// previewShapes — this file only decides how those millimetres look.

type ProductPreviewProps = {
  shapes: PreviewShapes;
  lamination: LaminationType;
  // Announced to screen readers, and what the tests query the drawing by.
  title: string;
};

// Rounded corners are a path, not a CSS class, so they can round the same sheet
// the fold lines are drawn on.
const CORNER_RADIUS_MM = 6;
// Half-width of the metal eyelet drawn around a punched hole.
const HOLE_EYELET_MM = 4.5;

const sheetPath = (widthMm: number, heightMm: number, corners: RoundedCorner[]): string => {
  // Never round away more than the sheet has to give — a 30×40 label with a 6mm
  // radius would otherwise swallow its own edges.
  const r = Math.min(CORNER_RADIUS_MM, widthMm / 4, heightMm / 4);
  const tl = corners.includes(1) ? r : 0;
  const tr = corners.includes(2) ? r : 0;
  const bl = corners.includes(3) ? r : 0;
  const br = corners.includes(4) ? r : 0;

  return [
    `M ${tl} 0`,
    `H ${widthMm - tr}`,
    tr ? `A ${tr} ${tr} 0 0 1 ${widthMm} ${tr}` : '',
    `V ${heightMm - br}`,
    br ? `A ${br} ${br} 0 0 1 ${widthMm - br} ${heightMm}` : '',
    `H ${bl}`,
    bl ? `A ${bl} ${bl} 0 0 1 0 ${heightMm - bl}` : '',
    `V ${tl}`,
    tl ? `A ${tl} ${tl} 0 0 1 ${tl} 0` : '',
    'Z',
  ]
    .filter(Boolean)
    .join(' ');
};

// The sheen the old CSS box carried as a background class. Gloss gets a real
// gradient; the others are a flat tint, which is the whole difference in print.
const LAMINATION_FILL: Record<Exclude<LaminationType, 'gloss'>, string> = {
  none: 'fill-white dark:fill-slate-700',
  matt: 'fill-slate-50 dark:fill-slate-700',
  'soft-touch': 'fill-slate-100 dark:fill-slate-600',
};

// The coil is drawn beside the sheet, over the well — which is near-black in
// dark mode, so a literally black spiral would vanish into it. Both colours are
// lifted until they read against their own background, staying distinguishable.
const SPIRAL_LOOP_CLASS: Record<SpiralColor, string> = {
  white: 'stroke-slate-400 dark:stroke-slate-200',
  black: 'stroke-slate-700 dark:stroke-slate-500',
};

export function ProductPreview({ shapes, lamination, title }: ProductPreviewProps) {
  const gradientId = useId();
  const { sheet, lines, holes, staple, spiral, pocket, sheetsBehind } = shapes;
  const { widthMm, heightMm } = sheet;

  // Room for the spiral coil on the left and the stacked sheets behind, so
  // nothing is clipped by the viewBox.
  const stackOffset = 2.5;
  const padLeft = spiral ? 7 : 2;
  const padRight = 2 + sheetsBehind * stackOffset;
  const padTop = 2 + sheetsBehind * stackOffset;
  const padBottom = 2;

  const strokeWidth = Math.max(widthMm, heightMm) / 180;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`${-padLeft} ${-padTop} ${widthMm + padLeft + padRight} ${heightMm + padTop + padBottom}`}
      className="max-h-44 w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{title}</title>

      {lamination === 'gloss' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="[stop-color:white] dark:[stop-color:#475569]" />
            <stop offset="100%" className="[stop-color:#f1f5f9] dark:[stop-color:#334155]" />
          </linearGradient>
        </defs>
      )}

      {/* Sheets behind, furthest first, to suggest a multi-page job. */}
      {Array.from({ length: sheetsBehind }, (_, i) => (
        <path
          key={i}
          d={sheetPath(widthMm, heightMm, sheet.corners)}
          transform={`translate(${(sheetsBehind - i) * stackOffset}, ${-(sheetsBehind - i) * stackOffset})`}
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
          strokeWidth={strokeWidth}
        />
      ))}

      <path
        d={sheetPath(widthMm, heightMm, sheet.corners)}
        fill={lamination === 'gloss' ? `url(#${gradientId})` : undefined}
        className={`${lamination === 'gloss' ? '' : LAMINATION_FILL[lamination]} stroke-slate-400 dark:stroke-slate-500`}
        strokeWidth={strokeWidth}
      />

      {/* The glued pocket of a presentation folder: a band across the foot. */}
      {pocket && (
        <path
          data-testid="preview-pocket"
          d={`M 0 ${heightMm - pocket.heightMm} H ${widthMm} V ${heightMm} H 0 Z`}
          className="fill-slate-200/70 dark:fill-slate-600/70 stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={strokeWidth}
        />
      )}

      {lines.map((line, i) => (
        <line
          key={`${line.kind}-${i}`}
          data-testid={`preview-${line.kind}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className="stroke-slate-400 dark:stroke-slate-400"
          strokeWidth={strokeWidth}
          strokeDasharray={
            line.kind === 'fold'
              ? `${strokeWidth * 6} ${strokeWidth * 4}`
              : `${strokeWidth * 8} ${strokeWidth * 3} ${strokeWidth * 1.5} ${strokeWidth * 3}`
          }
        />
      ))}

      {holes.map((hole, i) => (
        <circle
          key={i}
          data-testid="preview-hole"
          cx={hole.cxMm}
          cy={hole.cyMm}
          r={hole.rMm}
          className="fill-slate-50 dark:fill-slate-900 stroke-slate-500 dark:stroke-slate-400"
          strokeWidth={strokeWidth}
        />
      ))}

      {/* A metal eyelet clamped around the hole, so the card doesn't tear. */}
      {staple && (
        <rect
          data-testid="preview-staple"
          x={staple.cxMm - HOLE_EYELET_MM}
          y={staple.cyMm - HOLE_EYELET_MM}
          width={HOLE_EYELET_MM * 2}
          height={HOLE_EYELET_MM * 2}
          rx={strokeWidth * 2}
          className="fill-none stroke-slate-500 dark:stroke-slate-300"
          strokeWidth={strokeWidth * 2}
        />
      )}

      {spiral && (
        <g data-testid="preview-spiral" strokeWidth={strokeWidth * 2.2} fill="none">
          {Array.from({ length: spiral.loops }, (_, i) => {
            const y = ((i + 0.5) * heightMm) / spiral.loops;
            return (
              <path
                key={i}
                d={`M ${-5} ${y - 1.5} Q ${-1} ${y - 3.5} ${4} ${y}`}
                className={SPIRAL_LOOP_CLASS[spiral.color]}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
