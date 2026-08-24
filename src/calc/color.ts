import type { PaintOption, RalColor } from '../types';

export function resolveProfileColor(paintOption: PaintOption | undefined, ralColors: RalColor[]): string {
  if (!paintOption) return '#c9ccd1';
  if (paintOption.coating === 'none') return '#c9ccd1'; // естественный алюминий
  if (paintOption.ralId) {
    const ral = ralColors.find((r) => r.id === paintOption.ralId);
    if (ral) return ral.hex;
  }
  if (paintOption.coating === 'decorative') return '#8a6a4a';
  if (paintOption.coating === 'anodizing') return '#9aa0a6';
  return '#2b2f36';
}
