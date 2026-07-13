import * as THREE from 'three';
import type { FlowPath } from './types';

const flowTex = (() => {
  if (typeof document === 'undefined') return null as any;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

interface Item {
  c: THREE.Curve<THREE.Vector3>; n: number; off: number; sp: number;
  pos: Float32Array; ge: THREE.BufferGeometry; pts: THREE.Points;
}

export class FlowSys {
  items: Item[] = [];
  on = false;
  t = 0;
  group: THREE.Group | null = null;
  private _v = new THREE.Vector3();

  clear() {
    if (this.group) {
      this.items.forEach((it) => {
        this.group!.remove(it.pts);
        it.ge.dispose();
        (it.pts.material as THREE.Material).dispose();
      });
      this.group.parent?.remove(this.group);
    }
    this.items = [];
    this.group = null;
    this.on = false;
  }

  set(paths: FlowPath[], parent: THREE.Object3D) {
    this.clear();
    this.group = new THREE.Group();
    parent.add(this.group);
    for (const p of paths) {
      const n = p.n || 22;
      const pos = new Float32Array(n * 3);
      const ge = new THREE.BufferGeometry();
      ge.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const ma = new THREE.PointsMaterial({
        color: p.color, size: p.size || 0.09, map: flowTex,
        transparent: true, depthWrite: false, sizeAttenuation: true,
      });
      const pts = new THREE.Points(ge, ma);
      pts.frustumCulled = false;
      pts.renderOrder = 6;
      this.group.add(pts);
      this.items.push({ c: p.curve, n, off: Math.random(), sp: p.speed || 0.14, pos, ge, pts });
    }
  }

  upd(dt: number) {
    if (!this.on || !this.items.length) return;
    this.t += dt;
    for (const it of this.items) {
      for (let i = 0; i < it.n; i++) {
        const uu = (i / it.n + this.t * it.sp + it.off) % 1;
        it.c.getPoint(uu, this._v);
        it.pos[i * 3] = this._v.x;
        it.pos[i * 3 + 1] = this._v.y;
        it.pos[i * 3 + 2] = this._v.z;
      }
      it.ge.attributes.position.needsUpdate = true;
    }
  }
}
