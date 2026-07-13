import * as THREE from 'three';

type Kind = 'k' | 'm' | 'h' | 't';
const PAL: Record<Kind, [number, number]> = {
  k: [0xfff3d8, 0xff8a2a],
  m: [0xeaf4ff, 0x7f9dff],
  h: [0xfff8e8, 0xffc46a],
  t: [0xdfffe8, 0x3fd47f],
};

export interface Plume extends THREE.Group {
  userData: { set: (v: number) => void; upd: (t: number) => void };
}

export function makePlume(r: number, len: number, kind: Kind): Plume {
  const cols = PAL[kind] || PAL.k;
  const u = {
    t: { value: 0 }, i: { value: 0 },
    c1: { value: new THREE.Color(cols[0]) }, c2: { value: new THREE.Color(cols[1]) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: [
      'uniform float t,i;uniform vec3 c1,c2;varying vec2 vU;',
      'void main(){float ay=1.0-vU.y;',
      'float fl=0.8+0.2*sin(ay*26.0-t*34.0)+0.12*sin(t*57.0+vU.x*40.0);',
      'float a=i*pow(1.0-ay,1.55)*fl;',
      'float band=0.5+0.5*sin(ay*60.0-t*60.0);',
      'vec3 c=mix(c1,c2,smoothstep(0.0,0.75,ay));',
      'c=mix(c,c1,band*0.25*(1.0-ay));',
      'gl_FragColor=vec4(c,clamp(a,0.0,1.0));}',
    ].join('\n'),
  });
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 1.5, len, 20, 14, true), mat);
  me.position.y = -len / 2;
  me.renderOrder = 5;
  me.frustumCulled = false;
  const gr = new THREE.Group() as Plume;
  gr.add(me);
  gr.visible = false;
  gr.userData = {
    set: (v: number) => { u.i.value = v; gr.visible = v > 0.012; },
    upd: (tt: number) => { u.t.value = tt; },
  };
  return gr;
}
