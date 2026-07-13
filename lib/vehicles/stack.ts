import * as THREE from 'three';
import type { VehicleLike } from '../types';
import { MAT } from '../materials';
import { makePlume } from '../plume';
import { lat, bellPts, shift, M, cylM, boxM, torM, dome, gridFin, lerp, V3 } from '../geometry';

// 超重 + 星艦。R = 4.5，全高 121 m。
// 助推器 0–71；星艦 70.7–120.3。
export function buildStack(v: VehicleLike) {
  const R = 4.5; v.rad = 5.6;
  const bPiv = v.grp('bPiv'); bPiv.position.y = 35;
  const b = new THREE.Group(); b.position.y = -35; bPiv.add(b);
  const ship = v.grp('ship');

  /* ══════════ 33× Raptor ══════════ */
  (() => {
    const bellGeo = lat(shift(bellPts(0.2, 0.62, 1.5), 1.9), 18);
    const headGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.5, 12); headGeo.translate(0, 2.25, 0);
    const rings: [number, number][] = [[3, 0.85], [10, 2.3], [20, 3.75]];
    const g = new THREE.Group();
    const build = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      const inst = new THREE.InstancedMesh(geo, mat, 33); let n = 0; const d = new THREE.Object3D();
      rings.forEach(([cnt, rr]) => { for (let i = 0; i < cnt; i++) { const a = (i / cnt) * Math.PI * 2; d.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix); } });
      inst.instanceMatrix.needsUpdate = true; return inst;
    };
    g.add(build(bellGeo, MAT.inco)); g.add(build(headGeo, MAT.grey));
    v.comp({
      id: 'r33', zh: 'Raptor ×33', en: '33× RAPTOR', obj: g, parent: b, ex: [0, -10, 0], anchor: [2.6, 2, 2.6],
      info: {
        mat: '再生冷卻鋼製噴管',
        fn: '中央 3 具、中圈 10 具、外圈 20 具。點火的瞬間，這 33 具引擎產生 7,590 噸推力——人類製造過最猛烈的一次可控能量釋放。',
        spec: '總推力約 74 MN · 中央 13 具可擺動',
        why: '為什麼要 33 具？因為 Raptor 已經是能量產的最大尺寸，再放大會遇到燃燒不穩定的物理牆。SpaceX 的答案不是「造更大的引擎」，而是「造很多顆一樣的引擎」——把火箭工程的問題，轉譯成汽車工業最擅長的問題：量產。',
        ds: '33 具引擎同時點火，卻不能有任何一具早了或晚了幾毫秒——否則推力不對稱會把箭體扭斷。這場齊奏的指揮，是一行行程式碼。',
      },
    });
  })();

  /* ══════════ 推力結構裙 ══════════ */
  (() => {
    const g = new THREE.Group();
    const sk = cylM(R, R, 4.5, MAT.steel, 48, true); sk.position.y = 2.25; g.add(sk);
    const dm = dome(R * 0.99, R * 0.5, MAT.steel); dm.rotation.x = Math.PI; dm.position.y = 4.5; g.add(dm);
    v.comp({
      id: 'skirt', zh: '推力結構裙', en: 'THRUST SKIRT', obj: g, parent: b, ex: [0, -5, 0], anchor: [R, 2.5, 0],
      info: {
        mat: '304L 不鏽鋼',
        fn: '把 33 具引擎的推力匯進箭體，並且承接發射台的夾持、供電與加注介面。',
        spec: '承受 7,590 噸力',
        why: '傳統火箭的推力結構是一件精密昂貴的鑄件。星艦的做法粗暴得多：厚鋼板、焊起來、算好就行。因為當你打算造上百枚火箭時，「便宜且夠好」永遠打敗「昂貴且完美」。',
        ds: '這一段承受的力，相當於把 7,500 台轎車同時掛在它身上——而它只是幾片焊起來的鋼板。',
      },
    });
  })();

  /* ══════════ 助推器箭體 ══════════ */
  (() => {
    const g = new THREE.Group();
    const skin = cylM(R, R, 62, MAT.steel, 48, true); skin.position.y = 35.5; g.add(skin);
    const c = v.comp({
      id: 'bskin', zh: '助推器箭體', en: 'BOOSTER AIRFRAME', obj: g, parent: b, anchor: [R, 45, 0],
      info: {
        mat: '304L 不鏽鋼 · 焊接鋼環堆疊',
        fn: '一根 71 公尺高、9 公尺寬的不鏽鋼桶，裝著 3,400 噸推進劑。它的工作是在 2 分半內把 5,000 噸的堆疊推到 2 km/s，然後——飛回發射塔，讓兩根機械手臂接住自己。',
        spec: '直徑 9 m · 全長約 71 m',
        why: '為什麼是不鏽鋼？航太界一百年來的信仰是「越輕越好」，所以用鋁、用碳纖維。馬斯克翻了桌：不鏽鋼在低溫下強度反而更高、在高溫下不會軟掉（所以背風面根本不用隔熱瓦）、而且一公斤的價格是碳纖維的 1/50。它更重——但它便宜到你可以造一百個。這是整個星艦計畫最叛逆、也最關鍵的一個決定。',
        ds: '你正看著一個賭注：賭「便宜且可重複」會贏過「輕巧且昂貴」。如果它贏了，人類上太空的成本會掉一到兩個數量級。',
      },
    });

    const lox = cylM(R * 0.96, R * 0.96, 33, MAT.loxV, 40, true); lox.position.y = 21.5;
    v.sub(c, {
      id: 'lox', zh: '液氧槽', en: 'LOX TANK', obj: new THREE.Group().add(lox), ex: [8, 0, 0], anchor: [R * 0.6, 26, 0],
      info: {
        mat: '液態氧 · 約 -183 °C',
        fn: '助推器的下半段，約 2,500 噸液氧。它同時是箭體結構——鋼壁就是槽壁。',
        spec: '佔助推器容積過半',
        why: '重的放低、輕的放高，讓重心壓低，箭體在跨音速抖動中更穩。同時，液氧離引擎更近，可以直接進泵——省下的每一公尺管路，都是省下的重量。',
        ds: '2,500 噸的液氧，如果一口氣汽化，體積會膨脹成 800 倍。這面 4 公釐厚的鋼壁，站在那個可能性的邊上。',
      },
    });

    const ch4 = cylM(R * 0.96, R * 0.96, 26, MAT.fuelV, 40, true); ch4.position.y = 51;
    v.sub(c, {
      id: 'ch4', zh: '甲烷槽', en: 'METHANE TANK', obj: new THREE.Group().add(ch4), ex: [-8, 0, 0], anchor: [-R * 0.6, 55, 0],
      info: {
        mat: '液態甲烷 · 約 -162 °C',
        fn: '助推器的上半段，約 900 噸燃料。',
        spec: '與液氧共用同一根鋼筒',
        why: '為什麼是甲烷？三個理由，一個比一個遠：(1) 燒起來乾淨、不積碳，引擎落地就能再飛，不用大修；(2) 它的沸點和液氧接近，兩個槽可以共用一道隔框、共用一套保溫；(3) 火星的大氣有二氧化碳、地下有水冰——把它們合成甲烷，是已知化學。這罐燃料，是為了一顆你還沒去過的星球選的。',
        ds: '這是人類第一次為了「回程」而選擇燃料。地球上所有的火箭都只考慮怎麼出發；星艦考慮的是，怎麼在別的星球上加油。',
      },
    });

    const bk = new THREE.Group();
    const d1 = dome(R * 0.96, 2.0, MAT.steel); d1.position.y = 38; bk.add(d1);
    const d2 = dome(R * 0.96, 2.0, MAT.steel); d2.rotation.x = Math.PI; d2.position.y = 37.8; bk.add(d2);
    v.sub(c, {
      id: 'bulk', zh: '共底隔框', en: 'COMMON BULKHEAD', obj: bk, ex: [-5, 3, 0], anchor: [-2.4, 39.5, 2.0],
      info: {
        mat: '不鏽鋼雙層隔框',
        fn: '把液氧槽和甲烷槽背靠背地分開，省下一整段箭體與一組端蓋。',
        spec: '兩面溫差約 20 °C',
        why: '這裡藏著甲烷／液氧組合的一個隱藏優勢：兩者的沸點只差 21 度。隔框兩側的溫差很小，熱應力極低——如果換成液氫（-253 °C）配液氧，這片板子會被兩邊的溫差活活撕裂。燃料的選擇，一路影響到結構的每一道焊縫。',
        ds: '很多人以為選甲烷只是為了火星。其實它在地球上就已經開始省錢了——從這片隔框開始。',
      },
    });

    const dc = new THREE.Group();
    const down = cylM(0.55, 0.55, 33, MAT.steel, 20); down.position.set(0, 21.5, 0); dc.add(down);
    v.sub(c, {
      id: 'down', zh: '甲烷下導管', en: 'METHANE DOWNCOMER', obj: dc, ex: [0, -9, 0], anchor: [0.7, 14, 0.7],
      info: {
        mat: '不鏽鋼真空隔熱管',
        fn: '甲烷在上、引擎在下，中間隔著整個液氧槽。這根直徑一公尺的管子，直接穿過液氧把燃料送下去。',
        spec: '需供應 33 具引擎的燃料流量',
        why: '33 具引擎每秒要吃掉數噸推進劑。這根管子的流量，相當於幾十條消防水帶同時全開。而它必須穿過 -183 °C 的液氧海——如果保溫失效，甲烷會在管子裡結冰。',
        ds: '切到剖面模式看它。整根火箭最像血管的東西，就在這裡：一條粗到能讓人爬過去的管子，貫穿另一片液態的海洋。',
      },
    });

    const bf = new THREE.Group();
    [12, 20, 28, 35, 44, 52, 60].forEach((y) => { const r = torM(R * 0.9, 0.12, MAT.steel); r.position.y = y; bf.add(r); });
    v.sub(c, {
      id: 'baffle', zh: '防晃隔板', en: 'SLOSH BAFFLES', obj: bf, ex: [0, 0, 9], anchor: [-3.2, 31, 0],
      info: {
        mat: '不鏽鋼環板',
        fn: '打斷 3,400 噸推進劑的晃動。',
        spec: '沿槽壁多層佈置',
        why: '想像一個 9 公尺寬、60 公尺高的桶子裡裝著三千噸液體，而它正在翻筋斗（返場翻轉）。如果液體整團甩到一邊，重心會瞬間偏移，姿態控制根本追不上。這幾圈鋼環，是唯一在跟液體的慣性搏鬥的東西。',
        ds: '助推器翻轉的那 20 秒，是全火箭最兇險的時刻之一——不是因為引擎，而是因為裡面那片還在晃的海。',
      },
    });

    const pn = new THREE.Group();
    [1, -1].forEach((s) => {
      const p = cylM(0.35, 0.35, 1.2, MAT.grey, 14);
      p.position.set(s * R, 65, 0); p.rotation.z = Math.PI / 2;
      pn.add(p);
    });
    v.sub(c, {
      id: 'pin', zh: '塔臂承力銷', en: 'CATCH PINS', obj: pn, ex: [6, 3, 0], anchor: [R + 0.9, 65, 0],
      info: {
        mat: '高強度鋼銷',
        fn: '兩根從箭體伸出的短銷。返場時，發射塔的兩根機械手臂就靠夾住這兩點，把整支助推器接在半空中。',
        spec: '承接約 200 噸的助推器',
        why: '為什麼不裝著陸腿？因為腿很重、要收放、要維修，而且落地後還得用吊車搬回發射台。乾脆讓「塔」來接——這樣火箭上不需要多帶任何一公斤，落地即歸位，理論上幾十分鐘後就能再次加注、再次起飛。這是把「重複使用」推到極限的想法：不是快速翻修，是根本不用翻修。',
        ds: '一枚 70 公尺高、剛從太空回來的鋼柱，以每小時幾公里的速度懸停，然後被兩根手臂夾住兩顆小小的銷子。人類第一次做到這件事的時候，控制室裡沒有人坐著。',
      },
    });

    const ga = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const act = cylM(0.35, 0.35, 1.5, MAT.dark, 14);
      act.position.set(Math.cos(a) * (R - 0.6), 63.5, Math.sin(a) * (R - 0.6));
      act.rotation.z = Math.PI / 2; act.rotation.y = -a;
      ga.add(act);
    }
    v.sub(c, {
      id: 'gfAct', zh: '柵格翼電動致動器', en: 'GRID FIN ACTUATORS', obj: ga, ex: [5, -3, 5], anchor: [3.6, 62.5, 1.6],
      info: {
        mat: '電動馬達 · 無液壓',
        fn: '轉動四片巨大的柵格翼，操控助推器精準飛回發射塔。',
        spec: '全電動作動',
        why: '獵鷹用液壓——但液壓要帶油、帶泵、帶管路，而且會漏。星艦把它們全部換成電動馬達：更簡單、更可靠、可以無限次測試，而且能量直接來自箭上的電池。「用電取代液壓」聽起來像一個小改動，實際上是把一整個會出錯的子系統從火箭上刪掉。',
        ds: '刪掉一個零件，勝過改良一個零件。這是星艦工程哲學裡最常被引用的一句話——而它就寫在這裡。',
      },
    });

    const bt = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const bx = boxM(1.2, 1.4, 0.8, MAT.dark);
      const a = (i / 3) * Math.PI * 2 + 0.6;
      bx.position.set(Math.cos(a) * 3.4, 59, Math.sin(a) * 3.4);
      bx.lookAt(0, 59, 0);
      bt.add(bx);
    }
    v.sub(c, {
      id: 'batt', zh: '電池組與航電', en: 'BATTERIES & AVIONICS', obj: bt, ex: [0, 5, 6], anchor: [3.6, 60, 1.6],
      info: {
        mat: '鋰電池組 · 冗餘飛控',
        fn: '供應所有致動器、閥門與電腦的電力。星艦沒有液壓——所有「會動的東西」都吃電。',
        spec: '大容量鋰電池',
        why: '把液壓換成電動之後，火箭需要的電力暴增。但這也帶來一個好處：電池可以在地面充飽、可以模組化更換、可以精準監控每一顆電芯的健康度。一家會造電動車的公司，把電池管理的經驗直接搬進了火箭。',
        ds: '同一家公司在地上造電動車、在天上造電動火箭——用的是同一套電池思維。這不是巧合，是策略。',
      },
    });
  })();

  /* ══════════ 助推器柵格翼 ══════════ */
  (() => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const gf = gridFin(2.6, 2.0, MAT.steel); gf.rotation.z = -Math.PI / 2;
      gf.position.set(Math.cos(a) * R, 63.5, Math.sin(a) * R); gf.rotation.y = -a;
      g.add(gf);
    }
    v.comp({
      id: 'bgf', zh: '助推器柵格翼', en: 'BOOSTER GRID FINS', obj: g, parent: b, ex: [0, 3, 0], anchor: [R + 2, 63.5, 0],
      info: {
        mat: '不鏽鋼 · 固定不收折',
        fn: '四片永遠張開的巨大格柵。返場下降時，它們是助推器唯一的方向盤。',
        spec: '4 片 · 只轉動、不折收',
        why: '獵鷹的柵格翼會摺起來——因為上升時它們是純粹的阻力。星艦乾脆不摺了：省下鉸鏈、省下液壓、省下一整套會卡住的機構。多出來的那點阻力？用更多推力硬扛過去。當你有 7,590 噸推力，你可以用暴力換簡潔。',
        ds: '你會發現星艦上很多東西都「少了一個機構」。每一次「不做」，都是一次可靠度的勝利。',
      },
    });
  })();

  /* ══════════ 熱分離環 ══════════ */
  (() => {
    const g = new THREE.Group();
    const rg = cylM(R, R, 2.2, MAT.dark, 48, true); rg.position.y = 67.6; g.add(rg);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const vt = boxM(0.3, 1.6, 0.5, MAT.soot);
      vt.position.set(Math.cos(a) * R, 67.6, Math.sin(a) * R);
      vt.lookAt(0, 67.6, 0);
      g.add(vt);
    }
    v.comp({
      id: 'ring', zh: '熱分離環', en: 'HOT-STAGE RING', obj: g, parent: b, ex: [0, 4, 0], anchor: [R, 67.6, 0],
      info: {
        mat: '不鏽鋼開孔結構',
        fn: '一圈滿是開孔的鋼環。星艦的引擎會在助推器「還在點火」的時候就直接點燃——燃氣從這些孔噴出去，兩級在火焰中分開。',
        spec: '2023 年起加裝',
        why: '傳統分級要先關機、再分離、再點火——中間有幾秒鐘，火箭是「沒有推力」的，會被重力硬生生拉慢。熱分離不關機就點火，一滴速度都不浪費，可以多帶約 10% 的酬載。代價是：助推器的頭頂要承受星艦引擎的直接噴射。所以他們給它戴了一頂會被燒紅的鋼帽。',
        ds: '這個做法是蘇聯人在 1960 年代就在用的。星艦在飛了兩次之後，回頭把它撿了起來——好的工程沒有國界，也沒有時效。播放「熱分離」動畫，看它被燒紅的那一秒。',
      },
    });
  })();

  /* ══════════ 星艦箭體 ══════════ */
  (() => {
    const g = new THREE.Group();
    const skin = cylM(R, R, 33, MAT.steel, 48, true); skin.position.y = 87.2; g.add(skin);
    const c = v.comp({
      id: 'sskin', zh: '星艦箭體', en: 'SHIP AIRFRAME', obj: g, parent: ship, anchor: [R, 90, 0],
      info: {
        mat: '304L 不鏽鋼',
        fn: '這不是一節火箭，這是一艘太空船。它要入軌、要再入、要垂直著陸、要重複使用——還要載一百個人去火星。人類第一次把「火箭」與「太空船」焊成同一個東西。',
        spec: '飛船全長約 50 m · 酬載艙容積 1,000 m³ 級',
        why: '為什麼要合而為一？因為每一次「分離」都是一次拋棄。傳統架構裡，火箭送太空船上去、然後火箭死掉；太空船再入、然後熱盾死掉。星艦拒絕這個腳本：同一個殼從發射台一路飛到火星表面，再飛回來。這代表它必須同時是最好的火箭和最好的太空船——工程上幾乎不可能，但如果做到了，人類上太空的成本會掉一到兩個數量級。',
        ds: '把它拆開。裡面沒有「火箭」和「飛船」的分界線，因為根本沒有分界線。',
      },
    });

    const lox = cylM(R * 0.95, R * 0.95, 15, MAT.loxV, 40, true); lox.position.y = 79;
    v.sub(c, {
      id: 'lox', zh: '主液氧槽', en: 'MAIN LOX TANK', obj: new THREE.Group().add(lox), ex: [8, 0, 0], anchor: [R * 0.6, 80, 0],
      info: {
        mat: '液態氧',
        fn: '飛船的主氧化劑槽，位於箭體最下方、緊鄰 6 具引擎。',
        spec: '約 600 噸級（滿載）',
        why: '飛船入軌時幾乎會把主槽燒乾——而它接下來還要在太空中待幾個月、再入、翻轉、著陸。這就是為什麼它另外帶了一組獨立的「頭部貯箱」：主槽是給旅程用的，頭部貯箱是給回家用的。',
        ds: '前往火星之前，星艦必須在地球軌道上被加油船灌滿好幾次。人類史上第一座軌道加油站，就是為了填滿這個槽。',
      },
    });

    const ch4 = cylM(R * 0.95, R * 0.95, 13, MAT.fuelV, 40, true); ch4.position.y = 95;
    v.sub(c, {
      id: 'ch4', zh: '主甲烷槽', en: 'MAIN METHANE TANK', obj: new THREE.Group().add(ch4), ex: [-8, 0, 0], anchor: [-R * 0.6, 96, 0],
      info: {
        mat: '液態甲烷',
        fn: '飛船的主燃料槽。',
        spec: '約 200 噸級（滿載）',
        why: '甲烷可以在火星上「就地製造」：用大氣中的 CO₂ 加上地下水冰，跑一趟一百年前就發明的薩巴捷反應（Sabatier），就能合成甲烷和氧氣。這個槽不是設計來「帶滿燃料去火星」的——它是設計來「在火星上被填滿」的。',
        ds: '所有去過火星的探測器都是單程票。這是第一個從設計之初就想著「怎麼回來」的燃料槽。',
      },
    });

    const hd = new THREE.Group();
    const ht = M(new THREE.SphereGeometry(1.6, 20, 14), MAT.loxV); ht.position.y = 107.5; hd.add(ht);
    const hf = cylM(0.9, 0.9, 2.2, MAT.fuelV, 20); hf.position.y = 104; hd.add(hf);
    v.sub(c, {
      id: 'header', zh: '頭部著陸貯箱', en: 'HEADER TANKS', obj: hd, ex: [0, 8, 0], anchor: [1.8, 107.5, 0],
      info: {
        mat: '不鏽鋼小型貯箱',
        fn: '獨立儲存「著陸專用」的少量推進劑，藏在飛船的頭部。',
        spec: '僅供最後的翻轉與著陸點火',
        why: '著陸前，星艦要從「肚皮朝下的水平滑降」猛地翻成「垂直」。那一瞬間，主槽裡剩下的推進劑會被離心力甩到一邊，引擎會吸到氣泡而熄火。解法很聰明：另外準備一小罐油，放在離重心最遠、最不會被甩空的地方——飛船的鼻子裡。',
        ds: '這幾噸推進劑，是星艦活著落地的全部本錢。整艘船最貴重的東西，藏在它的頭裡。',
      },
    });

    const pay = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const rack = boxM(3.6, 0.25, 2.4, MAT.dark);
      rack.position.set(0, 106 + i * 1.7, 0);
      pay.add(rack);
    }
    const rail = boxM(0.2, 8.5, 0.2, MAT.grey); rail.position.set(1.9, 109.5, 1.3); pay.add(rail);
    v.sub(c, {
      id: 'pay', zh: '酬載艙 · 星鏈分配器', en: 'PAYLOAD BAY · DISPENSER', obj: pay, ex: [0, 10, 0], anchor: [2.0, 110, 1.5],
      info: {
        mat: '複合貨架 · 導軌分配機構',
        fn: '一個容積上千立方公尺的貨艙。裝星鏈時，衛星像糖果一樣一片片被推出側面的長條開口。',
        spec: '單次可部署數十顆星鏈 V2',
        why: '工程師管這個開口叫「PEZ 糖果盒」——因為它真的就是那樣運作的：不打開整個罩子，只開一條縫，讓衛星一片一片滑出去。這樣就不需要拋棄式的整流罩，也不需要複雜的展開機構。最好的分離機構，是一條斜坡加一根彈簧。',
        ds: '這個艙的容積比一輛雙層巴士還大。有一天它裝的可能不是衛星，而是一整套火星基地的組件——或者一百個人的座位。',
      },
    });

    const bf = new THREE.Group();
    [75, 80, 84, 92, 97, 101].forEach((y) => { const r = torM(R * 0.9, 0.12, MAT.steel); r.position.y = y; bf.add(r); });
    v.sub(c, {
      id: 'baffle', zh: '防晃隔板', en: 'SLOSH BAFFLES', obj: bf, ex: [0, 0, 9], anchor: [-3.2, 88, 0],
      info: {
        mat: '不鏽鋼環板',
        fn: '在再入翻轉的劇烈機動中，壓住槽內數百噸液體的甩動。',
        spec: '多層佈置',
        why: '星艦的再入姿態是全火箭史上最瘋狂的：肚皮朝下、幾乎水平、像一個張開四肢的跳傘者。在這個姿態裡，推進劑的慣性方向和平常完全不同——它會往「側邊」壓。這些隔板要對付的，是一種傳統火箭從來沒遇過的載荷。',
        ds: '它們對抗的不是重力，是慣性。而慣性，是太空裡唯一從不打盹的敵人。',
      },
    });

    const th = new THREE.Group();
    th.add(M(lat([[1.2, 71.6], [2.4, 72.6], [3.6, 73.6], [4.3, 74.6]], 40), MAT.steel));
    v.sub(c, {
      id: 'thrust', zh: '推力結構', en: 'THRUST STRUCTURE', obj: th, ex: [0, -7, 0], anchor: [3.0, 73.6, 1.5],
      info: {
        mat: '不鏽鋼錐形結構',
        fn: '承接 6 具 Raptor（3 具海平面 + 3 具真空）的推力，並把它送進箭體。',
        spec: '約 1,400 噸推力',
        why: '這裡有一個矛盾：3 具海平面引擎要能擺動（著陸靠它們轉向），3 具真空引擎固定不動（噴管太大、擺不動）。所以這個結構必須同時提供「會動的接口」和「不會動的接口」——一個要柔、一個要剛，還得共用同一塊鋼。',
        ds: '著陸的最後 5 秒，整艘船的命運壓在這塊鋼板和 3 具引擎的擺動上。人類看過它成功，也看過它失敗——而失敗的每一次，都讓它更接近成功。',
      },
    });

    const fa = new THREE.Group();
    [1, -1].forEach((s) => {
      const act = cylM(0.45, 0.45, 1.8, MAT.dark, 14);
      act.position.set(s * (R - 0.7), 72.5, 0);
      act.rotation.z = Math.PI / 2;
      fa.add(act);
    });
    v.sub(c, {
      id: 'flapAct', zh: '襟翼電動致動器', en: 'FLAP ACTUATORS', obj: fa, ex: [7, 2, 0], anchor: [R - 0.9, 73.6, 1.2],
      info: {
        mat: '大功率電動馬達',
        fn: '驅動四片襟翼。再入時它們每秒都在微調，像跳傘者用手腳保持平衡。',
        spec: '全電動 · 大扭矩',
        why: '再入時的氣動力大到荒謬，而襟翼必須頂著它持續轉動——這需要極大的扭矩。用液壓要背一整套高壓油路（而且油會沸騰）；用電動只需要電池和馬達。星艦把「會漏的東西」從火箭上刪光了。',
        ds: '這幾顆馬達要在 1,300 °C 的環境旁邊工作，還得精準到度。它們是全船最被低估的英雄。',
      },
    });
  })();

  /* ══════════ 鼻錐 ══════════ */
  (() => {
    const NP: [number, number][] = [[R, 71.5], [4.42, 74], [4.0, 77.5], [3.1, 81.5], [2.0, 84.5], [1.0, 86.8], [0.07, 88.1]];
    const g = new THREE.Group();
    g.add(M(lat(shift(NP.map((p) => [p[0], p[1] - 71.5] as [number, number]), 103.7), 48), MAT.steel));
    v.comp({
      id: 'nose', zh: '飛船鼻錐', en: 'SHIP NOSECONE', obj: g, parent: ship, ex: [0, 8, 0], anchor: [1.6, 112, 0],
      info: {
        mat: '304L 不鏽鋼',
        fn: '流線型頭部。裡面塞著酬載艙、頭部貯箱、前襟翼基座——以及未來的生活艙。',
        spec: '高約 17 m',
        why: '這個形狀不只是為了氣動：再入時它是「向後」的（星艦肚皮朝下、頭部略高），鼻錐的曲率決定了震波怎麼包住整艘船。它同時要在上升時劈開空氣、在下降時當一片機翼——同一塊鋼，兩種完全相反的任務。',
        ds: '載人版的這裡會是生活艙——有窗、有床、有一段長達六個月的旅程。你正在看的，可能是人類第一個離開地球的家。',
      },
    });
  })();

  /* ══════════ 飛船引擎 ══════════ */
  (() => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const b1 = M(lat(shift(bellPts(0.2, 0.6, 1.4), 1.9), 18), MAT.inco);
      b1.position.set(Math.cos(a) * 0.95, 72, Math.sin(a) * 0.95);
      g.add(b1);
    }
    v.comp({
      id: 'rsl', zh: '海平面 Raptor ×3', en: 'SHIP · 3× RAPTOR SL', obj: g, parent: ship, ex: [0, -6, 0], anchor: [0.95, 72.5, 0.95],
      info: {
        mat: '再生冷卻鋼製噴管',
        fn: '飛船底部的 3 具可擺動引擎。它們負責在大氣層裡工作——尤其是著陸前那個瘋狂的翻轉。',
        spec: '單機推力約 2,300 kN · 可擺動',
        why: '著陸翻轉靠的不是姿態推進器，而是這 3 具引擎的「差動節流」與「擺動」。它們必須在 5 秒內把一艘水平滑降的 100 噸鋼船，扳成垂直、並讓速度剛好在觸地時歸零。這是全火箭工程裡最接近特技飛行的一段程式碼。',
        ds: '翻轉的那一刻，如果有一具引擎晚了半秒點火，整艘船就會摔成廢鐵。人類看過那個畫面——好幾次。然後他們修好了它。',
      },
    });
  })();

  (() => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5 + Math.PI / 3;
      const b2 = M(lat(shift(bellPts(0.3, 1.5, 3.4, 20, 0.82), 72), 40), MAT.nio);
      b2.position.set(Math.cos(a) * 2.9, 0, Math.sin(a) * 2.9);
      g.add(b2);
    }
    v.comp({
      id: 'rvac', zh: '真空 Raptor ×3', en: 'SHIP · 3× RAPTOR VAC', obj: g, parent: ship, ex: [0, -3, 0], anchor: [2.9, 72, 0],
      info: {
        mat: '大面積比再生冷卻噴管',
        fn: '3 具只在太空中工作的引擎。它們的噴管大到在海平面會被大氣壓垮——所以它們從不在地面點火。',
        spec: '真空比衝約 380 s',
        why: '噴管越大，膨脹比越高，比衝越好——但在稠密的大氣裡，過大的噴管會發生「流動分離」，把噴管撕爛。所以真空版只能在高空點燃。同一款引擎、兩種裙襬，各自在自己的世界裡做到最好。',
        ds: '這 3 具引擎固定死、不擺動。它們只做一件事：在真空的寂靜裡，把一艘船推到 7.8 km/s。',
      },
    });
  })();

  /* ══════════ 氣動襟翼（修正：鉸鏈掛在元件自己的 group 上） ══════════ */
  (() => {
    const wrap = new THREE.Group();
    v.refs.flaps = [] as { h: THREE.Group; rest: number }[];
    const mkFlap = (rl: number, sp: number, px: number, py: number, rest: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(sp, 0); sh.lineTo(sp * 0.8, rl); sh.lineTo(0, rl); sh.lineTo(0, 0);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false });
      const fl = M(geo, MAT.tile); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -0.2);
      const hinge = new THREE.Group(); hinge.position.set(px, py, 0); hinge.add(fl);
      hinge.rotation.y = rest;
      wrap.add(hinge);
      v.refs.flaps.push({ h: hinge, rest });
    };
    mkFlap(13, 4.6, R, 72.5, 0.6);
    mkFlap(13, 4.6, -R, 72.5, -0.6 + Math.PI);
    mkFlap(9, 3, 1.4, 110, 0.5);
    mkFlap(9, 3, -1.4, 110, -0.5 + Math.PI);

    const c = v.comp({
      id: 'flaps', zh: '氣動襟翼', en: 'CONTROL FLAPS', obj: wrap, parent: ship, ex: [0, 0, 0], anchor: [R + 2, 78, 0],
      info: {
        mat: '不鏽鋼骨架 · 隔熱瓦覆蓋',
        fn: '兩前兩後，共四片。再入時它們像跳傘者張開的四肢——靠差動擺動，控制一艘 50 公尺長的鋼船以「肚皮朝下」的姿態滑降。',
        spec: '獨立作動 · 兼作著陸翻轉力矩',
        why: '這是星艦最反直覺的設計：它不用機翼滑翔，而是用「整個箭體的高阻力姿態」硬扛減速。速度不是被翼面優雅地轉走，是被一整面鋼板硬生生撞掉的。襟翼在這裡不是為了產生升力——只是為了不讓它翻過去。',
        ds: '第一次看到星艦「肚皮朝下」掉下來的人，都以為它失控了。它沒有。那正是設計。人類花了六十年才敢用這種方式回家。',
      },
    });

    const fr = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const rib = boxM(0.12, 0.35, 4.2, MAT.steel);
      rib.position.set(R + 0.6 + i * 0.9, 72.5, 2.1);
      fr.add(rib);
    }
    const spar = boxM(4.6, 0.4, 0.3, MAT.steel); spar.position.set(R + 2.3, 72.5, 0.3); fr.add(spar);
    v.sub(c, {
      id: 'frame', zh: '不鏽鋼骨架', en: 'STEEL FRAME', obj: fr, ex: [5, 0, 3], anchor: [R + 3, 73.2, 2.2],
      info: {
        mat: '304L 不鏽鋼肋條與大樑',
        fn: '襟翼的骨頭。承受再入時整片翼面上的巨大氣動力，並把它傳回箭體。',
        spec: '單片翼面積約 40 m²',
        why: '為什麼不用碳纖維？因為襟翼在再入時會被燒到通紅——碳纖維在 400 °C 就開始分解，而不鏽鋼在 800 °C 依然堅挺。這裡沒有「輕」的選項，只有「活下來」的選項。',
        ds: '一片 40 平方公尺的鋼翼，在超音速氣流裡被推、被燒、被扭——然後它還得聽話地轉動。',
      },
    });

    const fa2 = new THREE.Group();
    const m1 = cylM(0.5, 0.5, 1.6, MAT.dark, 16); m1.position.set(R - 0.5, 72.5, 0); m1.rotation.z = Math.PI / 2; fa2.add(m1);
    const gearbox = boxM(0.9, 0.9, 0.9, MAT.grey); gearbox.position.set(R + 0.3, 72.5, 0); fa2.add(gearbox);
    v.sub(c, {
      id: 'act', zh: '電動致動器', en: 'ELECTRIC ACTUATOR', obj: fa2, ex: [-6, 0, 0], anchor: [R - 0.6, 71.5, 1.0],
      info: {
        mat: '大扭矩電動馬達 · 減速齒箱',
        fn: '轉動整片襟翼。它必須頂著再入時的氣動力，把一片 40 平方公尺的鋼板精準地轉到指定角度。',
        spec: '全電動 · 電池直驅',
        why: '這裡的扭矩需求大到嚇人——相當於用一根手指去扳開一扇被颶風壓住的門。而且它旁邊就是 1,300 °C 的等離子體。這顆馬達必須在地獄的門口，做精密工作。',
        ds: '每一次星艦成功再入，都是這四顆馬達在無人知曉的地方，安靜地贏了一場架。',
      },
    });

    const ft = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const t = M(new THREE.CircleGeometry(0.42, 6), MAT.tile);
        t.position.set(R + 0.8 + i * 0.95, 72.9, 0.8 + j * 0.95);
        t.rotation.x = -Math.PI / 2;
        ft.add(t);
      }
    }
    v.sub(c, {
      id: 'ftile', zh: '襟翼隔熱瓦', en: 'FLAP TILES', obj: ft, ex: [0, 6, 0], anchor: [R + 2, 73.4, 1.8],
      info: {
        mat: '黑色陶瓷隔熱瓦',
        fn: '覆蓋襟翼的迎風面。翼根與鉸鏈處是整艘船熱流最兇的地方之一。',
        spec: '耐受 1,300 °C 以上',
        why: '襟翼是「突出來」的東西——凡是突出來的，都會製造震波、都會被加倍地燒。早期試飛中，襟翼鉸鏈燒穿是最常見的失敗模式。後來他們把整個鉸鏈往背風面挪、再貼滿瓦——用「換位置」解決了「換材料」解不了的問題。',
        ds: '看再入直播時，最先亮起橘光的就是襟翼的前緣。那是它在替整艘船擋刀。',
      },
    });

    const hg = new THREE.Group();
    const hb = cylM(0.55, 0.55, 1.1, MAT.steel, 16); hb.position.set(R, 72.5, -0.3); hb.rotation.z = Math.PI / 2; hg.add(hb);
    const seal = torM(0.62, 0.08, MAT.felt); seal.position.set(R, 72.5, -0.3); seal.rotation.z = Math.PI / 2; hg.add(seal);
    v.sub(c, {
      id: 'hinge', zh: '鉸鏈與熱密封', en: 'HINGE & THERMAL SEAL', obj: hg, ex: [0, -5, -4], anchor: [R + 0.7, 71.8, -0.6],
      info: {
        mat: '鋼鉸鏈 · 陶瓷纖維密封',
        fn: '襟翼與箭體之間唯一的縫。它必須能轉動，又必須不讓等離子體鑽進去。',
        spec: '再入時的關鍵失效點',
        why: '這是整艘船最難的一個工程問題：一個「會動的縫」，同時要「完全密封」。任何一絲高溫氣體從這裡鑽進去，都會在幾秒內把裡面的致動器燒融。星艦的前幾次再入，就是輸在這條縫上。',
        ds: '有時候，一整個文明的太空夢，會卡在一條幾公分寬的縫隙上。而工程的浪漫就在於——他們真的把它補起來了。',
      },
    });
  })();

  /* ══════════ 隔熱瓦 ══════════ */
  (() => {
    const NPabs: [number, number][] = [[R, 71.5], [4.42, 74], [4.0, 77.5], [3.1, 81.5], [2.0, 84.5], [1.0, 86.8], [0.07, 88.1]]
      .map((p) => [p[0], p[1] - 71.5 + 103.7] as [number, number]);
    const noseR = (y: number) => {
      if (y <= 71.5) return R;
      for (let i = 1; i < NPabs.length; i++) {
        if (y <= NPabs[i][1]) { const a = NPabs[i - 1], b2 = NPabs[i]; const u = (y - a[1]) / (b2[1] - a[1]); return lerp(a[0], b2[0], u); }
      }
      return 0.1;
    };
    const tileGeo = new THREE.CircleGeometry(0.5, 6);
    const dummy = new THREE.Object3D();
    const rows: number[] = []; for (let y = 71.2; y < 119; y += 0.95) rows.push(y);
    const arc = 3.4; let total = 0;
    const counts = rows.map((y) => { const r = noseR(y); const dt = 0.95 / Math.max(0.6, r); const n = Math.floor(arc / dt) + 1; total += n; return n; });
    const inst = new THREE.InstancedMesh(tileGeo, MAT.tile, total);
    let idx = 0; const nrm = V3();
    rows.forEach((y, ri) => {
      const r = noseR(y); const n = counts[ri]; const dt = arc / n;
      for (let j = 0; j < n; j++) {
        const th2 = Math.PI - arc / 2 + j * dt + dt / 2;
        const x = Math.cos(th2) * r, z = Math.sin(th2) * r;
        dummy.position.set(x, y, z);
        nrm.set(x, 0, z).normalize();
        dummy.lookAt(x + nrm.x, y, z + nrm.z);
        dummy.updateMatrix(); inst.setMatrixAt(idx++, dummy.matrix);
      }
    });
    inst.instanceMatrix.needsUpdate = true;
    const g = new THREE.Group(); g.add(inst);
    const c = v.comp({
      id: 'tiles', zh: '隔熱瓦', en: 'HEAT-SHIELD TILES', obj: g, parent: ship, ex: [0, 0, -6], anchor: [0, 95, -R - 1.5],
      info: {
        mat: '黑色陶瓷隔熱瓦 · 僅迎風面',
        fn: '數千片六角陶瓷瓦，鋪滿飛船的迎風側。再入時它們要擋下 1,300 °C 以上的等離子體——背後那層鋼，只有幾公釐厚。',
        spec: '約 18,000 片 · 背風面裸鋼不鋪瓦',
        why: '為什麼只有一半鋪瓦？因為不鏽鋼在幾百度的高溫下依然堅挺，背風面根本燒不到那個程度——那就不鋪。太空梭全身包瓦，每一片都不同形狀、每一次落地都要人工檢查上千片。星艦選了不鏽鋼，就是為了讓「一半的船不需要防熱」。',
        ds: '這是整個星艦計畫最艱難的一塊拼圖。每一次試飛，工程師最緊張的都不是引擎——是這幾千片瓦，會不會掉。',
      },
    });

    const hx = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const t = M(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 6), MAT.tile);
      const a = (i / 6) * Math.PI * 2;
      const rr = i === 0 ? 0 : 1.1;
      t.position.set(Math.cos(a) * rr, 96 + Math.sin(a) * rr, -R - 0.9);
      t.rotation.x = Math.PI / 2;
      hx.add(t);
    }
    v.sub(c, {
      id: 'hex', zh: '六角陶瓷瓦', en: 'HEXAGONAL TILES', obj: hx, ex: [0, 0, -5], anchor: [1.4, 97.2, -R - 1.1],
      info: {
        mat: '低密度陶瓷（矽基）',
        fn: '單片瓦。輕到可以放在手掌上，卻能讓一面被燒到白熱的表面，背面依然涼得可以徒手觸摸。',
        spec: '單片對邊約 30 cm',
        why: '為什麼是六角形？因為熱膨脹。受熱時每一片都會脹大，如果是方形，四個角會互相擠壓、崩裂；六角形的密鋪讓每片都能均勻地往外「讓位」，彼此推擠但不對撞。形狀本身，就是隔熱策略的一部分。',
        ds: '這種材料 90% 以上是空氣。你手裡拿著的，幾乎是一塊被凍住的煙——而它擋得住等離子體。',
      },
    });

    const pin = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const p = cylM(0.07, 0.07, 0.45, MAT.grey, 8);
      const a = (i / 6) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.9, 96 + Math.sin(a) * 0.9, -R - 0.55);
      p.rotation.x = Math.PI / 2;
      pin.add(p);
    }
    v.sub(c, {
      id: 'pin', zh: '機械固定銷', en: 'MECHANICAL PINS', obj: pin, ex: [0, 0, -3], anchor: [1.1, 95.2, -R - 0.6],
      info: {
        mat: '金屬銷 · 彈性卡榫',
        fn: '把瓦「插」在鋼殼上，而不是黏上去。每片瓦背後有幾個銷子，插進焊在鋼板上的座裡。',
        spec: '可單片快速更換',
        why: '太空梭的瓦是「黏」的——每一片都要人工塗膠、定位、養護，換一片要好幾天。星艦要能在幾小時內翻修，所以瓦必須像樂高一樣「插上去、拔下來」。但插銷有個致命弱點：在劇烈震動中，它會鬆。早期試飛中掉瓦，掉的就是這裡。',
        ds: '一枚火箭最大的敵人，有時候不是溫度，也不是壓力——是一顆鬆掉的插銷。',
      },
    });

    const felt = new THREE.Group();
    const fl = boxM(3.2, 3.2, 0.12, MAT.felt); fl.position.set(0, 96, -R - 0.3); felt.add(fl);
    v.sub(c, {
      id: 'felt', zh: '隔熱毯（備援層）', en: 'ABLATIVE BACKUP LAYER', obj: felt, ex: [0, 0, -1.5], anchor: [-1.6, 94.4, -R - 0.35],
      info: {
        mat: '燒蝕型纖維毯',
        fn: '藏在瓦片與鋼殼之間的最後一道防線。如果上面那片瓦掉了，它會犧牲自己、燒掉自己，替鋼板多爭取幾秒鐘。',
        spec: '一次性犧牲層',
        why: '工程師知道瓦一定會掉——18,000 片，總有一片會出事。所以他們的答案不是「保證不掉」，而是「掉了也不會死」。這層毯子的存在，本身就是一種對失敗的坦然。',
        ds: '最成熟的工程，不是消滅所有失敗，是讓每一種失敗都有一個備案。這層毯子就是星艦寫給自己的保險單。',
      },
    });

    const st = new THREE.Group();
    const plate = boxM(3.6, 3.6, 0.06, MAT.steel); plate.position.set(0, 96, -R - 0.12); st.add(plate);
    v.sub(c, {
      id: 'steel', zh: '不鏽鋼基材', en: 'STEEL SUBSTRATE', obj: st, ex: [0, 0, -0.5], anchor: [1.7, 94.4, -R - 0.15],
      info: {
        mat: '304L 不鏽鋼 · 厚約 4 mm',
        fn: '瓦的背後，就是箭體本身。沒有中間層、沒有次結構——瓦直接插在承力的鋼殼上。',
        spec: '同時是貯箱壁、結構、防熱背板',
        why: '這就是不鏽鋼的紅利：它在 800 °C 依然有結構強度，所以即使瓦掉了、即使被燒到通紅，這面牆仍然撐得住裡面幾百噸的推進劑。用鋁做同樣的事？鋁在 200 °C 就軟了，整艘船會像可樂罐一樣被壓扁。',
        ds: '這 4 公釐，是人類與 1,300 °C 之間的全部距離。而它之所以敢這麼薄，只因為它是鋼。',
      },
    });
  })();

  v.refs.bPlume = makePlume(4.2, 30, 'm'); v.refs.bPlume.position.y = 0.3; b.add(v.refs.bPlume); v.plumes.push(v.refs.bPlume);
  v.refs.sPlume = makePlume(2.6, 16, 'm'); v.refs.sPlume.position.y = 70.6; ship.add(v.refs.sPlume); v.plumes.push(v.refs.sPlume);

  v.ap('bp', 0, (x) => v.refs.bPlume.userData.set(x));
  v.ap('spl', 0, (x) => v.refs.sPlume.userData.set(x));
  v.ap('sep', 0, (x) => { ship.position.y = x; });
  v.ap('flipB', 0, (x) => { bPiv.rotation.z = x * 1.85; });
  v.ap('ring', 0, (x) => {
    const c = v.find('ring'); if (!c) return;
    c.meshes.forEach((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat.emissive) { mat.emissive.setHex(0xd8483a); mat.emissiveIntensity = x * 1.4; }
    });
  });
  v.ap('flap', 0, (x) => {
    v.refs.flaps.forEach((f: { h: THREE.Group; rest: number }, i: number) => {
      f.h.rotation.y = f.rest + Math.sin(x * Math.PI * 4 + i * 1.4) * 0.5 * (x > 0 ? 1 : 0);
    });
  });
}
