import type { GlassType, ProductConfig, RalColor, Section } from '../types';

interface Props {
  product: ProductConfig;
  glassTypes: GlassType[];
  profileColorHex: string;
  ral?: RalColor;
  openState?: boolean; // true = показать открытое положение створок
}

const FACE_MM = 60; // визуальная ширина коробки/стоек на схеме
const IMPOST_FACE_MM = 46;
const LEAF_FACE_MM = 42;

function isDoor(o: Section['opening']) {
  return o !== 'fixed';
}

export default function SchemeSVG({ product, glassTypes, profileColorHex, ral, openState }: Props) {
  const W = product.widthMm;
  const H = product.heightMm;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 60;
  const vbW = W + padLeft + padRight;
  const vbH = H + padTop + padBottom;

  const rawSum = product.sections.reduce((s, sec) => s + sec.widthMm, 0) || 1;
  const sections = product.sections.map((sec) => ({ ...sec, widthMm: (sec.widthMm / rawSum) * W }));

  let cursorX = 0;
  const sectionBoxes = sections.map((sec) => {
    const box = { sec, x: cursorX, w: sec.widthMm };
    cursorX += sec.widthMm;
    return box;
  });

  const glassOf = (id: string) => glassTypes.find((g) => g.id === id) ?? glassTypes[0];

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="h-full w-full" role="img" aria-label="Схема конструкции">
      <defs>
        <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <circle cx={4} cy={4} r={2} fill="#94a3b8" />
        </marker>
      </defs>
      <g transform={`translate(${padLeft},${padTop})`}>
        {/* фон */}
        <rect x={0} y={0} width={W} height={H} fill="#f8fafc" stroke="#e2e8f0" />

        {/* внешняя коробка */}
        <g fill={profileColorHex} stroke="#00000022">
          <rect x={0} y={0} width={W} height={FACE_MM} />
          <rect x={0} y={H - FACE_MM} width={W} height={FACE_MM} />
          <rect x={0} y={0} width={FACE_MM} height={H} />
          <rect x={W - FACE_MM} y={0} width={FACE_MM} height={H} />
        </g>

        {/* вертикальные импосты между секциями */}
        {sectionBoxes.slice(0, -1).map((b, i) => (
          <rect
            key={`vimp-${i}`}
            x={b.x + b.w - IMPOST_FACE_MM / 2}
            y={FACE_MM}
            width={IMPOST_FACE_MM}
            height={H - FACE_MM * 2}
            fill={profileColorHex}
          />
        ))}

        {sectionBoxes.map((b, idx) => {
          const innerX = b.x + (idx === 0 ? FACE_MM : IMPOST_FACE_MM / 2);
          const innerRight = b.x + b.w - (idx === sectionBoxes.length - 1 ? FACE_MM : IMPOST_FACE_MM / 2);
          const innerW = Math.max(innerRight - innerX, 1);
          const innerY = FACE_MM;
          const innerH = H - FACE_MM * 2;
          const door = isDoor(b.sec.opening);
          const glass = glassOf(b.sec.glassTypeId);

          return (
            <g key={b.sec.id}>
              {door ? (
                <DoorLeaf
                  x={innerX}
                  y={innerY}
                  w={innerW}
                  h={innerH}
                  opening={b.sec.opening}
                  profileColorHex={profileColorHex}
                  glass={glass}
                  open={!!openState}
                />
              ) : (
                <FixedCell x={innerX} y={innerY} w={innerW} h={innerH} rows={b.sec.horizontalImposts + 1} profileColorHex={profileColorHex} glass={glass} />
              )}
              {/* подпись секции */}
              <text x={innerX + innerW / 2} y={innerY + innerH / 2} textAnchor="middle" fontSize={Math.min(innerW, 220) * 0.09} fill="#94a3b8">
                {idx + 1}
              </text>
            </g>
          );
        })}

        {/* декоративные раскладки */}
        {product.verticalMoldings.enabled &&
          Array.from({ length: Math.max(0, Math.floor(W / product.verticalMoldings.stepMm) - 1) }).map((_, i) => (
            <rect
              key={`vm-${i}`}
              x={(i + 1) * product.verticalMoldings.stepMm - product.verticalMoldings.widthMm / 2}
              y={FACE_MM}
              width={product.verticalMoldings.widthMm}
              height={H - FACE_MM * 2}
              fill={profileColorHex}
              opacity={0.85}
            />
          ))}
        {product.horizontalMoldings.enabled &&
          Array.from({ length: Math.max(0, Math.floor(H / product.horizontalMoldings.stepMm) - 1) }).map((_, i) => (
            <rect
              key={`hm-${i}`}
              x={FACE_MM}
              y={(i + 1) * product.horizontalMoldings.stepMm - product.horizontalMoldings.widthMm / 2}
              width={W - FACE_MM * 2}
              height={product.horizontalMoldings.widthMm}
              fill={profileColorHex}
              opacity={0.85}
            />
          ))}

        {/* габаритные размеры */}
        <DimLine x1={0} y1={-16} x2={W} y2={-16} label={`${Math.round(W)} мм`} />
        <DimLine x1={-16} y1={0} x2={-16} y2={H} label={`${Math.round(H)} мм`} vertical />

        {/* размеры секций */}
        {sectionBoxes.map((b) => (
          <text key={`lbl-${b.sec.id}`} x={b.x + b.w / 2} y={H + 34} textAnchor="middle" fontSize={22} fill="#64748b">
            {Math.round(b.w)}
          </text>
        ))}
      </g>
      {ral && (
        <text x={padLeft} y={vbH - 6} fontSize={20} fill="#94a3b8">
          Профиль: {ral.code} · {ral.name}
        </text>
      )}
    </svg>
  );
}

