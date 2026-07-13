import * as THREE from 'three';
import type { VehicleLike } from '../types';
import { MAT } from '../materials';
import { makePlume } from '../plume';
import { lat, bellPts, shift, M, cylM, boxM, torM, tube, curveOf, dome } from '../geometry';

// Raptor — full-flow staged combustion (FFSC). rad 1.4.
export function buildRaptor(v: VehicleLike) {
  v.rad = 1.4;
  const tvc = v.grp('tvc'); tvc.position.y = 3.1;
  const A = new THREE.Group(); A.position.y = -3.1; tvc.add(A);

  (() => {
    const g = new THREE.Group();
    const pl = cylM(0.46, 0.46, 0.1, MAT.grey, 28); pl.position.y = 3.3; g.add(pl);
    const bl = boxM(0.3, 0.16, 0.3, MAT.grey); bl.position.y = 3.2; g.add(bl);
    const sp = M(new THREE.SphereGeometry(0.12, 16, 12), MAT.dark); sp.position.y = 3.08; g.add(sp);
    g.add(tube([[0.2, 3.2, 0.14], [0.42, 2.8, 0.28]], 0.032, MAT.grey, 14));
    g.add(tube([[-0.2, 3.2, -0.14], [-0.42, 2.8, -0.28]], 0.032, MAT.grey, 14));
    v.comp({ id: 'gim', zh: '萬向節座', en: 'GIMBAL MOUNT', obj: g, ex: [0, 1.6, 0], anchor: [0, 3.28, 0],
      info: { mat: '高強度合金鋼', fn: '電動致動器驅動的推力向量控制介面（Starship 系統以電池取代液壓）。', spec: '擺動範圍約 ±15°（中央引擎）', why: '中央 13 具 Raptor 靠這個關節擺動。星艦著陸時的翻轉，就是靠它們在 5 秒內把整艘船從水平扳成垂直——它承受的不只是推力，是一整艘船的命。', ds: '星艦著陸翻轉的最後三秒，全靠這個關節的擺速。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const d = dome(0.4, 0.3, MAT.inco); d.position.y = 2.26; g.add(d);
    const ch = M(lat([[0.4, 2.26], [0.37, 2.0], [0.29, 1.7], [0.22, 1.48], [0.21, 1.38]], 48), MAT.inco); g.add(ch);
    const th = torM(0.22, 0.025, MAT.cu); th.position.y = 1.42; g.add(th);
    v.comp({ id: 'cham', zh: '燃燒室', en: 'MAIN CHAMBER', obj: g, parent: A, ex: [0, 0.6, 0], anchor: [0.4, 2.1, 0],
      info: { mat: '再生冷卻銅合金內襯＋合金外套', fn: '兩股預燃燃氣（富燃＋富氧）在此以氣—氣方式混合燃燒，效率極高。', spec: '室壓約 300 bar——現役最高等級', why: '300 bar 的室壓——人類做過壓力最高的火箭引擎，超越了蘇聯 RD-180 保持數十年的紀錄。壓力越高，同尺寸的引擎推力越大、效率越好；但每高一個 bar，材料、冷卻與密封的難度都指數上升。Raptor 是一場對材料極限的長期圍攻。', ds: '300 bar 相當於 3,000 公尺深海的壓力，裝在一個浴缸大小的腔體裡。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const b = M(lat(shift(bellPts(0.21, 0.62, 1.38, 22, 0.72), 1.38), 48), MAT.inco); g.add(b);
    const lip = torM(0.62, 0.024, MAT.grey); lip.position.y = 0.02; g.add(lip);
    v.comp({ id: 'bell', zh: '噴嘴（海平面版）', en: 'NOZZLE · SL', obj: g, parent: A, ex: [0, -1.6, 0], anchor: [0.55, 0.5, 0],
      info: { mat: '再生冷卻鋼製噴管', fn: '海平面最佳化面積比。真空版 RVac 的噴管直徑放大近一倍。', spec: '海平面推力約 2,300 kN／比衝約 327 s', why: '海平面版的噴管刻意做小。因為在稠密大氣裡，過大的噴管會發生流動分離、把自己撕爛。所以同一顆引擎有兩種裙襬：短的在地面工作，長的在真空工作——各自在自己的世界裡做到最好。', ds: '甲烷燃燒的尾焰呈半透明的馬赫環藍——播放點火動畫看看。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const m1 = torM(0.46, 0.05, MAT.grey); m1.position.y = 2.52; g.add(m1);
    v.comp({ id: 'manF', zh: '甲烷歧管', en: 'CH4 MANIFOLD', obj: g, parent: A, ex: [0, 1.0, -1.0], anchor: [-0.2, 2.56, 0.44],
      info: { mat: '不鏽鋼', fn: '環繞燃燒室頂部的甲烷分配環，把冷卻套回流的甲烷均勻導入噴注面。', spec: '推進劑：液態甲烷 CH₄（約 -162 °C）', why: '甲烷在進入噴注面之前，已經先被燒成滾燙的氣體。所以這裡流的不是液體——是預燃過的高溫燃氣。', ds: '選甲烷不只為了火星製造燃料——它不像 RP-1 會積碳，重複使用時免大修。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const m2 = torM(0.41, 0.045, MAT.dark); m2.position.y = 2.3; g.add(m2);
    v.comp({ id: 'manO', zh: '液氧歧管', en: 'LOX MANIFOLD', obj: g, parent: A, ex: [0, -0.2, -1.2], anchor: [0.2, 2.26, -0.42],
      info: { mat: '不鏽鋼（耐富氧環境）', fn: '液氧分配環。富氧高溫燃氣是材料學噩夢，Raptor 為此開發了專用合金。', spec: '推進劑：液氧 LOX（約 -183 °C）', why: '這裡流的是「富氧」高溫氣體——一股 500 °C、幾百 bar 的純氧洪流。氧在這個狀態下會腐蝕、甚至點燃幾乎任何金屬，包括不鏽鋼本身。造出能長期承受它的管路，是全流量循環數十年來無法量產的核心障礙。', ds: '蘇聯 RD-180 系解決過富氧預燃，全流量雙預燃則是 Raptor 首次投入實用飛行。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const hp = cylM(0.16, 0.17, 0.85, MAT.grey, 24); hp.position.set(-0.6, 1.95, 0); g.add(hp);
    const ind = M(new THREE.ConeGeometry(0.14, 0.22, 20), MAT.dark); ind.rotation.x = Math.PI; ind.position.set(-0.6, 1.44, 0); g.add(ind);
    const vol = torM(0.2, 0.05, MAT.dark); vol.position.set(-0.6, 1.62, 0); g.add(vol);
    v.comp({ id: 'pumpF', zh: '燃料渦輪泵', en: 'FUEL TURBOPUMP', obj: g, parent: A, ex: [-1.7, 0, 0], anchor: [-0.78, 1.9, 0.1],
      info: { mat: '鋁合金泵殼／高溫合金渦輪', fn: '全部甲烷流經此泵加壓，泵軸由上方富燃預燃室的燃氣渦輪直接驅動。', spec: '全流量：兩股推進劑各有專屬泵', why: '把液態甲烷加壓到超過 600 bar，再送進預燃室。它的功率以萬匹馬力計，而它的軸承正泡在 -162 °C 的液體裡高速旋轉。', ds: '兩泵分離意味著沒有動密封隔開燃料與氧——FFSC 少了傳統引擎最容易磨損的一道關卡。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const c1 = cylM(0.19, 0.19, 0.34, MAT.inco, 20); c1.position.set(-0.6, 2.42, 0); g.add(c1);
    const dm = dome(0.19, 0.12, MAT.inco); dm.position.set(-0.6, 2.59, 0); g.add(dm);
    g.add(tube([[-0.47, 2.48, 0], [-0.3, 2.44, 0], [-0.13, 2.36, 0]], 0.09, MAT.inco, 14));
    v.comp({ id: 'pbF', zh: '富燃預燃室', en: 'FUEL-RICH PREBURNER', obj: g, parent: A, ex: [-1.4, 1.2, 0], anchor: [-0.66, 2.62, 0.14],
      info: { mat: '鎳基高溫合金', fn: '燒「幾乎全是甲烷＋少量液氧」的富燃混合，產生較低溫燃氣驅動燃料泵渦輪，之後全數進入主燃燒室。', spec: 'FFSC 兩座預燃室之一', why: '把一部分甲烷「富燃」燃燒，產生溫度較低的燃氣去驅動燃料泵。刻意燒不完全，是為了保護渦輪葉片——這是所有分級燃燒引擎的共同智慧。', ds: '開式循環把這股氣丟掉，Raptor 一滴不浪費——這是它比衝領先的關鍵。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const hp = cylM(0.16, 0.17, 0.85, MAT.grey, 24); hp.position.set(0.6, 1.95, 0); g.add(hp);
    const ind = M(new THREE.ConeGeometry(0.14, 0.22, 20), MAT.dark); ind.rotation.x = Math.PI; ind.position.set(0.6, 1.44, 0); g.add(ind);
    const vol = torM(0.2, 0.05, MAT.dark); vol.position.set(0.6, 1.62, 0); g.add(vol);
    v.comp({ id: 'pumpO', zh: '氧化劑渦輪泵', en: 'LOX TURBOPUMP', obj: g, parent: A, ex: [1.7, 0, 0], anchor: [0.78, 1.9, -0.1],
      info: { mat: '耐富氧合金', fn: '全部液氧流經此泵，由富氧預燃室的燃氣渦輪驅動。', spec: '轉速與功率均為火箭工業頂級', why: '液氧泵。它旋轉在工程師稱為「地獄」的環境裡：一邊是 -183 °C 的液氧，另一邊是 500 °C 的富氧燃氣，中間只隔著幾公釐的密封。一旦洩漏，金屬本身就會變成燃料。', ds: '高壓純氧環境裡，連金屬都能當燃料燒——材料選擇是 Raptor 最深的護城河之一。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const c1 = cylM(0.19, 0.19, 0.34, MAT.inco, 20); c1.position.set(0.6, 2.42, 0); g.add(c1);
    const dm = dome(0.19, 0.12, MAT.inco); dm.position.set(0.6, 2.59, 0); g.add(dm);
    g.add(tube([[0.47, 2.48, 0], [0.3, 2.44, 0], [0.13, 2.36, 0]], 0.09, MAT.inco, 14));
    v.comp({ id: 'pbO', zh: '富氧預燃室', en: 'OX-RICH PREBURNER', obj: g, parent: A, ex: [1.4, 1.2, 0], anchor: [0.66, 2.62, -0.14],
      info: { mat: '抗氧化鎳基合金', fn: '燒「幾乎全是液氧＋少量甲烷」的富氧混合，驅動氧泵渦輪後進入主燃燒室。', spec: 'FFSC 兩座預燃室之二', why: '富氧預燃室——全流量分級燃燒的皇冠，也是它的詛咒。高溫高壓的純氧會把大多數金屬直接點燃。蘇聯人在 1960 年代摸索出耐氧合金，美國人幾十年不敢碰。Raptor 是第一具真正量產的全流量引擎。', ds: '橘色粒子代表這股富氧熱氣——在流路動畫中它從右側匯入圓頂。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const fu = tube([[-0.1, 3.3, 0.16], [-0.44, 3.06, 0.24], [-0.68, 2.6, 0.22], [-0.72, 2.0, 0.1], [-0.62, 1.54, 0]], 0.07, MAT.grey, 40); g.add(fu);
    const lo = tube([[0.1, 3.3, -0.16], [0.44, 3.06, -0.24], [0.68, 2.6, -0.22], [0.72, 2.0, -0.1], [0.62, 1.54, 0]], 0.07, MAT.grey, 40); g.add(lo);
    const xf = tube([[0.58, 2.6, -0.16], [0.2, 2.94, -0.28], [-0.28, 2.9, -0.22], [-0.55, 2.64, -0.08]], 0.028, MAT.grey, 28); g.add(xf);
    const xo = tube([[-0.58, 2.6, 0.16], [-0.2, 2.94, 0.28], [0.28, 2.9, 0.22], [0.55, 2.64, 0.08]], 0.028, MAT.grey, 28); g.add(xo);
    v.refs.fCur = (fu.userData as any).curve; v.refs.oCur = (lo.userData as any).curve;
    v.refs.xfCur = (xf.userData as any).curve; v.refs.xoCur = (xo.userData as any).curve;
    v.comp({ id: 'lines', zh: '推進劑管路', en: 'FEED LINES', obj: g, parent: A, ex: [0, 1.2, 1.4], anchor: [-0.55, 3.0, 0.25],
      info: { mat: '不鏽鋼', fn: '甲烷（左）與液氧（右）各自進泵；兩條細管交叉輸送少量對側推進劑給預燃室。', spec: 'Raptor 3 將大部分管線整合進本體鑄件', why: '在 Raptor 裡，最後進入燃燒室的兩股推進劑其實都已經是氣體了——這是全流量循環最優雅的地方：氣體與氣體混合，遠比液體霧化均勻得多，燃燒因此更完全、更穩定、效率更高。', ds: '早期 Raptor 像一團義大利麵，Raptor 3 幾乎光滑——你眼前是教學上最清楚的中間形態。' } });
  })();

  (() => {
    const g = new THREE.Group();
    const t1 = cylM(0.05, 0.05, 0.22, MAT.gold, 12); t1.position.set(0, 2.6, 0); g.add(t1);
    const t2 = M(new THREE.SphereGeometry(0.05, 10, 8), MAT.gold); t2.position.set(0, 2.72, 0); g.add(t2);
    v.comp({ id: 'torch', zh: '火炬點火器', en: 'TORCH IGNITER', obj: g, parent: A, ex: [0, 1.8, 0], anchor: [0.08, 2.74, 0.06],
      info: { mat: '耐熱合金＋火星塞', fn: '以火花點燃小股甲烷／氧混合形成火炬，再引燃主燃燒室——可無限次重複點火。', spec: '取代 Merlin 的 TEA-TEB 化學點火', why: '為什麼不用 Merlin 那種一次性的自燃點火劑？因為星艦要在火星上重新起飛，而火星沒有地勤幫你補點火藥。火炬點火器燒的是引擎自己的甲烷和氧氣——只要還有燃料，它就能無限次點火。這個小零件，是為了另一顆星球而存在的。', ds: '月面與火星沒有地勤幫你灌點火藥劑——可重複點火是深空任務的入場券。' } });
  })();

  v.refs.fpbCur = curveOf([[-0.62, 2.05, 0], [-0.63, 2.28, 0], [-0.6, 2.4, 0]]);
  v.refs.opbCur = curveOf([[0.62, 2.05, 0], [0.63, 2.28, 0], [0.6, 2.4, 0]]);
  v.refs.hfCur = curveOf([[-0.6, 2.5, 0], [-0.44, 2.48, 0], [-0.26, 2.42, 0], [-0.08, 2.34, 0]]);
  v.refs.hoCur = curveOf([[0.6, 2.5, 0], [0.44, 2.48, 0], [0.26, 2.42, 0], [0.08, 2.34, 0]]);

  v.refs.pl = makePlume(0.62, 6, 'm'); v.refs.pl.position.y = 0.02; A.add(v.refs.pl); v.plumes.push(v.refs.pl);
  v.refs.sk = makePlume(0.16, 1.2, 'm'); v.refs.sk.position.y = 1.4; A.add(v.refs.sk); v.plumes.push(v.refs.sk);

  v.ap('plume', 0, (x) => v.refs.pl.userData.set(x));
  v.ap('spark', 0, (x) => v.refs.sk.userData.set(x));
  v.ap('gim', 0, (x) => {
    const a = x * Math.PI * 4;
    tvc.rotation.x = Math.sin(a) * 0.12 * (x > 0 ? 1 : 0);
    tvc.rotation.z = Math.cos(a) * 0.12 * (x > 0 ? 1 : 0);
  });
}
