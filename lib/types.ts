import type * as THREE from 'three';

/** 每個元件（與次元件）的教育內容。why 是這次升級的靈魂：不只講「是什麼」，講「為什麼非這樣不可」。 */
export interface CompInfo {
  mat: string;
  fn: string;
  spec: string;
  why?: string;
  ds: string;
}

interface NodeBase {
  id: string;
  zh: string;
  en: string;
  obj: THREE.Object3D;
  ex?: [number, number, number];
  anchor?: [number, number, number];
  info: CompInfo;
  meshes: THREE.Mesh[];
  orig: THREE.Material[];
  ghosts: THREE.Material[];
  baseP: THREE.Vector3;
  exV: THREE.Vector3;
  anchorV?: THREE.Vector3;
}

/** 次元件：住在父元件的 inner group 裡，平時隱藏，拆解／X 光時現身。 */
export interface SubComp extends NodeBase {}

export interface Comp extends NodeBase {
  parent?: THREE.Object3D;
  inner?: THREE.Group;
  subs?: SubComp[];
}

export type CompInput = {
  id: string; zh: string; en?: string;
  obj: THREE.Object3D; parent?: THREE.Object3D;
  ex?: [number, number, number]; anchor?: [number, number, number];
  /** inner group 的位移，用於父元件本身有 pivot 偏移時（例如整流罩） */
  innerOffset?: [number, number, number];
  info: CompInfo;
};

export type SubInput = {
  id: string; zh: string; en?: string;
  obj: THREE.Object3D;
  ex?: [number, number, number]; anchor?: [number, number, number];
  info: CompInfo;
};

/** 標籤系統只需要這些欄位，元件與次元件共用。 */
export interface Labelable {
  id: string; zh: string; en: string;
  obj: THREE.Object3D;
  anchorV?: THREE.Vector3;
}

export interface Track { p: string; k: [number, number][] }
export interface FlowPath {
  curve: THREE.Curve<THREE.Vector3>;
  color: number; n?: number; size?: number; speed?: number;
}
export interface Sequence {
  name: string; en?: string; dur?: number; loop?: boolean;
  type?: 'flow';
  marks?: [number, string][];
  tracks?: Track[];
  paths?: (v: VehicleLike) => FlowPath[];
  legend?: [string, string][];
  note?: string;
}

export interface CamCfg { r: number; th: number; ph: number }

export interface VehicleDef {
  id: string; no: string; zh: string; en: string; h: number;
  cam: CamCfg; specs: [string, string][]; desc: string;
  build: (v: VehicleLike) => void; seqs: Sequence[];
}

export type ViewMode = 'solid' | 'wire' | 'xray';

/** 驅動 applyState 的視覺狀態切片。 */
export interface VisualState {
  view: ViewMode;
  selectedId: string | null;
  drillId: string | null;
  subId: string | null;
  explode: number;
  isolate: boolean;
}

export interface VehicleLike {
  id: string; no: string; zh: string; en: string; h: number; rad: number;
  root: THREE.Group;
  comps: Comp[];
  groups: Record<string, THREE.Group>;
  refs: Record<string, any>;
  params: Record<string, number>;
  appliers: Record<string, (v: number, self: VehicleLike) => void>;
  defs: Record<string, number>;
  plumes: any[];
  cam: CamCfg; specs: [string, string][]; desc: string; seqs: Sequence[];
  pickMeshes: THREE.Object3D[];
  grp(n: string, parent?: THREE.Object3D): THREE.Group;
  comp(o: CompInput): Comp;
  sub(parent: Comp, o: SubInput): SubComp;
  ap(k: string, d: number, f: (v: number, self: VehicleLike) => void): void;
  setParam(k: string, v: number): void;
  reset(): void;
  find(id: string): Comp | undefined;
  findSub(compId: string, subId: string): SubComp | undefined;
  applyState(st: VisualState): void;
  labelTargets(drillId: string | null): Labelable[];
  occluders(st: VisualState): THREE.Object3D[];
  setGlow(node: { meshes: THREE.Mesh[] } | undefined | null, k: number): void;
}
