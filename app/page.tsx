'use client';
import dynamic from 'next/dynamic';

// The whole experience is client-only (WebGL). Disable SSR to avoid
// server-side window/three access.
const Experience = dynamic(() => import('@/components/Experience'), { ssr: false });

export default function Page() {
  return <Experience />;
}
