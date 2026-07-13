import type { VehicleDef } from './types';
import { TK } from './tokens';
import { buildF9 } from './vehicles/falcon9';
import { buildMerlin } from './vehicles/merlin';
import { buildRaptor } from './vehicles/raptor';
import { buildStack } from './vehicles/stack';
import { buildDragon } from './vehicles/dragon';

export const DEFS: VehicleDef[] = [
  {
    id: 'f9', no: '01', zh: '獵鷹 9 號', en: 'FALCON 9 · BLOCK 5', h: 70,
    cam: { r: 150, ph: 1.32, th: 0.6 }, build: buildF9,
    specs: [['全高', '70 m'], ['直徑', '3.7 m'], ['起飛質量', '約 549 t'], ['海平面推力', '7,607 kN'], ['LEO 酬載', '22.8 t'], ['級數', '兩級 · 一級可回收']],
    desc: '世界上發射與回收次數最多的軌道運載火箭。第一級以 9 具 Merlin 提供動力，完成任務後回推、再入並垂直著陸，開啟了火箭大規模重複使用的時代。',
    seqs: [
      {
        name: '任務時序', en: 'FULL MISSION', dur: 26,
        marks: [[0, '升空'], [0.14, 'Max-Q'], [0.27, '主引擎關機 MECO'], [0.30, '級間分離'], [0.42, '整流罩分離'], [0.46, '回推翻轉'], [0.57, '再入點火'], [0.80, '著陸腳展開'], [0.86, '著陸點火'], [0.98, '著陸']],
        tracks: [
          { p: 'plume1', k: [[0, 0], [0.015, 1], [0.27, 1], [0.30, 0], [0.55, 0], [0.57, 0.65], [0.66, 0.65], [0.68, 0], [0.84, 0], [0.86, 0.55], [0.965, 0.55], [0.975, 0]] },
          { p: 'plume2', k: [[0.32, 0], [0.345, 0.8], [0.9, 0.8], [0.92, 0]] },
          { p: 'sep', k: [[0.30, 0], [0.40, 10], [1, 16]] },
          { p: 'fair', k: [[0.42, 0], [0.50, 1]] },
          { p: 'flip', k: [[0.46, 0], [0.56, 1]] },
          { p: 'gf', k: [[0.50, 0], [0.56, 1]] },
          { p: 'legs', k: [[0.80, 0], [0.86, 1]] },
        ],
      },
    ],
  },
  {
    id: 'merlin', no: '02', zh: 'Merlin 1D', en: 'MERLIN 1D ENGINE', h: 3.2,
    cam: { r: 9, ph: 1.42, th: 0.55 }, build: buildMerlin,
    specs: [['循環', '燃氣產生器（開式）'], ['推進劑', '液氧 / RP-1'], ['海平面推力', '約 845 kN'], ['比衝（海平面）', '約 282 s'], ['推重比', '約 180'], ['特點', '針栓噴注 · 可深度節流']],
    desc: '獵鷹家族的動力核心，也是量產數量最多的液體火箭引擎之一。以簡潔可靠的開式燃氣產生器循環，換取極高的推重比與可重複使用性。',
    seqs: [
      {
        name: '燃氣產生器循環', en: 'GAS-GENERATOR CYCLE', type: 'flow',
        paths: (v) => [
          { curve: v.refs.fuCurve, color: TK.fuel, n: 24, size: 0.09, speed: 0.16 },
          { curve: v.refs.fdCurve, color: TK.fuel, n: 10, size: 0.08, speed: 0.16 },
          { curve: v.refs.rgCurve, color: TK.fuel, n: 14, size: 0.08, speed: 0.14 },
          { curve: v.refs.loCurve, color: TK.lox, n: 24, size: 0.09, speed: 0.16 },
          { curve: v.refs.ldCurve, color: TK.lox, n: 12, size: 0.08, speed: 0.16 },
          { curve: v.refs.ggCurve, color: TK.hot, n: 10, size: 0.1, speed: 0.2 },
          { curve: v.refs.ductCurve, color: TK.hot, n: 20, size: 0.1, speed: 0.22 },
        ],
        legend: [['RP-1 燃料流路', 'fuel'], ['液氧流路', 'lox'], ['燃氣產生器高溫燃氣 → 渦輪排氣', 'hot']],
        note: '燃料先流經再生冷卻套吸熱，再進入噴注器；一小股推進劑於燃氣產生器燃燒驅動渦輪泵，做完功後直接排出。',
      },
      {
        name: '推力向量', en: 'GIMBAL / TVC', dur: 6, loop: true,
        marks: [[0, '萬向擺動示意']],
        tracks: [{ p: 'plume', k: [[0, 0.9], [1, 0.9]] }, { p: 'gim', k: [[0, 0], [1, 1]] }],
      },
      {
        name: '點火時序', en: 'IGNITION', dur: 7,
        marks: [[0, 'TEA-TEB 引燃'], [0.25, '主燃燒室點火'], [0.85, '穩態運轉']],
        tracks: [{ p: 'teb', k: [[0, 0], [0.05, 1], [0.22, 1], [0.3, 0]] }, { p: 'plume', k: [[0.2, 0], [0.3, 0.4], [0.45, 1], [1, 1]] }],
      },
    ],
  },
  {
    id: 'raptor', no: '03', zh: 'Raptor 猛禽', en: 'RAPTOR ENGINE', h: 3.5,
    cam: { r: 9.5, ph: 1.4, th: 0.6 }, build: buildRaptor,
    specs: [['循環', '全流量分級燃燒（FFSC）'], ['推進劑', '液氧 / 液態甲烷'], ['海平面推力', '約 2,300 kN'], ['室壓', '約 300 bar'], ['比衝（海平面）', '約 327 s'], ['特點', '雙預燃室 · 可重複點火']],
    desc: '星艦的動力來源，也是史上少數投入實用的全流量分級燃燒引擎。兩座預燃室分別驅動燃料與氧化劑泵，推進劑幾乎全部進入主燃燒室，效率極高。',
    seqs: [
      {
        name: '全流量分級燃燒', en: 'FULL-FLOW STAGED COMBUSTION', type: 'flow',
        paths: (v) => [
          { curve: v.refs.fCur, color: TK.fuel, n: 24, size: 0.09, speed: 0.16 },
          { curve: v.refs.xoCur, color: TK.fuel, n: 10, size: 0.07, speed: 0.15 },
          { curve: v.refs.fpbCur, color: TK.fuel, n: 8, size: 0.08, speed: 0.16 },
          { curve: v.refs.hfCur, color: TK.hotF, n: 14, size: 0.11, speed: 0.22 },
          { curve: v.refs.oCur, color: TK.lox, n: 24, size: 0.09, speed: 0.16 },
          { curve: v.refs.xfCur, color: TK.lox, n: 10, size: 0.07, speed: 0.15 },
          { curve: v.refs.opbCur, color: TK.lox, n: 8, size: 0.08, speed: 0.16 },
          { curve: v.refs.hoCur, color: TK.hot, n: 14, size: 0.11, speed: 0.22 },
        ],
        legend: [['甲烷流路', 'fuel'], ['液氧流路', 'lox'], ['富燃預燃燃氣', 'hotF'], ['富氧預燃燃氣', 'hot']],
        note: '兩座預燃室各燒富燃、富氧混合驅動對應渦輪泵，兩股燃氣隨後全部進入主燃燒室以氣—氣方式完全燃燒——沒有任何推進劑被浪費。',
      },
      {
        name: '推力向量', en: 'GIMBAL / TVC', dur: 6, loop: true,
        marks: [[0, '萬向擺動示意']],
        tracks: [{ p: 'plume', k: [[0, 0.9], [1, 0.9]] }, { p: 'gim', k: [[0, 0], [1, 1]] }],
      },
      {
        name: '火炬點火', en: 'TORCH IGNITION', dur: 6,
        marks: [[0, '火炬點火器啟動'], [0.3, '主燃燒室點火'], [0.8, '穩態運轉']],
        tracks: [{ p: 'spark', k: [[0, 0], [0.05, 1], [0.35, 1], [0.5, 0]] }, { p: 'plume', k: [[0.25, 0], [0.4, 0.5], [0.6, 1], [1, 1]] }],
      },
    ],
  },
  {
    id: 'stack', no: '04', zh: '超重 · 星艦', en: 'SUPER HEAVY · STARSHIP', h: 121,
    cam: { r: 280, ph: 1.32, th: 0.62 }, build: buildStack,
    specs: [['全高', '約 121 m'], ['直徑', '9 m'], ['起飛質量', '約 5,000 t'], ['起飛推力', '約 74 MN'], ['引擎', '33 + 6 具 Raptor'], ['設計', '完全可重複使用']],
    desc: '人類建造過最大、推力最強的運載系統。超重助推器以 33 具 Raptor 起飛後返回發射塔由機械臂接住；星艦上面級可再入、垂直著陸並重複使用，目標是把大量酬載送往月球與火星。',
    seqs: [
      {
        name: '熱分離', en: 'HOT STAGING', dur: 14,
        marks: [[0, '上升'], [0.30, '船艦點火 · 熱分離'], [0.53, '分離'], [0.62, '助推器翻轉'], [0.9, '返場燃燒']],
        tracks: [
          { p: 'bp', k: [[0, 0.9], [0.30, 0.9], [0.36, 0.28], [0.5, 0.28], [0.53, 0], [0.62, 0], [0.64, 0.55], [0.86, 0.55], [0.9, 0]] },
          { p: 'spl', k: [[0.30, 0], [0.34, 1], [1, 1]] },
          { p: 'ring', k: [[0.28, 0], [0.33, 1], [0.5, 1], [0.6, 0]] },
          { p: 'sep', k: [[0.34, 0], [0.55, 18], [1, 30]] },
          { p: 'flipB', k: [[0.5, 0], [0.72, 1]] },
        ],
      },
      {
        name: '襟翼控制', en: 'FLAP CONTROL', dur: 8, loop: true,
        marks: [[0, '再入姿態調整示意']],
        tracks: [{ p: 'flap', k: [[0, 0], [0.5, 1], [1, 0]] }],
      },
    ],
  },
  {
    id: 'dragon', no: '05', zh: '天龍號 2', en: 'DRAGON 2', h: 8.1,
    cam: { r: 22, ph: 1.28, th: 0.6 }, build: buildDragon,
    specs: [['全高', '約 8.1 m'], ['直徑', '4 m'], ['組員', '最多 4（可達 7）'], ['逃逸引擎', '8× SuperDraco'], ['姿態推進器', '16× Draco'], ['防熱', 'PICA-X 燒蝕盾']],
    desc: '唯一現役、可載人往返國際空間站並回收重複使用的飛船。內建 SuperDraco 逃逸系統可在發射任一階段將組員帶離火箭，觸控座艙也重新定義了載人太空船的人機介面。',
    seqs: [
      {
        name: '發射逃逸', en: 'LAUNCH ABORT', dur: 8,
        marks: [[0, '中止觸發'], [0.05, 'SuperDraco 點火'], [0.6, '後備艙分離'], [0.9, '減速']],
        tracks: [
          { p: 'sd', k: [[0, 0], [0.05, 1], [0.5, 1], [0.6, 0]] },
          { p: 'lift', k: [[0.05, 0], [0.6, 6], [1, 6]] },
          { p: 'trunk', k: [[0.6, 0], [0.85, 8]] },
        ],
      },
      {
        name: '鼻錐開啟', en: 'NOSECONE OPEN', dur: 4,
        marks: [[0, '鼻錐掀開 · 露出對接口']],
        tracks: [{ p: 'nose', k: [[0, 0], [1, 1]] }],
      },
    ],
  },
];

export const DEF_BY_ID = Object.fromEntries(DEFS.map((d) => [d.id, d]));
