import * as THREE from 'three';
import { TK } from './tokens';

// 全域唯一的剖面平面，所有材質共用。constant = 1e6 代表「關閉剖切」。
export const SECTION_PLANE = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e6);

const cp = [SECTION_PLANE];
type Opt = ConstructorParameters<typeof THREE.MeshStandardMaterial>[0];
const mk = (o: Opt) => {
  const m = new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.6, ...o });
  m.clippingPlanes = cp;
  m.clipShadows = true;
  return m;
};

const DS = THREE.DoubleSide;

export const MAT = {
  steel: mk({ color: 0xd9dcdf, metalness: 0.95, roughness: 0.24, envMapIntensity: 1.15, side: DS }),
  soot: mk({ color: 0x6f7073, metalness: 0.8, roughness: 0.55 }),
  white: mk({ color: 0xf1f2f3, metalness: 0.06, roughness: 0.42, side: DS }),
  black: mk({ color: 0x212428, metalness: 0.25, roughness: 0.55, side: DS }),
  carbon: mk({ color: 0x26282e, metalness: 0.4, roughness: 0.4, side: DS }),
  ti: mk({ color: 0xb9a789, metalness: 0.95, roughness: 0.36 }),
  inco: mk({ color: 0x8d8983, metalness: 0.9, roughness: 0.5, side: DS }),
  cu: mk({ color: 0xc97a4b, metalness: 0.92, roughness: 0.32 }),
  nio: mk({ color: 0x6d6058, metalness: 0.88, roughness: 0.44, side: DS }),
  tile: mk({ color: 0x2b2d30, metalness: 0.08, roughness: 0.95 }),
  pica: mk({ color: 0x8a5a3a, metalness: 0.05, roughness: 0.9 }),
  solar: mk({ color: 0x0e1622, metalness: 0.6, roughness: 0.25 }),
  gold: mk({ color: 0xc9a23f, metalness: 1, roughness: 0.34 }),
  dark: mk({ color: 0x3a3d41, metalness: 0.6, roughness: 0.5 }),
  grey: mk({ color: 0x9aa0a6, metalness: 0.7, roughness: 0.45 }),
  glass: mk({ color: 0xaec7cf, metalness: 0.3, roughness: 0.12, transparent: true, opacity: 0.55 }),
  alu: mk({ color: 0xc8cbcf, metalness: 0.85, roughness: 0.38, side: DS }),
  felt: mk({ color: 0xb9b2a4, metalness: 0.02, roughness: 0.98 }),
  seat: mk({ color: 0x2f3338, metalness: 0.1, roughness: 0.8 }),
  loxV: mk({ color: TK.lox, metalness: 0, roughness: 0.9, transparent: true, opacity: 0.26, side: DS, depthWrite: false }),
  fuelV: mk({ color: TK.fuel, metalness: 0, roughness: 0.9, transparent: true, opacity: 0.26, side: DS, depthWrite: false }),
};
export type MatKey = keyof typeof MAT;

/** X 光／幽靈外殼的基礎材質；每個 mesh 各自 clone 一份，才能單獨高亮。 */
const GHOST_BASE = new THREE.MeshStandardMaterial({
  color: 0x9aa8b0, transparent: true, opacity: 0.12, roughness: 0.85, metalness: 0,
  depthWrite: false, side: THREE.DoubleSide,
});
GHOST_BASE.clippingPlanes = cp;

export function makeGhost() {
  const g = GHOST_BASE.clone();
  g.clippingPlanes = cp;
  return g;
}

export function setSection(on: boolean, v: number, rad: number) {
  SECTION_PLANE.constant = on ? v * rad : 1e6;
}
