'use client';
import { useEffect, useMemo } from 'react';
import { useVehicle } from './VehicleProvider';
import { useStore } from '@/store/useStore';
import type { OverlayReg } from './overlay';

export default function Overlays({ overlay }: { overlay: OverlayReg }) {
  const vehicle = useVehicle()!;
  const drillId = useStore((s) => s.drillId);
  const select = useStore((s) => s.select);
  const selectSub = useStore((s) => s.selectSub);

  const targets = useMemo(() => vehicle.labelTargets(drillId), [vehicle, drillId]);

  useEffect(() => {
    overlay.labels.clear();
    for (const t of targets) overlay.labels.set(t.id, { div: null, line: null });
    return () => overlay.labels.clear();
  }, [targets, overlay]);

  const setLine = (id: string) => (el: SVGLineElement | null) => { const r = overlay.labels.get(id); if (r) r.line = el; };
  const setDiv = (id: string) => (el: HTMLDivElement | null) => { const r = overlay.labels.get(id); if (r) r.div = el; };
  const hasInner = (id: string) => !drillId && !!vehicle.find(id)?.subs?.length;

  return (
    <>
      <svg id="leader" xmlns="http://www.w3.org/2000/svg">
        {targets.map((c) => (<line key={c.id} className="ldr off" ref={setLine(c.id)} />))}
        <line className="dimln off" ref={(el) => { overlay.dim.ln = el; }} />
        <line className="dimln off" ref={(el) => { overlay.dim.t1 = el; }} />
        <line className="dimln off" ref={(el) => { overlay.dim.t2 = el; }} />
      </svg>

      <div id="labels">
        {targets.map((c) => (
          <div key={c.id} className={'lab off' + (hasInner(c.id) ? ' inner' : '')} ref={setDiv(c.id)}
            onClick={(e) => { e.stopPropagation(); if (drillId) selectSub(c.id); else select(c.id); }}>
            <span className="lab-zh">{c.zh}</span>
            <span className="lab-en">{c.en}</span>
          </div>
        ))}
        <div className="dimlb off" ref={(el) => { overlay.dim.lb = el; }} />
      </div>

      <div id="ctip" ref={(el) => { overlay.tip = el; }} />
    </>
  );
}
