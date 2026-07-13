'use client';
import { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer, Grid, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useVehicle } from './VehicleProvider';
import { useStore } from '@/store/useStore';
import { DEF_BY_ID } from '@/lib/defs';
import { setControls, flyToVehicle, fitSphere } from '@/lib/camera';
import { setSection } from '@/lib/materials';
import { FlowSys } from '@/lib/flow';
import { sample } from '@/lib/sample';
import type { OverlayReg } from './overlay';
import type { VisualState, Labelable } from '@/lib/types';

/* ---- CAD 地面距離環 ---- */
function RangeRings() {
  const geo = useRef<THREE.BufferGeometry[]>([]);
  if (geo.current.length === 0) {
    for (let r = 10; r <= 70; r += 10) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.03, Math.sin(a) * r)); }
      geo.current.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
  }
  return (<>{geo.current.map((g, i) => (
    <lineLoop key={i} geometry={g}><lineBasicMaterial color={0xcfccc2} transparent opacity={0.85} /></lineLoop>
  ))}</>);
}

function CameraRig() {
  const ref = useRef<any>(null);
  const vehicleId = useStore((s) => s.vehicleId);
  const first = useRef(true);
  useEffect(() => { setControls(ref.current); return () => setControls(null); }, []);
  useEffect(() => { flyToVehicle(DEF_BY_ID[vehicleId], first.current); first.current = false; }, [vehicleId]);
  return <CameraControls ref={ref} makeDefault minDistance={1.2} maxDistance={560} smoothTime={0.28} />;
}

const isVisible = (o: THREE.Object3D | null) => {
  let p: THREE.Object3D | null = o;
  while (p) { if (!p.visible) return false; p = p.parent; }
  return true;
};

const _box = new THREE.Box3();
const _sph = new THREE.Sphere();
function fitNode(meshes: THREE.Mesh[], pad: number) {
  _box.makeEmpty();
  meshes.forEach((m) => { m.updateWorldMatrix(true, false); _box.expandByObject(m); });
  if (_box.isEmpty()) return;
  _box.getBoundingSphere(_sph);
  fitSphere(_sph.center.clone(), Math.max(0.4, _sph.radius) * pad);
}

