'use client';
import * as THREE from 'three';
import { useVehicle } from './VehicleProvider';
import { useStore } from '@/store/useStore';
import { DEF_BY_ID } from '@/lib/defs';
import { fitSphere } from '@/lib/camera';
import { TK, hex } from '@/lib/tokens';
import type { Sequence, CompInfo } from '@/lib/types';

const fmtT = (s: number) => { s = Math.max(0, Math.floor(s)); return 'T+' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const _box = new THREE.Box3();
const _s = new THREE.Sphere();

function focusMeshes(meshes: THREE.Mesh[]) {
  _box.makeEmpty();
  meshes.forEach((m) => { m.updateWorldMatrix(true, false); _box.expandByObject(m); });
  if (!_box.isEmpty()) { _box.getBoundingSphere(_s); fitSphere(_s.center.clone(), Math.max(0.4, _s.radius) * 2.8); }
}

/** 元件／次元件的完整說明卡。why 是這次升級的重點：講清楚「為什麼非這樣不可」。 */
function Detail({ info }: { info: CompInfo }) {
  return (
    <>
      <div className="cd">
        <div className="cd-row"><span className="cd-k">材質</span><span className="cd-v">{info.mat}</span></div>
        <div className="cd-row"><span className="cd-k">功能</span><span className="cd-v">{info.fn}</span></div>
        <div className="cd-row"><span className="cd-k">規格</span><span className="cd-v">{info.spec}</span></div>
      </div>
      {info.why && (
        <div className="cd-why">
          <div className="why-tag">為何這樣設計　<span>WHY</span></div>
          <p>{info.why}</p>
        </div>
      )}
      <div className="cd-note"><span className="note-tag">觀察</span>{info.ds}</div>
    </>
  );
}

export default function InfoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const vehicle = useVehicle()!;
  const selectedId = useStore((s) => s.selectedId);
  const drillId = useStore((s) => s.drillId);
  const subId = useStore((s) => s.subId);
  const seqName = useStore((s) => s.seqName);
  const isolate = useStore((s) => s.isolate);
  const select = useStore((s) => s.select);
  const drill = useStore((s) => s.drill);
  const exitDrill = useStore((s) => s.exitDrill);
  const selectSub = useStore((s) => s.selectSub);
  const toggleIsolate = useStore((s) => s.toggleIsolate);
  const setView = useStore((s) => s.setView);
  const def = DEF_BY_ID[vehicle.id];
  const seq = seqName ? def.seqs.find((s) => s.name === seqName) : null;

  let body: React.ReactNode;

  /* ---------- 拆解模式 ---------- */
  if (drillId) {
    const c = vehicle.find(drillId)!;
    const subs = c.subs || [];
    const sub = subId ? subs.find((s) => s.id === subId) : null;
    const i = sub ? subs.findIndex((s) => s.id === sub.id) : -1;
    const step = (d: number) => { const n = subs[(i + d + subs.length) % subs.length]; if (n) selectSub(n.id); };

    body = (
      <>
        <button className="ib-back" onClick={exitDrill}>‹ 退出拆解 · 返回 {vehicle.zh}</button>
        <div className="drill-head">
          <span className="drill-tag">內部構造　<span>CUTAWAY</span></span>
          <h2>{c.zh}</h2>
          <div className="ib-en">{c.en}</div>
          <div className="drill-cnt">{subs.length} 個內部零件</div>
        </div>

        <div className="ci-wrap">
          {subs.map((s) => (
            <button key={s.id} className={'ci' + (s.id === subId ? ' on' : '')} onClick={() => selectSub(s.id)}>{s.zh}</button>
          ))}
        </div>

        {sub ? (
          <>
            <div className="sub-nav">
              <button onClick={() => step(-1)}>‹</button>
              <span>{i + 1} / {subs.length}</span>
              <button onClick={() => step(1)}>›</button>
            </div>
            <div className="ib-head sub"><h2>{sub.zh}</h2><div className="ib-en">{sub.en}</div></div>
            <Detail info={sub.info} />
            <div className="cd-act">
              <button className="act" onClick={() => focusMeshes(sub.meshes)}>聚焦</button>
              <button className="act ghost" onClick={() => toggleIsolate()}>{isolate ? '取消隔離' : '隔離顯示'}</button>
            </div>
          </>
        ) : (
          <p className="ib-hint">外殼已透明化。點選任一內部零件查看它的材質、功能，以及<b>為什麼非這樣設計不可</b>。拖曳「爆炸視圖」滑桿可以把內部零件整組拉開。</p>
        )}
      </>
    );

  /* ---------- 元件詳情 ---------- */
  } else if (selectedId) {
    const c = vehicle.find(selectedId)!;
    const n = c.subs?.length || 0;
    body = (
      <>
        <button className="ib-back" onClick={() => select(null)}>‹ 返回 {vehicle.zh}</button>
        <div className="ib-head"><h2>{c.zh}</h2><div className="ib-en">{c.en}</div></div>
        {n > 0 && (
          <button className="drill-btn" onClick={() => drill(c.id)}>
            <span className="db-ico">◲</span>
            <span className="db-tx"><b>拆開看內部</b><small>{n} 個內部零件 · OPEN CUTAWAY</small></span>
            <span className="db-arr">›</span>
          </button>
        )}
        <Detail info={c.info} />
        <div className="cd-act">
          <button className="act" onClick={() => focusMeshes(c.meshes)}>聚焦</button>
          <button className="act ghost" onClick={() => toggleIsolate()}>{isolate ? '取消隔離' : '隔離顯示'}</button>
        </div>
      </>
    );

  /* ---------- 序列 ---------- */
  } else if (seq) {
    body = <SeqInfo seq={seq} />;

  /* ---------- 載具總覽 ---------- */
  } else {
    const chips = vehicle.comps.filter((c) => c.anchorV);
    const withSubs = vehicle.comps.filter((c) => c.subs?.length).length;
    const totalSubs = vehicle.comps.reduce((n, c) => n + (c.subs?.length || 0), 0);
    body = (
      <>
        <div className="ib-head">
          <span className="ib-no">{vehicle.no}</span>
          <h2>{vehicle.zh}</h2>
          <div className="ib-en">{vehicle.en}</div>
        </div>
        <div className="spec-grid">
          {vehicle.specs.map((s, i) => (
            <div className="spec" key={i}><span className="sk">{s[0]}</span><span className="sv">{s[1]}</span></div>
          ))}
        </div>
        <p className="ib-desc">{vehicle.desc}</p>

        {totalSubs > 0 && (
          <button className="xray-btn" onClick={() => setView('xray')}>
            <span className="db-ico">◉</span>
            <span className="db-tx"><b>X 光透視全機</b><small>一次看見 {withSubs} 個組件內的 {totalSubs} 個零件</small></span>
            <span className="db-arr">›</span>
          </button>
        )}

        <div className="ib-sec">元件　<span>COMPONENTS</span></div>
        <div className="ci-wrap">
          {chips.map((c) => (
            <button key={c.id} className={'ci' + (c.subs?.length ? ' has' : '')} onClick={() => select(c.id)}>{c.zh}</button>
          ))}
        </div>
        <p className="ib-hint">帶 <i className="dot-i" /> 的元件可以拆開看內部。點選箭體任一部位，或直接雙擊它。</p>
      </>
    );
  }

  return (
    <aside id="info" className={open ? 'open' : ''}>
      <button id="infoClose" onClick={onClose}>✕</button>
      <div id="infoBody">{body}</div>
    </aside>
  );
}

