'use client';
import { useEffect, useState } from 'react';

export default function Loading() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setDone(true), 650);
    const b = setTimeout(() => setGone(true), 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (gone) return null;
  return (
    <div id="loading" className={done ? 'done' : ''}>
      <div className="load-mark"><span className="load-r" /><h1>ROCKET ATLAS</h1></div>
      <div className="load-sub">運載火箭互動圖鑑</div>
      <div id="loadBar" />
    </div>
  );
}
