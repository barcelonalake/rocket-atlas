// Shared registry of DOM nodes for the label / dimension overlay. The HTML
// layer (Overlays.tsx, outside the Canvas) populates these refs; the in-Canvas
// FrameDriver reads them each frame to position labels against the 3D scene.
export interface OverlayReg {
  labels: Map<string, { div: HTMLDivElement | null; line: SVGLineElement | null }>;
  dim: {
    ln: SVGLineElement | null; t1: SVGLineElement | null;
    t2: SVGLineElement | null; lb: HTMLDivElement | null;
  };
  tip: HTMLDivElement | null;
  frame: number;
}

export const makeOverlay = (): OverlayReg => ({
  labels: new Map(),
  dim: { ln: null, t1: null, t2: null, lb: null },
  tip: null,
  frame: 0,
});
