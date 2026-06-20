export function pixelToRem(pixels: number, baseSize = 16): number {
  return pixels / baseSize;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const PIXEL_COLORS = {
  bgDark: '#3D2914',
  bgMedium: '#5C3D1E',
  bgLight: '#7A5230',
  textPrimary: '#F5E6D3',
  textSecondary: '#D4C4A8',
  accentGold: '#C9A227',
  accentRed: '#8B2635',
  accentGreen: '#2D5A27',
  accentBlue: '#2C3E50',
  border: '#1A0F08',
  shadow: 'rgba(0, 0, 0, 0.5)',
} as const;

export function getMoodColor(mood: string | number): string {
  if (typeof mood === 'number') {
    if (mood >= 80) return PIXEL_COLORS.accentGreen;
    if (mood >= 60) return PIXEL_COLORS.accentGold;
    if (mood >= 40) return PIXEL_COLORS.textSecondary;
    if (mood >= 20) return '#E67E22';
    return PIXEL_COLORS.accentRed;
  }
  switch (mood) {
    case 'happy': return PIXEL_COLORS.accentGreen;
    case 'content': return PIXEL_COLORS.accentGold;
    case 'neutral': return PIXEL_COLORS.textSecondary;
    case 'frustrated': return '#E67E22';
    case 'angry': return PIXEL_COLORS.accentRed;
    default: return PIXEL_COLORS.textSecondary;
  }
}

export function getQualityColor(quality: number): string {
  if (quality >= 80) return PIXEL_COLORS.accentGreen;
  if (quality >= 60) return PIXEL_COLORS.accentGold;
  if (quality >= 40) return '#E67E22';
  return PIXEL_COLORS.accentRed;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'food': return '#E67E22';
    case 'beverage': return '#3498DB';
    case 'supplies': return '#9B59B6';
    case 'maintenance': return '#7F8C8D';
    case 'decoration': return '#E91E63';
    case 'guest': return '#27AE60';
    case 'hotel': return '#F39C12';
    case 'history': return '#8B4513';
    case 'secret': return '#2C3E50';
    case 'item': return '#16A085';
    default: return PIXEL_COLORS.textSecondary;
  }
}
