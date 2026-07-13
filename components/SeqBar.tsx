'use client';
import { useRef } from 'react';
import { useVehicle } from './VehicleProvider';
import { useStore } from '@/store/useStore';
import { DEF_BY_ID } from '@/lib/defs';
import { sample } from '@/lib/sample';

const fmtT = (s: number) => { s = Math.max(0, Math.floor(s)); return 'T+' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

export default function SeqBar() {
  const vehicle = useVehicle()!;
  const seqName = useStore((s) => s.seqName);
  const playing = useStore((s) => s.playing);
  const t = useStore((s) => s.t);
  const speed = useStore((s) => s.speed);
  const loop = useStore((s) => s.loop);
  const loadSeq = useStore((s) => s.loadSeq);
  const setPlaying = useStore((s) => s.setPlaying);
  const setT = useStore((s) => s.setT);
  const cycleSpeed = useStore((s) => s.cycleSpeed);
  const toggleLoop = useStore((s) => s.toggleLoop);

  const def = DEF_BY_ID[vehicle.id];
  const seq = seqName ? def.seqs.find((s) => s.name === seqName) : null;
  const isTimeline = !!seq && seq.type !== 'flow';
  const tlRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const applyScrub = (clientX: number) => {
    if (!tlRef.current || !seq || seq.type === 'flow') return;
    const r = tlRef.current.getBoundingClientRect();
    const nt = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setT(nt);
    for (const tr of seq.tracks!) vehicle.setParam(tr.p, sample(tr.k, nt));
  };

  const togglePlay = () => {
    if (!seq) return;
    if (seq.type === 'flow') { setPlaying(!playing); return; }
    if (t >= 1) setT(0);
    setPlaying(!playing);
  };

  let markName = '';
  if (isTimeline && seq!.marks) for (const m of seq!.marks) if (m[0] <= t + 1e-6) markName = m[1];

  return (
    <div id="seqbar" className={isTimeline ? 'timeline' : ''}>
      <div id="chips">
        <button className={'chip' + (!seq ? ' on' : '')} onClick={() => loadSeq(null)}>靜態展示</button>
        {def.seqs.map((s) => (
          <button key={s.name} className={'chip' + (seqName === s.name ? ' on' : '')} onClick={() => loadSeq(s.name)}>{s.name}</button>
        ))}
      </div>

      {seq && (
        <button id="playBtn" className={seq.type === 'flow' ? 'flow' : ''} onClick={togglePlay}>
          {playing ? '❚❚' : '▶'}
        </button>
      )}

      {isTimeline && (
        <div id="tlWrap">
          <div id="tl" ref={tlRef}
            onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); setPlaying(false); applyScrub(e.clientX); }}
            onPointerMove={(e) => { if (dragging.current) applyScrub(e.clientX); }}
            onPointerUp={() => (dragging.current = false)}>
            <div id="tlTrack" /><div id="tlFill" style={{ width: t * 100 + '%' }} />
            <div id="tlMarks">
              {(seq!.marks || []).map((m, i) => (<span key={i} className="mk" style={{ left: m[0] * 100 + '%' }} title={m[1]} />))}
            </div>
            <div id="tlHead" style={{ left: t * 100 + '%' }} />
          </div>
          <span id="tTime">{fmtT(t * (seq!.dur || 0))}</span>
          <span id="mkName">{markName}</span>
          <div className="tl-mini">
            <button id="spdBtn" onClick={cycleSpeed}>{speed}×</button>
            <button id="loopBtn" className={loop ? 'on' : ''} onClick={toggleLoop}>↻</button>
          </div>
        </div>
      )}
    </div>
  );
}
