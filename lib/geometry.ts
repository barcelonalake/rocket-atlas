import * as THREE from 'three';

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sstep = (t: number) => t * t * (3 - 2 * t);

type Pair = [number, number];
type Trip = [number, number, number];

export function lat(pairs: Pair[], seg = 48, ps = 0, pl = Math.PI * 2) {
  return new THREE.LatheGeometry(pairs.map((p) => new THREE.Vector2(p[0], p[1])), seg, ps, pl);
}
export function bellPts(rt: number, re: number, L: number, seg = 22, pw = 0.7): Pair[] {
  const a: Pair[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    a.push([rt + (re - rt) * Math.pow(t, pw), -t * L]);
  }
  return a;
}
export const shift = (pairs: Pair[], dy: number): Pair[] => pairs.map((p) => [p[0], p[1] + dy]);
export const M = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
export const cylM = (rt: number, rb: number, h: number, mat: THREE.Material, seg = 32, open = false) =>
  M(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat);
export const boxM = (x: number, y: number, z: number, mat: THREE.Material) =>
  M(new THREE.BoxGeometry(x, y, z), mat);
export function torM(r: number, t: number, mat: THREE.Material, seg = 40) {
  const m = M(new THREE.TorusGeometry(r, t, 10, seg), mat);
  m.rotation.x = Math.PI / 2;
  return m;
}
export function tube(pts: (Trip | THREE.Vector3)[], r: number, mat: THREE.Material, seg = 48) {
  const c = new THREE.CatmullRomCurve3(pts.map((p) => (Array.isArray(p) ? V3(p[0], p[1], p[2]) : p)));
  const m = M(new THREE.TubeGeometry(c, seg, r, 10, false), mat);
  (m.userData as any).curve = c;
  return m;
}
export const curveOf = (pts: Trip[]) => new THREE.CatmullRomCurve3(pts.map((p) => V3(p[0], p[1], p[2])));
export function dome(r: number, h: number, mat: THREE.Material, seg = 40) {
  const pr: Pair[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI / 2;
    pr.push([Math.cos(t) * r, Math.sin(t) * h]);
  }
  return M(lat(pr, seg), mat);
}
export function gridFin(w: number, h: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const t = 0.06, d = 0.3;
  const fr = (x: number, y: number, sx: number, sy: number) => {
    const b = boxM(sx, sy, d, mat); b.position.set(x, y, 0); g.add(b);
  };
  fr(0, h / 2, w, t); fr(0, -h / 2, w, t); fr(-w / 2, 0, t, h); fr(w / 2, 0, t, h);
  for (let i = 1; i < 7; i++) { const b = boxM(0.035, h - 0.08, d * 0.8, mat); b.position.x = -w / 2 + (i * w) / 7; g.add(b); }
  for (let j = 1; j < 8; j++) { const b = boxM(w - 0.08, 0.035, d * 0.8, mat); b.position.y = -h / 2 + (j * h) / 8; g.add(b); }
  return g;
}
