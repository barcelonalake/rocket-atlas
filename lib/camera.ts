import * as THREE from 'three';
import type { CamCfg } from './types';

// Minimal surface of drei's CameraControls that we actually use — avoids a
// direct dependency on the camera-controls package for typing.
interface Cc {
  setLookAt(px: number, py: number, pz: number, tx: number, ty: number, tz: number, t?: boolean): Promise<void>;
  fitToSphere(sphere: THREE.Sphere, t: boolean): Promise<void>;
}

let controls: Cc | null = null;
export const setControls = (c: Cc | null) => { controls = c; };
export const getControls = () => controls;

const sph = (target: THREE.Vector3, r: number, th: number, ph: number) => {
  const s = Math.sin(ph);
  return new THREE.Vector3(
    target.x + r * s * Math.sin(th),
    target.y + r * Math.cos(ph),
    target.z + r * s * Math.cos(th)
  );
};

export function flyToVehicle(def: { h: number; cam: CamCfg }, immediate = false) {
  if (!controls) return;
  const tgt = new THREE.Vector3(0, def.h * 0.5, 0);
  const pos = sph(tgt, def.cam.r, def.cam.th, def.cam.ph);
  controls.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, !immediate);
}

export function preset(name: string, def: { h: number; cam: CamCfg }) {
  if (!controls) return;
  const h = def.h, r = def.cam.r;
  const map: Record<string, [number, number, number]> = {
    front: [0, 1.3, r], side: [Math.PI / 2, 1.3, r], top: [0, 0.12, r * 0.9],
    iso: [0.62, 1.16, r], up: [0.6, 2.7, r * 0.55],
  };
  const m = map[name]; if (!m) return;
  const ty = name === 'up' ? h * 0.18 : h * 0.5;
  const tgt = new THREE.Vector3(0, ty, 0);
  const pos = sph(tgt, m[2], m[0], m[1]);
  controls.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, true);
}

export function fitSphere(center: THREE.Vector3, radius: number) {
  if (!controls) return;
  controls.fitToSphere(new THREE.Sphere(center, Math.max(0.5, radius)), true);
}
