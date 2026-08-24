// Оптимальный раскрой хлыстов (First-Fit-Decreasing bin packing).
// Формулы (длина хлыста, потери на пропил) приходят из настроек, не зашиты в код.

export interface PackedBar {
  pieces: number[];
  usedMm: number;
}

export interface CutPlan {
  barsUsed: number;
  totalBarMm: number;
  totalUsedMm: number;
  wastePercent: number;
  bars: PackedBar[];
}

export function packBars(pieceLengthsMm: number[], barLengthMm: number, kerfMm: number): CutPlan {
  const pieces = pieceLengthsMm.filter((p) => p > 0).sort((a, b) => b - a);
  const bars: PackedBar[] = [];

  for (const len of pieces) {
    const need = len + kerfMm;
    let target = bars.find((b) => barLengthMm - b.usedMm >= need);
    if (!target) {
      target = { pieces: [], usedMm: 0 };
      bars.push(target);
    }
    target.pieces.push(len);
    target.usedMm += need;
  }

  const totalUsedMm = pieces.reduce((s, x) => s + x, 0);
  const totalBarMm = bars.length * barLengthMm;
  const wastePercent = totalBarMm > 0 ? ((totalBarMm - totalUsedMm) / totalBarMm) * 100 : 0;

  return {
    barsUsed: bars.length,
    totalBarMm,
    totalUsedMm,
    wastePercent: Number(wastePercent.toFixed(1)),
    bars,
  };
}