/* ---- 掛載載具 · 同步視覺狀態 · 拾取 ---- */
function VehicleMount({ overlay }: { overlay: OverlayReg }) {
  const vehicle = useVehicle()!;
  const view = useStore((s) => s.view);
  const selectedId = useStore((s) => s.selectedId);
  const drillId = useStore((s) => s.drillId);
  const subId = useStore((s) => s.subId);
  const explode = useStore((s) => s.explode);
  const isolate = useStore((s) => s.isolate);
  const hoverRef = useRef<{ meshes: THREE.Mesh[] } | null>(null);
  const hoverId = useRef<string | null>(null);

  const st: VisualState = { view, selectedId, drillId, subId, explode, isolate };

  useEffect(() => {
    vehicle.applyState(st);
    hoverRef.current = null; hoverId.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, view, selectedId, drillId, subId, explode, isolate]);

  // 進入拆解 / 切換次元件時，攝影機自動聚焦
  useEffect(() => {
    if (!drillId) return;
    const c = vehicle.find(drillId); if (!c) return;
    const node = subId ? vehicle.findSub(drillId, subId) : null;
    const raf = requestAnimationFrame(() => {
      if (node && node.meshes.length) fitNode(node.meshes, 3.4);
      else if (c.subs?.length) fitNode(c.subs.flatMap((s) => s.meshes), 2.3);
      else fitNode(c.meshes, 2.4);
    });
    return () => cancelAnimationFrame(raf);
  }, [vehicle, drillId, subId]);

  /** 解析點擊：拆解模式只認次元件；X 光模式優先認次元件；其餘認外部元件。 */
  const resolve = (e: any) => {
    const s = useStore.getState();
    const hits = (e.intersections || []) as { object: THREE.Object3D }[];
    if (s.drillId) {
      for (const it of hits) {
        if (!isVisible(it.object)) continue;
        const sub = (it.object.userData as any)?.sub;
        if (sub) return { sub, comp: (it.object.userData as any)?.comp };
      }
      return null;
    }
    if (s.view === 'xray') {
      for (const it of hits) {
        if (!isVisible(it.object)) continue;
        const sub = (it.object.userData as any)?.sub;
        if (sub) return { sub, comp: (it.object.userData as any)?.comp };
      }
    }
    for (const it of hits) {
      if (!isVisible(it.object)) continue;
      const ud = it.object.userData as any;
      if (ud?.comp && !ud?.sub) return { sub: null, comp: ud.comp };
    }
    return null;
  };

  const showTip = (label: string | null, e: any) => {
    const tip = overlay.tip; if (!tip) return;
    if (!label) { tip.classList.remove('on'); return; }
    tip.classList.add('on');
    tip.textContent = label;
    tip.style.left = e.nativeEvent.offsetX + 14 + 'px';
    tip.style.top = e.nativeEvent.offsetY + 12 + 'px';
  };

  return (
    <primitive
      object={vehicle.root}
      onPointerMove={(e: any) => {
        e.stopPropagation();
        const hit = resolve(e);
        const node = hit ? (hit.sub || hit.comp) : null;
        const id = node?.id ?? null;
        if (id !== hoverId.current) {
          const s = useStore.getState();
          const activeId = s.drillId ? s.subId : s.selectedId;
          if (hoverRef.current && hoverId.current !== activeId) vehicle.setGlow(hoverRef.current, 0);
          hoverId.current = id; hoverRef.current = node;
          if (node && id !== activeId) vehicle.setGlow(node, 0.32);
          document.body.style.cursor = node ? 'pointer' : '';
        }
        showTip(node ? node.zh : null, e);
      }}
      onPointerOut={() => {
        const s = useStore.getState();
        const activeId = s.drillId ? s.subId : s.selectedId;
        if (hoverRef.current && hoverId.current !== activeId) vehicle.setGlow(hoverRef.current, 0);
        hoverRef.current = null; hoverId.current = null;
        document.body.style.cursor = '';
        overlay.tip?.classList.remove('on');
      }}
      onClick={(e: any) => {
        e.stopPropagation();
        const s = useStore.getState();
        const hit = resolve(e);
        if (!hit) return;
        if (s.drillId) { s.selectSub(hit.sub.id); return; }
        if (hit.sub && hit.comp) { s.drill(hit.comp.id, hit.sub.id); return; }
        if (hit.comp) s.select(hit.comp.id);
      }}
      onDoubleClick={(e: any) => {
        e.stopPropagation();
        const s = useStore.getState();
        if (s.drillId) return;
        const hit = resolve(e);
        if (hit?.comp?.subs?.length) s.drill(hit.comp.id);
      }}
      onPointerMissed={() => {
        const s = useStore.getState();
        if (s.drillId) s.selectSub(null);
        else s.select(null);
      }}
    />
  );
}

function SectionSync() {
  const vehicle = useVehicle()!;
  const sectionOn = useStore((s) => s.sectionOn);
  const section = useStore((s) => s.section);
  useEffect(() => { setSection(sectionOn, section, vehicle.rad); }, [vehicle, sectionOn, section]);
  return null;
}

