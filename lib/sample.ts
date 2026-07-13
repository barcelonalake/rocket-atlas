import { lerp, sstep } from './geometry';

export function sample(keys: [number, number][], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return lerp(a[1], b[1], sstep(u));
    }
  }
  return keys[keys.length - 1][1];
}