function FixedCell({
  x,
  y,
  w,
  h,
  rows,
  profileColorHex,
  glass,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rows: number;
  profileColorHex: string;
  glass: GlassType;
}) {
  const cellH = h / rows;
  return (
    <g>
      {Array.from({ length: rows }).map((_, r) => (
        <rect
          key={r}
          x={x + 8}
          y={y + r * cellH + 8}
          width={Math.max(w - 16, 1)}
          height={Math.max(cellH - 16, 1)}
          fill={glass.colorHex}
          fillOpacity={glass.opacity}
          stroke="#94a3b8"
          strokeWidth={2}
        />
      ))}
      {Array.from({ length: rows - 1 }).map((_, r) => (
        <rect key={`hi-${r}`} x={x} y={y + (r + 1) * cellH - IMPOST_FACE_MM / 2} width={w} height={IMPOST_FACE_MM} fill={profileColorHex} />
      ))}
    </g>
  );
}

function DoorLeaf({
  x,
  y,
  w,
  h,
  opening,
  profileColorHex,
  glass,
  open,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  opening: Section['opening'];
  profileColorHex: string;
  glass: GlassType;
  open: boolean;
}) {
  const gap = 8;
  const fx = x + gap;
  const fy = y + gap;
  const fw = w - gap * 2;
  const fh = h - gap * 2;
  const isSlide = opening === 'slideLeft' || opening === 'slideRight';
  const dir = opening === 'slideLeft' || opening === 'swingLeft' ? -1 : 1;

  const slideOffset = open ? dir * fw * 0.92 : 0;

  return (
    <g style={{ transition: 'transform 500ms ease' }} transform={isSlide ? `translate(${slideOffset},0)` : undefined}>
      {/* полотно */}
      <g fill={profileColorHex}>
        <rect x={fx} y={fy} width={fw} height={LEAF_FACE_MM} />
        <rect x={fx} y={fy + fh - LEAF_FACE_MM} width={fw} height={LEAF_FACE_MM} />
        <rect x={fx} y={fy} width={LEAF_FACE_MM} height={fh} />
        <rect x={fx + fw - LEAF_FACE_MM} y={fy} width={LEAF_FACE_MM} height={fh} />
      </g>
      <rect
        x={fx + LEAF_FACE_MM}
        y={fy + LEAF_FACE_MM}
        width={Math.max(fw - LEAF_FACE_MM * 2, 1)}
        height={Math.max(fh - LEAF_FACE_MM * 2, 1)}
        fill={glass.colorHex}
        fillOpacity={glass.opacity}
        stroke="#94a3b8"
        strokeWidth={2}
      />
      {/* ручка */}
      <rect
        x={dir === 1 ? fx + fw - LEAF_FACE_MM - 14 : fx + LEAF_FACE_MM}
        y={fy + fh / 2 - 60}
        width={10}
        height={120}
        rx={5}
        fill="#1e293b"
      />

      {!isSlide && !open && (
        <path
          d={
            dir === 1
              ? `M ${fx + fw} ${fy + fh} A ${fw} ${fw} 0 0 0 ${fx} ${fy + fh - fw}`
              : `M ${fx} ${fy + fh} A ${fw} ${fw} 0 0 1 ${fx + fw} ${fy + fh - fw}`
          }
          fill="none"
          stroke="#94a3b8"
          strokeDasharray="10 8"
          strokeWidth={3}
        />
      )}
      {isSlide && (
        <text x={fx + fw / 2} y={fy - 10} textAnchor="middle" fontSize={26} fill="#94a3b8">
          {dir === 1 ? '→' : '←'}
        </text>
      )}
    </g>
  );
}

function DimLine({ x1, y1, x2, y2, label, vertical }: { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean }) {
  return (
    <g stroke="#94a3b8" strokeWidth={1.5}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text
        x={vertical ? x1 - 8 : (x1 + x2) / 2}
        y={vertical ? (y1 + y2) / 2 : y1 - 8}
        fontSize={22}
        fill="#64748b"
        stroke="none"
        textAnchor="middle"
        transform={vertical ? `rotate(-90 ${x1 - 8} ${(y1 + y2) / 2})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}