/* ---- 單一每幀驅動器 ---- */
function FrameDriver({ overlay }: { overlay: OverlayReg }) {
  const vehicle = useVehicle()!;
  const { camera, gl } = useThree();
  const flow = useRef(new FlowSys());
  const seqName = useStore((s) => s.seqName);

  useEffect(() => {
    const def = DEF_BY_ID[vehicle.id];
    const seq = seqName ? def.seqs.find((s) => s.name === seqName) : null;
    flow.current.clear();
    vehicle.reset();
    if (seq?.type === 'flow' && seq.paths) {
      flow.current.set(seq.paths(vehicle), vehicle.root);
      flow.current.on = true;
    } else if (seq?.tracks) {
      for (const tr of seq.tracks) vehicle.setParam(tr.p, sample(tr.k, 0));
    }
    return () => flow.current.clear();
  }, [vehicle, seqName]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    const st = useStore.getState();
    const def = DEF_BY_ID[vehicle.id];
    const seq = st.seqName ? def.seqs.find((s) => s.name === st.seqName) : null;

    if (seq && seq.type !== 'flow' && st.playing) {
      let t = st.t + (dt * st.speed) / (seq.dur || 1);
      if (t >= 1) { if (st.loop) t %= 1; else { t = 1; useStore.setState({ playing: false }); } }
      useStore.setState({ t });
      for (const tr of seq.tracks!) vehicle.setParam(tr.p, sample(tr.k, t));
    }

    const now = performance.now() / 1000;
    for (const p of vehicle.plumes) if (p.visible) p.userData.upd(now);
    flow.current.on = !!(seq && seq.type === 'flow' && st.playing);
    flow.current.upd(dt);

    projectOverlay(overlay, vehicle, camera as THREE.Camera, gl.domElement, st);
  });

  return null;
}

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _ray = new THREE.Raycaster();
function projectOverlay(ov: OverlayReg, vehicle: any, camera: THREE.Camera, canvas: HTMLCanvasElement, st: any) {
  ov.frame++;
  const W = canvas.clientWidth, H = canvas.clientHeight, cx = W / 2;
  const activeId: string | null = st.drillId ? st.subId : st.selectedId;
  const targets: Labelable[] = vehicle.labelTargets(st.drillId);
  const occ: THREE.Object3D[] = vehicle.occluders(st);

  type Item = { id: string; sx: number; sy: number; rec: { div: HTMLDivElement | null; line: SVGLineElement | null } };
  const buckets: { l: Item[]; r: Item[] } = { l: [], r: [] };

  ov.labels.forEach((rec, id) => {
    if (!targets.find((t) => t.id === id)) { rec.div?.classList.add('off'); rec.line?.classList.add('off'); }
  });

  for (const c of targets) {
    if (!c.anchorV) continue;
    const rec = ov.labels.get(c.id);
    if (!rec || !rec.div || !rec.line) continue;
    const hide = () => { rec.div!.classList.add('off'); rec.line!.classList.add('off'); };
    if (!st.labelsOn || !isVisible(c.obj)) { hide(); continue; }
    _v.copy(c.anchorV); c.obj.localToWorld(_v);
    _v2.copy(_v).project(camera);
    if (_v2.z > 1) { hide(); continue; }
    const sx = (_v2.x * 0.5 + 0.5) * W, sy = (-_v2.y * 0.5 + 0.5) * H;
    if (sx < -60 || sx > W + 60 || sy < -30 || sy > H + 30) { hide(); continue; }
    if (occ.length && ov.frame % 4 === 0) {
      _v2.copy(_v).sub(camera.position);
      const dist = _v2.length();
      _ray.set(camera.position, _v2.normalize());
      _ray.far = dist - 0.6;
      (rec as any)._occ = _ray.intersectObjects(occ, false).length > 0;
      _ray.far = Infinity;
    } else if (!occ.length) (rec as any)._occ = false;
    if ((rec as any)._occ) { hide(); continue; }
    buckets[sx < cx ? 'l' : 'r'].push({ id: c.id, sx, sy, rec });
  }

  for (const side of ['l', 'r'] as const) {
    const arr = buckets[side]; arr.sort((a, b) => a.sy - b.sy);
    let last = -1e9;
    for (const it of arr) {
      const ly = Math.max(it.sy, last + 26); last = ly;
      const lx = it.sx + (side === 'l' ? -56 : 56);
      const { div, line } = it.rec;
      div!.classList.remove('off'); line!.classList.remove('off');
      div!.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px) translate(${side === 'l' ? '-100%' : '0'},-50%)`;
      line!.setAttribute('x1', it.sx.toFixed(1)); line!.setAttribute('y1', it.sy.toFixed(1));
      line!.setAttribute('x2', lx.toFixed(1)); line!.setAttribute('y2', ly.toFixed(1));
      div!.classList.toggle('sel', activeId === it.id);
    }
  }

  const d = ov.dim;
  const hideDim = () => { [d.ln, d.t1, d.t2].forEach((e) => e?.classList.add('off')); d.lb?.classList.add('off'); };
  if (!st.dimsOn || st.drillId || !d.ln) { hideDim(); return; }
  const xw = -(vehicle.rad + 2.2);
  _v.set(xw, 0, 0); vehicle.root.localToWorld(_v); _v.project(camera);
  if (_v.z > 1) { hideDim(); return; }
  const x1 = (_v.x * 0.5 + 0.5) * W, y1 = (-_v.y * 0.5 + 0.5) * H;
  _v.set(xw, vehicle.h, 0); vehicle.root.localToWorld(_v); _v.project(camera);
  if (_v.z > 1) { hideDim(); return; }
  const x2 = (_v.x * 0.5 + 0.5) * W, y2 = (-_v.y * 0.5 + 0.5) * H;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = (dy / L) * 6, ny = (-dx / L) * 6;
  const set = (el: SVGLineElement, a: number, b: number, cc: number, dd: number) => {
    el.setAttribute('x1', a.toFixed(1)); el.setAttribute('y1', b.toFixed(1));
    el.setAttribute('x2', cc.toFixed(1)); el.setAttribute('y2', dd.toFixed(1)); el.classList.remove('off');
  };
  set(d.ln, x1, y1, x2, y2);
  set(d.t1!, x1 - nx, y1 - ny, x1 + nx, y1 + ny);
  set(d.t2!, x2 - nx, y2 - ny, x2 + nx, y2 + ny);
  if (d.lb) {
    d.lb.textContent = `H = ${vehicle.h} m`;
    d.lb.classList.remove('off');
    d.lb.style.transform = `translate(${((x1 + x2) / 2 - 8).toFixed(1)}px,${((y1 + y2) / 2).toFixed(1)}px) translate(-100%,-50%)`;
  }
}

function StudioEnv() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={['#f6f5f0']} />
      <Lightformer intensity={2.2} position={[-8, 10, 5]} scale={[10, 6, 1]} color="#ffffff" />
      <Lightformer intensity={1.4} position={[10, 4, -6]} scale={[12, 4, 1]} color="#fff3e6" />
      <Lightformer intensity={1.1} position={[2, 4, 10]} scale={[4, 10, 1]} color="#ffffff" />
      <Lightformer intensity={1.6} position={[0, 14, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[16, 3, 1]} color="#ffffff" />
    </Environment>
  );
}

export default function Scene({ overlay }: { overlay: OverlayReg }) {
  return (
    <Canvas
      shadows
      dpr={[1, typeof window !== 'undefined' && window.innerWidth < 900 ? 1.6 : 2]}
      camera={{ fov: 38, near: 0.05, far: 1400, position: [80, 60, 90] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.06 }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
    >
      <color attach="background" args={['#f6f5f0']} />
      <fog attach="fog" args={['#f6f5f0', 260, 560]} />
      <hemisphereLight intensity={0.5} groundColor={0xd9d5c9} />
      <directionalLight
        position={[70, 150, 90]} intensity={0.85} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-95} shadow-camera-right={95}
        shadow-camera-top={95} shadow-camera-bottom={-95}
        shadow-camera-near={10} shadow-camera-far={600} shadow-bias={-0.0004}
      />
      <directionalLight position={[-90, 60, -70]} intensity={0.22} color={0xfff1e0} />
      <StudioEnv />
      <Grid
        args={[340, 340]} cellSize={5} cellThickness={0.6} cellColor="#cfccc2"
        sectionSize={20} sectionThickness={1} sectionColor="#e2e0d8"
        fadeDistance={340} fadeStrength={1} position={[0, 0.01, 0]} infiniteGrid={false}
      />
      <RangeRings />
      <ContactShadows position={[0, 0, 0]} scale={220} blur={2.2} opacity={0.32} far={80} resolution={1024} color="#000000" />
      <CameraRig />
      <VehicleMount overlay={overlay} />
      <SectionSync />
      <FrameDriver overlay={overlay} />
    </Canvas>
  );
}
