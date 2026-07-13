'use client';
import { useEffect, useRef, useState } from 'react';
import { VehicleProvider } from './VehicleProvider';
import Scene from './Scene';
import Overlays from './Overlays';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SeqBar from './SeqBar';
import InfoPanel from './InfoPanel';
import Loading from './Loading';
import { makeOverlay } from './overlay';
import { useStore } from '@/store/useStore';

export default function Experience() {
  const overlay = useRef(makeOverlay()).current;
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const selectedId = useStore((s) => s.selectedId);
  const drillId = useStore((s) => s.drillId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = useStore.getState();
      if (s.drillId) s.exitDrill();
      else if (s.selectedId) s.select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 行動裝置：選到元件或進入拆解時自動打開資訊卡
  const prev = useRef<string | null>(null);
  const key = drillId || selectedId;
  if (key && key !== prev.current && typeof window !== 'undefined' && window.innerWidth < 900) setInfoOpen(true);
  prev.current = key;

  return (
    <VehicleProvider>
      <div id="app">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main id="stage">
          <div id="viewport">
            <Scene overlay={overlay} />
            <Overlays overlay={overlay} />
            <div className="corner tl" /><div className="corner tr" />
            <div className="corner bl" /><div className="corner br" />
            <div id="sheetTag">SHEET <b>RA-001</b><br />SCALE <b>NTS</b><br />PROC · GEOMETRY</div>
            <div id="hint">拖曳旋轉 · 滾輪縮放 · 點選元件 · 雙擊拆開內部</div>
          </div>
          <Topbar onMenu={() => setMenuOpen((v) => !v)} />
          <SeqBar />
        </main>
        <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
      </div>
      <Loading />
    </VehicleProvider>
  );
}
