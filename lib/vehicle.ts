import * as THREE from 'three';
import type { Comp, CompInput, SubComp, SubInput, VehicleDef, VehicleLike, VisualState, Labelable } from './types';
import { V3 } from './geometry';
import { makeGhost } from './materials';
import { TK } from './tokens';

export class Vehicle implements VehicleLike {
  id: string; no: string; zh: string; en: string; h: number; rad = 2;
  desc: string; specs: [string, string][]; cam: VehicleDef['cam']; seqs: VehicleDef['seqs'];
  root = new THREE.Group();
  comps: Comp[] = [];
  groups: Record<string, THREE.Group> = {};
  refs: Record<string, any> = {};
  params: Record<string, number> = {};
  appliers: Record<string, (v: number, self: VehicleLike) => void> = {};
  defs: Record<string, number> = {};
  plumes: any[] = [];
  pickMeshes: THREE.Object3D[] = [];

  constructor(def: VehicleDef) {
    this.id = def.id; this.no = def.no; this.zh = def.zh; this.en = def.en; this.h = def.h;
    this.desc = def.desc; this.specs = def.specs; this.cam = def.cam; this.seqs = def.seqs;

    def.build(this);

    for (const c of this.comps) {
      // 外殼網格：排除 inner group 底下的次元件
      this.hydrate(c, c.obj, c.inner, true);
      if (c.subs) for (const s of c.subs) this.hydrate(s, s.obj, undefined, false);
    }
    this.reset();
  }

  /** 收集網格、複製材質、建立幽靈材質、算出爆炸與錨點向量。 */
  private hydrate(node: Comp | SubComp, obj: THREE.Object3D, skip: THREE.Object3D | undefined, isComp: boolean) {
    node.meshes = [];
    const walk = (o: THREE.Object3D) => {
      if (skip && o === skip) return;
      const m = o as THREE.Mesh;
      if ((m as any).isMesh || (m as any).isInstancedMesh) {
        const transparent = !!(m.material && (m.material as THREE.Material).transparent);
        m.castShadow = !transparent;
        m.receiveShadow = true;
        m.material = (m.material as THREE.Material).clone();
        (m.userData as any)[isComp ? 'comp' : 'sub'] = node;
        node.meshes.push(m);
        if (isComp) this.pickMeshes.push(m);
      }
      for (const ch of o.children) walk(ch);
    };
    walk(obj);
    node.orig = node.meshes.map((m) => m.material as THREE.Material);
    node.ghosts = node.meshes.map(() => makeGhost());
    node.baseP = obj.position.clone();
    node.exV = V3((node.ex && node.ex[0]) || 0, (node.ex && node.ex[1]) || 0, (node.ex && node.ex[2]) || 0);
    if (node.anchor) node.anchorV = V3(node.anchor[0], node.anchor[1], node.anchor[2]);
  }

  grp(n: string, parent?: THREE.Object3D) {
    const g = new THREE.Group();
    (parent || this.root).add(g);
    this.groups[n] = g;
    return g;
  }

  comp(o: CompInput): Comp {
    const c = { en: '', ...o } as Comp;
    (o.parent || this.root).add(o.obj);
    if (o.innerOffset) {
      const inner = new THREE.Group();
      inner.position.set(o.innerOffset[0], o.innerOffset[1], o.innerOffset[2]);
      inner.visible = false;
      o.obj.add(inner);
      c.inner = inner;
    }
    this.comps.push(c);
    return c;
  }

  /** 掛一個次元件到父元件內部。座標系＝父元件本地座標（必要時用 innerOffset 校正）。 */
  sub(parent: Comp, o: SubInput): SubComp {
    if (!parent.inner) {
      const inner = new THREE.Group();
      inner.visible = false;
      parent.obj.add(inner);
      parent.inner = inner;
    }
    if (!parent.subs) parent.subs = [];
    const s = { en: '', ...o } as SubComp;
    parent.inner.add(o.obj);
    parent.subs.push(s);
    return s;
  }