function SeqInfo({ seq }: { seq: Sequence }) {
  if (seq.type === 'flow') {
    const cmap: Record<string, number> = { fuel: TK.fuel, lox: TK.lox, hot: TK.hot, hotF: TK.hotF };
    return (
      <>
        <div className="ib-head"><h2>{seq.name}</h2><div className="ib-en">{seq.en}</div></div>
        <p className="ib-desc">{seq.note}</p>
        <div className="ib-sec">流路圖例　<span>LEGEND</span></div>
        <div className="lg">
          {(seq.legend || []).map((l, i) => (
            <div className="lg-row" key={i}><span className="lg-dot" style={{ background: hex(cmap[l[1]]) }} />{l[0]}</div>
          ))}
        </div>
        <p className="ib-hint">粒子沿管路流動的方向即推進劑走向；可旋轉、切剖面觀察內部結構。</p>
      </>
    );
  }
  return (
    <>
      <div className="ib-head"><h2>{seq.name}</h2><div className="ib-en">{seq.en}</div></div>
      <p className="ib-desc">{seq.note || '依時間軸播放此載具的關鍵飛行事件，可拖曳時間軸逐格檢視。'}</p>
      <div className="ib-sec">事件序列　<span>SEQUENCE</span></div>
      <ol className="ev">
        {(seq.marks || []).map((m, i) => (
          <li key={i}><span className="ev-t">{fmtT(m[0] * (seq.dur || 0))}</span>{m[1]}</li>
        ))}
      </ol>
    </>
  );
}
