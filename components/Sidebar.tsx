'use client';
import { DEFS } from '@/lib/defs';
import { useStore } from '@/store/useStore';

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const vehicleId = useStore((s) => s.vehicleId);
  const setVehicle = useStore((s) => s.setVehicle);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const labelsOn = useStore((s) => s.labelsOn);
  const dimsOn = useStore((s) => s.dimsOn);
  const toggleLabels = useStore((s) => s.toggleLabels);
  const toggleDims = useStore((s) => s.toggleDims);
  const explode = useStore((s) => s.explode);
  const setExplode = useStore((s) => s.setExplode);
  const sectionOn = useStore((s) => s.sectionOn);
  const section = useStore((s) => s.section);
  const setSectionRaw = useStore((s) => s.setSectionRaw);

  return (
    <aside id="sidebar" className={open ? 'open' : ''}>
      <div className="sb-logo">
        <div className="lg-mark"><span className="lg-r" /><h1>ROCKET ATLAS</h1></div>
        <div className="lg-sub">運載火箭互動圖鑑</div>
      </div>
      <div className="sb-sec"><span>載具</span><span>VEHICLES</span></div>
      <div id="vlist">
        {DEFS.map((d) => (
          <button key={d.id} className={'vcard' + (d.id === vehicleId ? ' active' : '')}
            onClick={() => { setVehicle(d.id); onClose(); }}>
            <span className="vno">{d.no}</span>
            <span className="vtx"><span className="vzh">{d.zh}</span><span className="ven">{d.en}</span></span>
            <span className="vh">{d.h}<small>m</small></span>
          </button>
        ))}
      </div>

      <div className="sb-ctrl">
        <div>
          <div className="ctrl-lab"><span>檢視模式</span><span>VIEW</span></div>
          <div className="seg">
            {(['solid', 'wire', 'xray'] as const).map((v) => (
              <button key={v} className={'seg-btn' + (view === v ? ' on' : '')} onClick={() => setView(v)}>
                {v === 'solid' ? '實體' : v === 'wire' ? '線框' : 'X 光'}
              </button>
            ))}
          </div>
        </div>
        <div className="sw-row">
          <button className={'sw' + (labelsOn ? ' on' : '')} onClick={toggleLabels}><span>標籤</span><span className="dot" /></button>
          <button className={'sw' + (dimsOn ? ' on' : '')} onClick={toggleDims}><span>尺寸</span><span className="dot" /></button>
        </div>
        <div className="sld-row">
          <div className="ctrl-lab"><span>爆炸視圖</span><span className="rv">{Math.round(explode * 100)}%</span></div>
          <input type="range" min={0} max={100} value={Math.round(explode * 100)} onChange={(e) => setExplode(+e.target.value / 100)} />
        </div>
        <div className="sld-row">
          <div className="ctrl-lab"><span>剖面</span><span className="rv">{sectionOn ? Math.round(section * 100) + '%' : '關'}</span></div>
          <input type="range" min={-100} max={100} value={sectionOn ? Math.round(section * 100) : -100} onChange={(e) => setSectionRaw(+e.target.value)} />
        </div>
      </div>
    </aside>
  );
}
