'use client';
import * as THREE from 'three';
import { useVehicle } from './VehicleProvider';
import { useStore } from '@/store/useStore';
import { DEF_BY_ID } from '@/lib/defs';
import { preset, fitSphere } from '@/lib/camera';

const _box = new THREE.Box3();
const _s = new THREE.Sphere();

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const vehicle = useVehicle()!;
  const selectedId = useStore((s) => s.selectedId);
  const drillId = useStore((s) => s.drillId);
  const subId = useStore((s) => s.subId);
  const isolate = useStore((s) => s.isolate);
  const toggleIsolate = useStore((s) => s.toggleIsolate);
  const exitDrill = useStore((s) => s.exitDrill);
  const resetView = useStore((s) => s.resetView);
  const def = DEF_BY_ID[vehicle.id];

  const drilled = drillId ? vehicle.find(drillId) : null;
  const sub = drillId && subId ? vehicle.findSub(drillId, subId) : null;

  const doPreset = (name: string) => {
    if (name === 'iso' && (drillId || selectedId)) {
      const node = sub || drilled || vehicle.find(selectedId!);
      if (node) {
        _box.makeEmpty();
        node.meshes.forEach((m) => { m.updateWorldMatrix(true, false); _box.expandByObject(m); });
        if (!_box.isEmpty()) { _box.getBoundingSphere(_s); fitSphere(_s.center.clone(), _s.radius * 2.8); return; }
      }
    }
    preset(name, def);
  };

  const btn = (id: string, label: string, title: string) => (
    <button className="tb-btn" title={title} onClick={() => doPreset(id)}>{label}</button>
  );

  return (
    <div id="topbar">
      <button id="menuBtn" onClick={onMenu}><span /><span /><span /></button>
      <div id="crumb">
        <span>ROCKET ATLAS</span><i>/</i><b>{vehicle.zh}</b>
        {drilled ? (
          <>
            <i>/</i>
            <button className="c-drill" onClick={() => useStore.getState().selectSub(null)}>{drilled.zh}</button>
            {sub && <><i>/</i><b className="c-sel">{sub.zh}</b></>}
            <button className="c-exit" onClick={exitDrill} title="退出拆解（Esc）">✕ 退出拆解</button>
          </>
        ) : selectedId ? (
          <><i>/</i><b className="c-sel">{vehicle.find(selectedId)?.zh}</b></>
        ) : null}
      </div>
      <div className="tb-grp">
        {btn('front', '前', '前視')}{btn('side', '側', '側視')}{btn('top', '頂', '頂視')}
        {btn('iso', '等', '等角／聚焦')}{btn('up', '仰', '仰視')}
      </div>
      <div className="tb-grp">
        <button className={'tb-btn' + (isolate ? ' on' : '')} title="隔離顯示" onClick={() => toggleIsolate()}>
          <svg className="tb-ico" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /></svg>
        </button>
        <button className="tb-btn" title="重置" onClick={() => { resetView(); preset('iso', def); }}>
          <svg className="tb-ico" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 2.3 5.6" /><path d="M4 20v-5h5" /></svg>
        </button>
        <button className="tb-btn" title="全螢幕"
          onClick={() => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch { } }}>
          <svg className="tb-ico" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </button>
      </div>
    </div>
  );
}
