export function heatColor(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  const alpha = 0.16 + clamped * 0.5;

  if (clamped < 0.35) {
    return `rgba(41, 182, 246, ${alpha})`;
  }

  if (clamped < 0.7) {
    return `rgba(255, 213, 79, ${alpha})`;
  }

  return `rgba(255, 82, 82, ${alpha})`;
}
