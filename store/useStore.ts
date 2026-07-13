import { create } from 'zustand';
import type { ViewMode, VisualState } from '@/lib/types';
import { DEFS } from '@/lib/defs';

interface Store extends VisualState {
  vehicleId: string;
  sectionOn: boolean;
  section: number;
  labelsOn: boolean;
  dimsOn: boolean;
  seqName: string | null;
  playing: boolean;
  t: number;
  speed: number;
  loop: boolean;

  setVehicle: (id: string) => void;
  select: (id: string | null) => void;
  drill: (compId: string, subId?: string | null) => void;
  exitDrill: () => void;
  selectSub: (id: string | null) => void;
  setView: (v: ViewMode) => void;
  toggleIsolate: () => void;
  setExplode: (v: number) => void;
  setSectionRaw: (raw: number) => void;
  toggleLabels: () => void;
  toggleDims: () => void;
  loadSeq: (name: string | null) => void;
  setPlaying: (p: boolean) => void;
  setT: (t: number) => void;
  cycleSpeed: () => void;
  toggleLoop: () => void;
  resetView: () => void;
}

const CLEAR = {
  selectedId: null, drillId: null, subId: null, isolate: false,
  explode: 0, sectionOn: false, section: 0,
  seqName: null, playing: false, t: 0, loop: false,
} as const;

export const useStore = create<Store>((set, get) => ({
  vehicleId: 'f9',
  view: 'solid',
  labelsOn: true,
  dimsOn: true,
  speed: 1,
  ...CLEAR,

  setVehicle: (id) => {
    if (id === get().vehicleId) return;
    set({ vehicleId: id, view: 'solid', ...CLEAR });
  },

  select: (id) => set({ selectedId: id, isolate: id ? get().isolate : false }),

  // 進入拆解：清掉序列（序列會移動整具元件，與拆解互斥），保留檢視模式
  drill: (compId, subId = null) => set({
    drillId: compId, subId, selectedId: compId,
    isolate: false, explode: 0, seqName: null, playing: false, t: 0,
  }),
  exitDrill: () => set({ drillId: null, subId: null, isolate: false, explode: 0 }),
  selectSub: (id) => set({ subId: id, isolate: id ? get().isolate : false }),

  setView: (v) => set({ view: v }),

  toggleIsolate: () => {
    const { drillId, subId, selectedId, isolate } = get();
    if (drillId ? !subId : !selectedId) return;
    set({ isolate: !isolate });
  },

  setExplode: (v) => set({ explode: v }),
  setSectionRaw: (raw) => {
    if (raw <= -100) set({ sectionOn: false, section: -1 });
    else set({ sectionOn: true, section: raw / 100 });
  },
  toggleLabels: () => set({ labelsOn: !get().labelsOn }),
  toggleDims: () => set({ dimsOn: !get().dimsOn }),

  // 播放序列會退出拆解模式
  loadSeq: (name) => set({
    seqName: name, t: 0, drillId: null, subId: null, explode: 0, isolate: false,
    playing: !!name && isFlow(get().vehicleId, name),
    loop: isLoop(get().vehicleId, name),
  }),
  setPlaying: (p) => set({ playing: p }),
  setT: (t) => set({ t }),
  cycleSpeed: () => set({ speed: get().speed === 1 ? 2 : get().speed === 2 ? 0.5 : 1 }),
  toggleLoop: () => set({ loop: !get().loop }),
  resetView: () => set({ view: 'solid', ...CLEAR }),
}));

function seqOf(vid: string, name: string | null) {
  if (!name) return null;
  const def = DEFS.find((d) => d.id === vid);
  return def?.seqs.find((s) => s.name === name) || null;
}
const isFlow = (vid: string, name: string | null) => seqOf(vid, name)?.type === 'flow';
const isLoop = (vid: string, name: string | null) => !!seqOf(vid, name)?.loop;