  ap(k: string, d: number, f: (v: number, self: VehicleLike) => void) {
    this.appliers[k] = f;
    this.defs[k] = d;
  }
  setParam(k: string, v: number) {
    this.params[k] = v;
    this.appliers[k]?.(v, this);
  }
  reset() { for (const k in this.appliers) this.setParam(k, this.defs[k]); }
  find(id: string) { return this.comps.find((c) => c.id === id); }
  findSub(compId: string, subId: string) {
    return this.find(compId)?.subs?.find((s) => s.id === subId);
  }

  setGlow(node: { meshes: THREE.Mesh[] } | undefined | null, k: number) {
    if (!node) return;
    for (const me of node.meshes) {
      const mat = me.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.emissive) continue;
      mat.emissive.setHex(k > 0 ? TK.acc : 0x000000);
      mat.emissiveIntensity = k;
    }
  }

  /**
   * 單一入口套用所有視覺狀態。四種情境：
   *  - solid / wire：只有外殼，內部收起
   *  - xray：外殼變幽靈，「全機所有內部構造」同時現形（這次升級的核心體驗）
   *  - drill：只留下被拆解的元件，外殼變幽靈，內部零件可個別點選／爆炸
   */
  applyState(st: VisualState) {
    const drill = st.drillId ? this.find(st.drillId) : null;
    const xrayAll = st.view === 'xray' && !drill;

    for (const c of this.comps) {
      if (drill) {
        const on = c === drill;
        c.obj.visible = on;
        if (c.inner) c.inner.visible = on;
        if (!on) continue;
        // 外殼一律幽靈化，讓內部看得見
        c.meshes.forEach((m, i) => { m.material = c.ghosts[i]; });
        this.setGlow(c, 0);
        c.obj.position.copy(c.baseP);
        this.applySubs(c, st);
        continue;
      }

      c.obj.visible = !st.isolate || !st.selectedId || c.id === st.selectedId;
      c.obj.position.copy(c.baseP).addScaledVector(c.exV, st.explode);
      if (c.inner) c.inner.visible = xrayAll;

      const sel = c.id === st.selectedId;
      c.meshes.forEach((m, i) => {
        if (xrayAll) {
          m.material = c.ghosts[i];
        } else {
          const om = c.orig[i] as THREE.MeshStandardMaterial;
          m.material = om;
          om.wireframe = st.view === 'wire';
        }
      });
      this.setGlow(c, sel ? 0.55 : 0);

      // X 光模式：內部零件以實體材質呈現，並跟著爆炸值散開
      if (c.subs) {
        for (const s of c.subs) {
          s.obj.visible = xrayAll;
          if (!xrayAll) continue;
          s.obj.position.copy(s.baseP).addScaledVector(s.exV, st.explode * 0.55);
          s.meshes.forEach((m, i) => {
            const om = s.orig[i] as THREE.MeshStandardMaterial;
            m.material = om;
            om.wireframe = false;
          });
          this.setGlow(s, 0);
        }
      }
    }
  }

  private applySubs(c: Comp, st: VisualState) {
    if (!c.subs) return;
    for (const s of c.subs) {
      const solo = st.isolate && st.subId;
      s.obj.visible = !solo || s.id === st.subId;
      s.obj.position.copy(s.baseP).addScaledVector(s.exV, st.explode);
      s.meshes.forEach((m, i) => {
        const om = s.orig[i] as THREE.MeshStandardMaterial;
        m.material = om;
        om.wireframe = st.view === 'wire';
      });
      this.setGlow(s, s.id === st.subId ? 0.55 : 0);
    }
  }

  /** 拆解時標註內部零件，否則標註外部元件。 */
  labelTargets(drillId: string | null): Labelable[] {
    if (drillId) {
      const c = this.find(drillId);
      return (c?.subs || []).filter((s) => s.anchorV) as unknown as Labelable[];
    }
    return this.comps.filter((c) => c.anchorV) as unknown as Labelable[];
  }

  /** 只有實體模式才需要遮擋測試——幽靈外殼是透明的，不該擋住標籤。 */
  occluders(st: VisualState): THREE.Object3D[] {
    if (st.drillId) {
      const c = this.find(st.drillId);
      return (c?.subs || []).flatMap((s) => s.meshes);
    }
    return st.view === 'solid' ? this.pickMeshes : [];
  }
}
