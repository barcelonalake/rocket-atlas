import * as THREE from 'three';
import type { VehicleLike } from '../types';
import { MAT } from '../materials';
import { makePlume } from '../plume';
import { lat, bellPts, shift, M, cylM, boxM, torM, tube, curveOf, dome } from '../geometry';

// Merlin 1D — open (gas-generator) cycle. rad 1.35.
export function buildMerlin(v: VehicleLike) {
  v.rad = 1.35;
  const tvc = v.grp('tvc'); tvc.position.y = 2.9;
  const A = new THREE.Group(); A.position.y = -2.9; tvc.add(A);

  (() => {
    const g = new THREE.Group();
    const pl = cylM(0.4, 0.4, 0.1, MAT.grey, 24); pl.position.y = 3.12; g.add(pl);
    const bl = boxM(0.3, 0.14, 0.3, MAT.grey); bl.position.y = 3.02; g.add(bl);
    const sp = M(new THREE.SphereGeometry(0.11, 16, 12), MAT.dark); sp.position.y = 2.9; g.add(sp);
    g.add(tube([[0.18, 3.02, 0.14], [0.4, 2.62, 0.3]], 0.03, MAT.grey, 16));
    g.add(tube([[-0.18, 3.02, -0.14], [-0.4, 2.62, -0.3]], 0.03, MAT.grey, 16));
    v.comp({ id: 'gim', zh: '萬向節座', en: 'GIMBAL MOUNT', obj: g, ex: [0, 1.6, 0], anchor: [0, 3.1, 0],
      info: { mat: '高強度合金鋼', fn: '推力向量控制（TVC）介面。兩具液壓致動器推拉整具引擎擺動，操控箭體俯仰與偏航。', spec: '擺動範圍約 ±5°（示意）', why: '整具引擎必須能擺動——這是火箭唯一的方向盤。但這顆支點要同時承受 845 kN 的推力，還得靈活到每秒修正好幾次。一顆軸承，扛著整枚火箭的重量與方向。', ds: '第一級 9 具 Merlin 中，外圈與中央引擎皆可萬向擺動；著陸時僅中央引擎點火，由此關節完成最後的精準控制。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const d = dome(0.36, 0.3, MAT.cu); d.position.y = 2.5; g.add(d);
    const rim = torM(0.36, 0.035, MAT.gold); rim.position.y = 2.5; g.add(rim);
    v.comp({ id: 'dome', zh: '噴注器圓頂', en: 'INJECTOR DOME', obj: g, parent: A, ex: [0, 1.0, 0], anchor: [0.38, 2.66, 0],
      info: { mat: '銅合金／鎳基合金', fn: 'RP-1 與液氧在此匯流，經針栓噴注器霧化後送入燃燒室。', spec: '工作壓力約 100 bar 級', why: '燃料與氧化劑進入燃燒室前的最後一個房間。這裡的流量分佈必須完美均勻——只要有一角偏少，那一塊的室壁就會在幾秒內被燒穿。', ds: '圓頂同時是結構承力件——引擎推力經由它傳遞到萬向節與八格引擎架。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const p = cylM(0.055, 0.075, 0.3, MAT.gold, 16); p.position.y = 2.4; g.add(p);
    const tip = M(new THREE.SphereGeometry(0.06, 12, 10), MAT.gold); tip.position.y = 2.26; g.add(tip);
    v.comp({ id: 'pintle', zh: '針栓式噴注器', en: 'PINTLE INJECTOR', obj: g, parent: A, ex: [0, 0.55, 0], anchor: [0.1, 2.34, 0.12],
      info: { mat: '耐熱合金', fn: '單軸心針栓讓燃料與氧化劑以同軸環膜相互撞擊霧化，天生具備優異的燃燒穩定性。', spec: '源自登月艙下降引擎的技術路線', why: '這是 Merlin 最關鍵的一個選擇。針栓式噴注器只有「一根針」，而不是像土星五號 F-1 那樣上千個精密小孔。結果：便宜十倍、天生抗燃燒不穩定（那個曾經炸掉無數引擎的惡魔）、而且可以深度節流。代價是效率略低——但它換來了「可量產」與「可著陸」。這根針，是獵鷹能站著回家的起點。', ds: '切到「剖面」或「X 光」模式即可看見它藏在圓頂中央的位置。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const ch = M(lat([[0.35, 2.52], [0.34, 2.3], [0.27, 2.05], [0.19, 1.86], [0.17, 1.78]], 48), MAT.cu); g.add(ch);
    const bd = torM(0.345, 0.03, MAT.grey); bd.position.y = 2.34; g.add(bd);
    v.comp({ id: 'cham', zh: '燃燒室', en: 'COMBUSTION CHAMBER', obj: g, parent: A, ex: [0, 0.5, 0], anchor: [0.33, 2.16, 0],
      info: { mat: '再生冷卻銅合金內襯', fn: 'RP-1 與液氧在此燃燒，產生約 3,300 °C 的高溫燃氣，經喉部加速排出。', spec: '室壓約 97 bar（Merlin 1D）', why: '這裡每秒把數百公斤推進劑轉成 3,300 °C 的高溫氣體。室壁只有幾公釐厚，外面卻是冰冷的燃料在流。這面牆的兩側溫差超過 3,000 度——而它必須撐過整整 162 秒。', ds: '室壁內藏冷卻通道：低溫燃料先流過壁面帶走熱量，才進入噴注器——一石二鳥的再生冷卻。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const b = M(lat(shift(bellPts(0.17, 0.5, 1.78), 1.78), 48), MAT.inco); g.add(b);
    const lip = torM(0.5, 0.022, MAT.grey); lip.position.y = 0.02; g.add(lip);
    v.comp({ id: 'bell', zh: '噴嘴鐘形噴管', en: 'NOZZLE BELL', obj: g, parent: A, ex: [0, -1.6, 0], anchor: [0.44, 0.5, 0],
      info: { mat: '鎳基高溫合金（海平面版）', fn: '將燃燒室高壓燃氣膨脹加速至超音速，面積比針對海平面大氣最佳化。', spec: '海平面推力約 845 kN／比衝約 282 s', why: '噴管的形狀是一道數學題：讓燃氣膨脹到剛好等於外界壓力時，推力最大。膨脹太少浪費能量，太多會讓氣流「剝離」壁面、把噴管撕爛。這條曲線，是在效率與存活之間用超音速流體力學算出的唯一解。', ds: '真空版 MVac 換上輻射冷卻的鈮合金加長噴管，比衝提升到約 348 s——同一顆動力心臟，兩種裙襬。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const man = torM(0.31, 0.035, MAT.grey); man.position.y = 1.6; g.add(man);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2; const pts: [number, number, number][] = [];
      for (let s = 0; s <= 6; s++) {
        const t = 0.12 + (s / 6) * 0.8;
        const rr = 0.17 + 0.33 * Math.pow(t, 0.7) + 0.04;
        const yy = 1.78 - t * 1.78;
        pts.push([Math.cos(a) * rr, yy, Math.sin(a) * rr]);
      }
      g.add(tube(pts, 0.016, MAT.grey, 18));
    }
    v.comp({ id: 'regen', zh: '再生冷卻通道', en: 'REGEN COOLING', obj: g, parent: A, ex: [0, -0.7, 0], anchor: [-0.36, 1.3, 0],
      info: { mat: '銅合金流道＋鎳外套', fn: '燃料先沿噴管與室壁流動吸熱，讓壁面保持在材料極限之下，同時預熱燃料。', spec: '教育示意：以外部管束呈現內部流道', why: '為什麼不用隔熱層？那會讓噴管變重、還會被燒掉。Merlin 的解法更聰明：讓即將被燒掉的燃料先流過噴管壁，一邊冷卻它、一邊把自己加熱——被吸走的熱最後又回到燃燒室裡。這不是散熱，這是把廢熱回收進推力。', ds: '播放「推進劑流路」動畫，可以看到橘色 RP-1 粒子沿此路徑爬升後進入圓頂。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const hp = cylM(0.15, 0.15, 0.72, MAT.grey, 24); hp.rotation.z = Math.PI / 2; hp.position.set(0.6, 2.08, 0); g.add(hp);
    const ind = M(new THREE.ConeGeometry(0.13, 0.22, 20), MAT.dark); ind.rotation.z = Math.PI / 2; ind.position.set(0.2, 2.08, 0); g.add(ind);
    const vol = M(new THREE.TorusGeometry(0.17, 0.055, 10, 28), MAT.dark); vol.rotation.y = Math.PI / 2; vol.position.set(0.46, 2.08, 0); g.add(vol);
    g.add(tube([[0.5, 2.0, 0.0], [0.52, 1.9, 0.06]], 0.04, MAT.grey, 8));
    v.comp({ id: 'pump', zh: '渦輪泵', en: 'TURBOPUMP', obj: g, parent: A, ex: [1.7, 0.3, 0], anchor: [0.62, 1.98, 0.2],
      info: { mat: '鋁合金泵殼／Inconel 渦輪', fn: '單軸渦輪泵：一端抽燃料、一端抽液氧，由中間的高溫渦輪驅動，把推進劑加壓到室壓之上。', spec: '軸功率約 7,500 kW 級／轉速約 36,000 rpm', why: '這顆渦輪泵的功率超過一萬匹馬力——相當於十幾台 F1 引擎，塞進一個行李箱大小的空間。它要在幾秒內從靜止衝到每分鐘上萬轉，一邊泡在 -183 °C 的液氧裡，一邊被 700 °C 的燃氣驅動。', ds: '這顆泵的功率相當於數十輛跑車——卻只有洗衣機大小。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const c1 = cylM(0.11, 0.11, 0.3, MAT.inco, 20); c1.position.set(0.98, 2.3, 0); g.add(c1);
    const dm = dome(0.11, 0.09, MAT.inco); dm.position.set(0.98, 2.45, 0); g.add(dm);
    g.add(tube([[0.78, 2.08, 0], [0.9, 2.16, 0], [0.98, 2.16, 0]], 0.045, MAT.grey, 10));
    v.comp({ id: 'gg', zh: '燃氣產生器', en: 'GAS GENERATOR', obj: g, parent: A, ex: [1.5, 1.1, 0], anchor: [1.02, 2.42, 0],
      info: { mat: '鎳基高溫合金', fn: '燒掉一小部分推進劑（富燃、較低溫）產生驅動渦輪的燃氣——這就是「開式循環」的心臟。', spec: '富燃混合比，燃氣約 800 °C 級', why: '這是一具「燒了就丟」的小引擎，唯一的工作是驅動渦輪。它刻意燒得很「富燃」，好把燃氣溫度壓到渦輪葉片能承受的範圍。代價是：那些沒燒完的燃料從排氣管冒著黑煙飄走，推力白白損失幾個百分點。這叫開式循環——它不完美，但它簡單、便宜、而且一定能動。', ds: '代價是這股燃氣做完功就直接排掉，比衝因此低於分級燃燒循環——Raptor 走的正是另一條路。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const tb = tube([[0.98, 2.12, 0], [1.05, 1.7, 0.06], [0.98, 1.2, 0.15], [0.84, 0.6, 0.22], [0.74, 0.2, 0.26]], 0.06, MAT.inco, 40);
    g.add(tb);
    const fl = M(new THREE.ConeGeometry(0.1, 0.2, 16, 1, true), MAT.inco); fl.position.set(0.72, 0.1, 0.27); fl.rotation.x = 0.15; g.add(fl);
    v.refs.ductCurve = (tb.userData as any).curve;
    v.comp({ id: 'duct', zh: '渦輪排氣管', en: 'TURBINE EXHAUST', obj: g, parent: A, ex: [1.1, -1.3, 0.7], anchor: [1.0, 1.1, 0.3],
      info: { mat: '鎳基高溫合金', fn: '渦輪做完功的燃氣沿噴管外側排出。飛行影片裡 Merlin 旁那道深色煙羽就是它。', spec: '亦兼作滾轉控制排氣（中央引擎）', why: '那道著名的黑煙就從這裡出來。它是開式循環的代價，也是它的簽名——你在發射影片裡看到引擎旁那縷灰黑色的煙，那是 Merlin 正在「浪費」燃料，換取簡潔。', ds: '播放流路動畫時，紅色粒子走的就是這條路。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const fu = tube([[-0.14, 3.2, 0.12], [-0.42, 2.92, 0.22], [-0.56, 2.5, 0.14], [-0.5, 2.16, 0.02], [0.16, 2.08, 0]], 0.055, MAT.grey, 40); g.add(fu);
    const lo = tube([[0.12, 3.2, -0.14], [0.42, 2.96, -0.26], [0.64, 2.6, -0.2], [0.68, 2.3, -0.08], [0.62, 2.14, 0]], 0.055, MAT.grey, 40); g.add(lo);
    const fd = tube([[0.5, 2.0, 0], [0.46, 1.82, 0.12], [0.38, 1.68, 0.16], [0.31, 1.6, 0.09]], 0.045, MAT.grey, 24); g.add(fd);
    const ld = tube([[0.6, 2.02, -0.04], [0.5, 2.22, -0.16], [0.3, 2.44, -0.18], [0.1, 2.56, -0.06]], 0.045, MAT.grey, 24); g.add(ld);
    v.refs.fuCurve = (fu.userData as any).curve;
    v.refs.loCurve = (lo.userData as any).curve;
    v.refs.fdCurve = (fd.userData as any).curve;
    v.refs.ldCurve = (ld.userData as any).curve;
    v.comp({ id: 'lines', zh: '推進劑管路', en: 'FEED LINES', obj: g, parent: A, ex: [-1.1, 0.7, 1.0], anchor: [-0.5, 2.8, 0.2],
      info: { mat: '不鏽鋼／鋁合金', fn: '把箭體貯箱送來的 RP-1 與液氧導入渦輪泵，再把加壓後的高壓推進劑分送至冷卻套與噴注器。', spec: '流量約 300 kg/s 級（全引擎）', why: '每一根管子都要在幾秒內從常溫降到 -183 °C，承受幾百 bar 的壓力，還要在劇烈震動中不裂。火箭真正的失敗，很少是引擎「炸了」——通常是某一根管子，在某一次熱循環之後，出現了一條看不見的裂縫。', ds: '左側為 RP-1 入口、右後為液氧入口——顏色對照見流路動畫圖例。' } });
  })();

  v.refs.rgCurve = curveOf([[0.31, 1.6, 0.09], [0.36, 1.92, 0.15], [0.31, 2.2, 0.15], [0.2, 2.44, 0.1], [0.05, 2.56, 0.04]]);
  v.refs.ggCurve = curveOf([[0.52, 2.14, 0], [0.72, 2.2, 0], [0.9, 2.18, 0], [0.98, 2.2, 0]]);

  v.refs.pl = makePlume(0.5, 5, 'k'); v.refs.pl.position.y = 0.02; A.add(v.refs.pl); v.plumes.push(v.refs.pl);
  v.refs.tb = makePlume(0.2, 1.8, 't'); v.refs.tb.position.y = 0.02; A.add(v.refs.tb); v.plumes.push(v.refs.tb);

  v.ap('plume', 0, (x) => v.refs.pl.userData.set(x));
  v.ap('teb', 0, (x) => v.refs.tb.userData.set(x));
  v.ap('gim', 0, (x) => {
    const a = x * Math.PI * 4;
    tvc.rotation.x = Math.sin(a) * 0.09 * (x > 0 ? 1 : 0);
    tvc.rotation.z = Math.cos(a) * 0.09 * (x > 0 ? 1 : 0);
  });
}
