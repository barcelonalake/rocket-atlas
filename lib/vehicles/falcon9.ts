import * as THREE from 'three';
import type { VehicleLike } from '../types';
import { MAT } from '../materials';
import { makePlume } from '../plume';
import { lat, bellPts, shift, M, cylM, boxM, torM, tube, dome, gridFin, lerp } from '../geometry';

// 獵鷹 9 號 Block 5。R = 1.83，全高 70 m。
// 座標：b group 底部為 y=0；一級箭體 1.9–42.9，級間段 42.9–47.3，
// 二級 47.4–59.4，整流罩 59.5–72.6。
export function buildF9(v: VehicleLike) {
  const R = 1.83; v.rad = 2.6;
  const bPiv = v.grp('bPiv'); bPiv.position.y = 23;
  const b = new THREE.Group(); b.position.y = -23; bPiv.add(b);
  const up = v.grp('up');

  /* ══════════ 八格引擎架 ══════════ */
  (() => {
    const g = new THREE.Group();
    const oct = cylM(R * 0.98, R * 0.98, 1.1, MAT.soot, 32, true); oct.position.y = 1.0; g.add(oct);
    const rng = torM(R * 0.9, 0.08, MAT.dark); rng.position.y = 0.5; g.add(rng);
    const c = v.comp({
      id: 'octa', zh: '八格引擎架', en: 'OCTAWEB', obj: g, parent: b, ex: [0, -4, 0], anchor: [R * 0.8, 0.9, R * 0.5],
      info: {
        mat: '鋁合金焊接框架',
        fn: '把 9 具 Merlin 以「八外一中」排列鎖死，並用隔艙壁把每具引擎彼此隔開。所有推力都在這裡匯集，再送進箭體。',
        spec: '9× Merlin 1D · 海平面總推力 7,607 kN',
        why: '早期獵鷹用的是方形引擎架，難焊、難修、難換引擎。八格結構把「維修單顆引擎」變成拆一個格子——這是為了「一週內再飛一次」而重新設計的機構。',
        ds: '這個排列讓獵鷹能容忍升空後熄火一到兩具引擎、仍然完成任務。引擎冗餘不是保險，是它敢在人命任務上簽字的底氣。',
      },
    });

    const bays = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const w = boxM(1.15, 1.0, 0.05, MAT.alu);
      w.position.set(Math.cos(a) * 1.15, 1.0, Math.sin(a) * 1.15);
      w.lookAt(0, 1.0, 0); w.rotateY(Math.PI / 2);
      bays.add(w);
    }
    v.sub(c, {
      id: 'bay', zh: '引擎隔艙壁', en: 'ENGINE BAY WALLS', obj: bays, ex: [0, 2.5, 0], anchor: [1.2, 1.35, 0.5],
      info: {
        mat: '鋁合金隔板',
        fn: '把 9 具引擎切成互相隔離的艙格，阻擋碎片、火焰與爆震的橫向傳播。',
        spec: '8 片放射狀隔板',
        why: '一具引擎失效時，最可怕的不是它停了，而是它「炸給隔壁看」。這幾片薄板把一次故障關在一個格子裡——引擎冗餘的前提，是故障不會傳染。',
        ds: '真正的可靠度不是讓零件不壞，而是設計成「壞了也沒關係」。這面牆就是那句話的實體。',
      },
    });

    const tvc = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const act = cylM(0.09, 0.09, 0.85, MAT.grey, 12);
      act.position.set(Math.cos(a) * 1.25, 1.75, Math.sin(a) * 1.25);
      act.rotation.z = Math.cos(a) * 0.45; act.rotation.x = -Math.sin(a) * 0.45;
      tvc.add(act);
    }
    v.sub(c, {
      id: 'tvcAct', zh: 'TVC 液壓致動器', en: 'TVC ACTUATORS', obj: tvc, ex: [3, 1, 3], anchor: [1.3, 2.0, 0],
      info: {
        mat: '高壓液壓缸',
        fn: '推拉整具引擎繞萬向節擺動，操控火箭的俯仰與偏航。整枚火箭的方向盤就是這幾根桿子。',
        spec: '擺動範圍約 ±5°',
        why: '火箭沒有翅膀也沒有舵——在真空與跨音速中唯一能轉向的方式，就是「把噴出去的火焰偏一點點」。5 度，足以扭轉一枚 549 噸的載具。',
        ds: '獵鷹的液壓油來自 RP-1 主燃料管路，用完直接燒掉——連液壓系統都不帶回收油箱。極簡到近乎粗暴。',
      },
    });

    const teb = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const t = cylM(0.16, 0.16, 0.55, MAT.gold, 16);
      t.position.set(i === 0 ? 0.85 : -0.85, 1.75, 0.5); teb.add(t);
    }
    v.sub(c, {
      id: 'teb', zh: 'TEA-TEB 點火劑罐', en: 'TEA-TEB IGNITER TANKS', obj: teb, ex: [0, 3.5, 2.5], anchor: [0.9, 2.05, 0.5],
      info: {
        mat: '不鏽鋼壓力罐',
        fn: '儲存三乙基鋁／三乙基硼——一種碰到空氣就自燃的液體。噴進燃燒室的瞬間爆出綠色火焰，點燃 9 具引擎。',
        spec: '化學自燃點火劑（TEA-TEB）',
        why: '為什麼不用火星塞？因為 9 具引擎必須在毫秒內同時起燃，而電點火在 100 bar 的湍流裡不可靠。自燃劑是「保證會著」的暴力解。',
        ds: '這也是它的代價：罐子裡有幾發就只能點幾次火。星艦改用可無限重複的火炬點火器——那是為了在火星起飛，那裡沒有地勤幫你灌點火藥。',
      },
    });

    const heat = new THREE.Group();
    const hs = M(new THREE.RingGeometry(0.45, R * 0.99, 40), MAT.soot);
    hs.rotation.x = -Math.PI / 2; hs.position.y = 0.32; heat.add(hs);
    v.sub(c, {
      id: 'heat', zh: '底部熱防護罩', en: 'BASE HEAT SHIELD', obj: heat, ex: [0, -3.5, 0], anchor: [1.4, 0.3, 0.6],
      info: {
        mat: '陶瓷纖維防護毯',
        fn: '封住引擎之間的縫隙，擋住從噴管回捲的高溫燃氣與再入時的氣動加熱。',
        spec: '覆蓋整個引擎底盤',
        why: '火箭最脆弱的一刻不是升空，是「屁股朝前」倒著衝回大氣層的時候——這面盾牌把 1,600 °C 的等離子體擋在管線之外。它是第一級能活著回家的原因之一。',
        ds: '看回收影片時，著陸的第一級底部總是焦黑一片。那不是燒壞，那是它做完了工作。',
      },
    });
  })();

  /* ══════════ 9× Merlin 1D ══════════ */
  (() => {
    const g = new THREE.Group();
    const bellGeo = lat(shift(bellPts(0.13, 0.45, 1.1), 1.42), 24);
    const headGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16); headGeo.translate(0, 1.7, 0);
    const build = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      const inst = new THREE.InstancedMesh(geo, mat, 9);
      let n = 0; const d = new THREE.Object3D();
      d.position.set(0, 0, 0); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; d.position.set(Math.cos(a) * 1.18, 0, Math.sin(a) * 1.18); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix); }
      inst.instanceMatrix.needsUpdate = true; return inst;
    };
    g.add(build(bellGeo, MAT.inco));
    g.add(build(headGeo, MAT.grey));
    v.comp({
      id: 'm9', zh: 'Merlin 1D ×9', en: '9× MERLIN 1D', obj: g, parent: b, ex: [0, -6.5, 0], anchor: [0.9, 1.4, 0.9],
      info: {
        mat: '銅合金燃燒室 · 鎳基噴管',
        fn: '第一級的動力。升空時 9 具全開，隨後外圈 8 具陸續關機；只留中央那一具，完成回推、再入與最後的著陸點火。',
        spec: '單機海平面推力 845 kN · 可節流至 40%',
        why: '為什麼是 9 具小引擎，而不是 1 具大引擎？因為小引擎能量產、能冗餘、能節流到極低推力——著陸時火箭已經幾乎空了，一具引擎的最小推力仍大於它的重量。這意味著它「不可能懸停」，只能算準時間讓速度和高度同時歸零。工程師叫這個 hoverslam：一次性、沒有第二次機會的著陸。',
        ds: '想看它的心臟怎麼跳？切到「Merlin 1D」分頁，把燃氣產生器循環一根管一根管拆開。',
      },
    });
  })();

  /* ══════════ 第一級箭體（內含全部貯箱系統） ══════════ */
  (() => {
    const g = new THREE.Group();
    const skin = cylM(R, R, 41, MAT.white, 48, true); skin.position.y = 22.4; g.add(skin);
    const li = torM(R, 0.04, MAT.grey); li.position.y = 1.9; g.add(li);
    const c = v.comp({
      id: 's1skin', zh: '第一級箭體', en: 'STAGE 1 AIRFRAME', obj: g, parent: b, anchor: [R, 33, 0],
      info: {
        mat: '鋁鋰合金 2195 · 攪拌摩擦焊',
        fn: '一根 42 公尺長的鋁罐，同時是貯箱、是骨架、也是氣動外殼。裡面裝著 410 噸推進劑——佔整枚火箭質量的 96%。',
        spec: '直徑 3.7 m · 一級全長約 42 m',
        why: '火箭的殘酷算式：每多 1 公斤結構，就少 1 公斤酬載。所以工程師把箭體薄到極限——沒有內壓時，它像空鋁罐一樣能被手指按凹。它靠貯箱增壓維持剛性，就像充飽氣的氣球才站得直。',
        ds: '你正看著整枚火箭最反直覺的事實：這不是「裝著油箱的火箭」，這是「一個會飛的油箱」。點下面的內部零件，看看這罐子裡到底藏了什麼。',
      },
    });

    const lox = cylM(R * 0.94, R * 0.94, 19.8, MAT.loxV, 40, true); lox.position.y = 31.5;
    v.sub(c, {
      id: 'lox', zh: '液氧槽', en: 'LOX TANK', obj: new THREE.Group().add(lox), ex: [7, 0, 0], anchor: [R * 0.6, 36, 0],
      info: {
        mat: '液態氧 · 約 -183 °C',
        fn: '約 287 噸氧化劑，佔據箭體上半段。發射前必須持續補加，因為它每分每秒都在蒸發。',
        spec: '亞冷卻（sub-cooled）至 -207 °C',
        why: '為什麼把液氧冷得比沸點更低？因為冷縮。多冷 20 度，同一個槽能多塞 8% 的氧——白撿的性能。代價是加注必須在發射前 35 分鐘才開始，一旦倒數中斷就得整罐倒掉重來。SpaceX 用一個「來不及後悔」的流程，換到了額外的酬載。',
        ds: '重的放上面、輕的放下面——這違反直覺，卻讓箭體在跨音速抖動時更穩，也讓燃料離引擎更近、管路更短。',
      },
    });

    const rp1 = cylM(R * 0.94, R * 0.94, 15.6, MAT.fuelV, 40, true); rp1.position.y = 11.6;
    v.sub(c, {
      id: 'rp1', zh: 'RP-1 燃料槽', en: 'RP-1 TANK', obj: new THREE.Group().add(rp1), ex: [-7, 0, 0], anchor: [-R * 0.6, 9, 0],
      info: {
        mat: '高精煉煤油 RP-1',
        fn: '約 123 噸燃料。常溫可儲存、密度高，不需要保溫層。',
        spec: '同樣深冷至 -7 °C 以增加密度',
        why: '煤油的比衝輸給液氫一大截，但它的密度是液氫的 11 倍——同樣的能量，槽體可以小得多，箭體因此更短、更輕、更便宜。SpaceX 選了「難看但划算」的那一個。',
        ds: '煤油燃燒會積碳，這是 Merlin 沒辦法像 Raptor 那樣無限次重複點火的原因之一。星艦改燒甲烷，正是為了擺脫這層黑灰。',
      },
    });

    const bulk = new THREE.Group();
    const bd1 = dome(R * 0.94, 0.95, MAT.alu); bd1.position.y = 20.1; bulk.add(bd1);
    const bd2 = dome(R * 0.94, 0.95, MAT.alu); bd2.rotation.x = Math.PI; bd2.position.y = 20.0; bulk.add(bd2);
    v.sub(c, {
      id: 'bulk', zh: '共底隔框', en: 'COMMON BULKHEAD', obj: bulk, ex: [-4, 2.5, 0], anchor: [-1.0, 21.0, 0.9],
      info: {
        mat: '鋁鋰合金雙層隔框',
        fn: '把液氧槽與煤油槽背靠背地隔開，省下一整段箭體與一組端蓋。',
        spec: '兩面溫差超過 180 °C',
        why: '如果兩個槽各做各的端蓋，中間必然多出一截空箭體。共底把兩個端蓋壓成一個，省下的每一公尺長度，都是幾百公斤的結構質量——在入軌級，這幾乎是一比一換成酬載。',
        ds: '它的一面泡在 -183 °C 的液氧裡，另一面貼著常溫煤油。這片薄鋁每一秒都活在兩個世界的邊界上。',
      },
    });

    const baf = new THREE.Group();
    [7, 11.5, 16, 24, 29, 34, 39].forEach((y) => { const r = torM(R * 0.88, 0.05, MAT.alu); r.position.y = y; baf.add(r); });
    v.sub(c, {
      id: 'baffle', zh: '防晃隔板', en: 'SLOSH BAFFLES', obj: baf, ex: [0, 0, 7], anchor: [-1.4, 27, 0],
      info: {
        mat: '薄鋁環板',
        fn: '貯箱內的環形擋板，打斷推進劑的大幅晃動。',
        spec: '沿槽壁多層佈置',
        why: '想像 287 噸的液體在罐子裡晃來晃去，而火箭正靠感測器判斷自己「歪了沒有」。液體晃動的頻率如果剛好撞上姿態控制的頻率，就會共振——輕則耗光修正燃料，重則整枚火箭翻掉。這幾片薄鋁環，是史上最便宜的保命符。',
        ds: '它從不出現在任何一段酷炫的影片裡，因為它的成功就是「什麼都沒發生」。真實的火箭曾經死於液體晃動。',
      },
    });

    const dc = new THREE.Group();
    dc.add(tube([[0, 20.4, 0], [0, 14, 0], [0, 7, 0], [0, 3.2, 0]], 0.26, MAT.grey, 30));
    v.sub(c, {
      id: 'down', zh: '液氧下導管', en: 'LOX DOWNCOMER', obj: dc, ex: [0, -7, 0], anchor: [0.35, 12, 0.35],
      info: {
        mat: '不鏽鋼真空隔熱管',
        fn: '液氧槽在上、引擎在下，中間隔著整個煤油槽——這根管子直接穿過煤油，把液氧送到引擎。',
        spec: '流量約 1,000 kg/s 級（全推力）',
        why: '為什麼不繞外面走？因為外掛管路會破壞氣動外形、增加重量、還要額外保溫。直接穿過去最短、最輕——代價是這根 -183 °C 的管子必須在煤油裡「保持冷卻卻不把煤油凍住」。工程就是這種取捨的連續體。',
        ds: '切到剖面模式，你會看到它像一根脊椎，從液氧槽底一路貫穿到引擎。整枚火箭最粗暴的那道血管。',
      },
    });

    const copv = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const t = cylM(0.3, 0.3, 3.2, MAT.carbon, 16);
      t.position.set(Math.cos(a) * 1.15, 30, Math.sin(a) * 1.15);
      copv.add(t);
    }
    v.sub(c, {
      id: 'copv', zh: '高壓氦氣瓶（COPV）', en: 'HELIUM COPV', obj: copv, ex: [5, 4, 0], anchor: [1.2, 32.5, 0.9],
      info: {
        mat: '碳纖維纏繞 · 鋁內襯',
        fn: '浸在液氧裡的高壓氦瓶。推進劑被消耗後，槽內會出現真空——氦氣負責把空缺填滿，維持箱壓與箭體剛性。',
        spec: '工作壓力數百 bar',
        why: '為什麼泡在液氧裡？因為低溫讓氦更密，同一個瓶子能裝下更多氣體。用溫度換體積，是火箭上最常見的一種免費午餐。',
        ds: '這是航太史上最著名的敏感件之一：低溫、超高壓、碳纖維纏繞層之間的耦合行為極難預測。SpaceX 為它重寫過整套加注流程，也為它付過昂貴的學費。',
      },
    });

    const th = new THREE.Group();
    th.add(M(lat([[0.75, 2.0], [1.15, 2.45], [1.5, 2.9], [1.78, 3.35]], 40), MAT.grey));
    v.sub(c, {
      id: 'thrust', zh: '推力承力框', en: 'THRUST FRAME', obj: th, ex: [0, -5, 0], anchor: [1.3, 2.7, 0.8],
      info: {
        mat: '鋁合金錐形桁架',
        fn: '把 9 具引擎集中在直徑 3 公尺內的 7,607 kN 推力，擴散進 3.7 公尺寬的箭體壁。',
        spec: '承受約 770 噸力',
        why: '推力來自一小圈引擎，箭體卻是一整個大圓——中間必須有一個「力的翻譯器」，把集中的點力攤成均勻的環向流。這個錐形結構不燒、不轉、不發光，卻是所有力的必經之路。',
        ds: '火箭上最沉默的零件。它一輩子只做一件事：不要斷。',
      },
    });

    const iso = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const st = boxM(0.05, 9, 0.16, MAT.alu);
      st.position.set(Math.cos(a) * 1.76, 27, Math.sin(a) * 1.76);
      st.lookAt(0, 27, 0);
      iso.add(st);
    }
    [23, 27, 31].forEach((y) => { const r = torM(1.76, 0.05, MAT.alu); r.position.y = y; iso.add(r); });
    v.sub(c, {
      id: 'iso', zh: '等格柵壁板', en: 'ISOGRID WALL', obj: iso, ex: [8, 0, 0], anchor: [1.85, 24, 0],
      info: {
        mat: '鋁鋰合金整體銑削',
        fn: '從一整塊厚鋁板上「挖掉」多餘材料，只留下三角網格與縱梁——留下強度，丟掉重量。',
        spec: '壁厚可薄至數公釐',
        why: '最強的形狀是三角形，最輕的做法是把不承力的地方全部切掉。工程師會告訴你：他們不是在「造」箭體，是在「雕」箭體——把一塊 90% 都要被削掉的鋁錠，雕成一張能撐住 770 噸的殼。',
        ds: '摸過等格柵壁板的人都說那手感很怪：像一張又輕又硬的蜂巢紙。你會忍不住懷疑它撐得住什麼——然後它把你送進軌道。',
      },
    });

    const cg = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const n = M(new THREE.ConeGeometry(0.11, 0.24, 12), MAT.grey);
      n.position.set(Math.cos(a) * R, 41.4, Math.sin(a) * R);
      n.lookAt(Math.cos(a) * 4, 41.4, Math.sin(a) * 4);
      cg.add(n);
    }
    v.sub(c, {
      id: 'cg', zh: '冷氣氮氣推進器', en: 'COLD-GAS THRUSTERS', obj: cg, ex: [4, 3, 4], anchor: [R + 0.5, 41.4, 0],
      info: {
        mat: '高壓氮氣噴嘴',
        fn: '級間分離後，第一級在真空中沒有空氣可以「推」——這幾股高壓氮氣負責把 40 公尺長的箭體整個翻轉 180 度。',
        spec: '純冷氣，不燃燒',
        why: '為什麼不用引擎轉向？因為那時引擎已關機，而且要轉的是姿態、不是速度。放氣是最簡單、最不可能故障的方式：沒有燃燒、沒有點火、沒有渦輪——只是把氣放掉。',
        ds: '回收影片裡第一級那個帥氣的「回眸翻身」，就是這幾個小噴嘴幹的。最華麗的動作，來自最原始的物理。',
      },
    });

    const av = new THREE.Group();
    const box = boxM(0.9, 0.8, 0.5, MAT.dark); box.position.set(1.2, 39, 0.9); av.add(box);
    const pl = boxM(0.5, 0.35, 0.06, MAT.gold); pl.position.set(1.2, 39, 1.18); av.add(pl);
    v.sub(c, {
      id: 'av', zh: '航電與電池', en: 'AVIONICS & BATTERIES', obj: av, ex: [0, 4, 5], anchor: [1.5, 39.6, 1.2],
      info: {
        mat: '商規處理器 · 三重冗餘',
        fn: '飛行電腦、慣性導航、GPS、遙測與電池。從點火到著陸的每一個決定，都在這個盒子裡發生。',
        spec: '三台電腦同時運算，多數決',
        why: '航太業傳統上買「抗輻射晶片」——貴上千倍。SpaceX 反其道而行：用便宜的商規處理器，但同時跑三台，任何一台被宇宙射線打錯一個 bit，另外兩台就把它否決掉。用架構的聰明，換掉硬體的昂貴。',
        ds: '這是一台會懷疑自己的電腦。它每秒都在問：「我剛剛算的那個數字，是不是被一顆從超新星飛來的粒子改掉了？」',
      },
    });
  })();

  /* ══════════ 級間段 ══════════ */
  (() => {
    const g = new THREE.Group();
    const inter = cylM(R, R, 4.4, MAT.carbon, 48, true); inter.position.y = 45.1; g.add(inter);
    const b1 = torM(R, 0.05, MAT.dark); b1.position.y = 43.0; g.add(b1);
    const c = v.comp({
      id: 'inter', zh: '級間段', en: 'INTERSTAGE', obj: g, parent: b, ex: [0, 3, 0], anchor: [R, 45.6, 0],
      info: {
        mat: '碳纖維／鋁蜂巢夾層',
        fn: '連接一二級的結構筒。它同時是分離機構的容器、第二級引擎噴管的家、以及四片柵格翼的基座。',
        spec: '氣動冷分離（不炸螺栓）',
        why: '傳統火箭用爆炸螺栓分級——快、可靠、但沒得反悔，而且碎片會打到自己。獵鷹用氣壓推桿把兩級「輕輕推開」，可重複、可測試、可回收。想重複使用，就不能有任何一次性的爆炸物。',
        ds: '分離之後，這節筒子留在第一級頭上一起回家。你在著陸影片裡看到頂端張開的柵格翼，就長在它身上。',
      },
    });

    const hc = new THREE.Group();
    const inner = cylM(R * 0.93, R * 0.93, 4.2, MAT.alu, 40, true); inner.position.y = 45.1; hc.add(inner);
    v.sub(c, {
      id: 'core', zh: '鋁蜂巢芯', en: 'ALUMINIUM HONEYCOMB CORE', obj: hc, ex: [0, 0, 6], anchor: [-R * 0.9, 46.5, 0],
      info: {
        mat: '鋁蜂巢 · 碳纖維面板',
        fn: '兩層薄碳纖維面板中間夾一層蜂巢——像一塊三明治，輕得離譜卻硬得驚人。',
        spec: '密度僅為實心鋁的數十分之一',
        why: '彎曲剛度和「厚度的三次方」成正比。把兩張薄板隔開，中間塞進幾乎沒有重量的蜂巢，就能用同樣的材料換來幾十倍的抗彎能力。這是結構工程裡最漂亮的一次「以形換力」。',
        ds: '你家的門、飛機的地板、火箭的級間段——用的是同一個把戲。',
      },
    });

    const pu = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const p = cylM(0.1, 0.1, 0.9, MAT.grey, 12);
      p.position.set(Math.cos(a) * 1.45, 47.0, Math.sin(a) * 1.45);
      pu.add(p);
    }
    v.sub(c, {
      id: 'push', zh: '氣動分離推桿', en: 'PNEUMATIC PUSHERS', obj: pu, ex: [0, 6, 0], anchor: [1.5, 47.6, 0.6],
      info: {
        mat: '高壓氮氣缸',
        fn: '在鎖扣鬆開的瞬間，用高壓氮氣把第二級「頂」出去。',
        spec: '推開速度約 1 m/s 級',
        why: '分離最怕兩件事：分不開，和分太用力。太輕，兩級會親上；太重，第二級會翻。這幾根推桿把力道算到牛頓級——它們要做的不是「炸開」，而是一次乾淨、對稱、可預測的推手。',
        ds: '慢動作回放裡，兩級之間那道緩緩張開的縫隙——沒有火光、沒有碎片，安靜得不像火箭該有的樣子。這正是可重複使用的代價與美學。',
      },
    });

    const ga = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const act = cylM(0.14, 0.14, 0.7, MAT.dark, 12);
      act.position.set(Math.cos(a) * 1.5, 43.6, Math.sin(a) * 1.5);
      act.rotation.z = Math.PI / 2; act.rotation.y = -a;
      ga.add(act);
    }
    v.sub(c, {
      id: 'gfAct', zh: '柵格翼致動器', en: 'GRID FIN ACTUATORS', obj: ga, ex: [4, -2, 4], anchor: [1.6, 43.6, 0.9],
      info: {
        mat: '液壓旋轉致動器',
        fn: '展開柵格翼，並在下降過程中獨立轉動每一片，修正落點。',
        spec: '4 片可獨立作動',
        why: '從 70 公里高、以 8 倍音速掉下來，要精準落在海上一個 90 公尺寬的甲板上——誤差預算比一個籃球場還小。這四片翼就是火箭在稀薄空氣裡唯一的手指。',
        ds: '獵鷹著陸的最後一分鐘，真正在「開車」的不是引擎，是這四根致動器。',
      },
    });

    const cav = new THREE.Group();
    const cv = M(lat([[1.55, 43.1], [1.4, 44.5], [1.0, 46.2], [0.45, 47.2]], 32), MAT.glass);
    cav.add(cv);
    v.sub(c, {
      id: 'cavity', zh: 'MVac 噴管容置腔', en: 'MVAC NOZZLE CAVITY', obj: cav, ex: [0, 5, 0], anchor: [-1.2, 45.5, 0.8],
      info: {
        mat: '（空腔）',
        fn: '第二級那具 3 公尺長的真空噴管，在分離前就藏在這個腔裡。',
        spec: '噴管長度約 3.1 m',
        why: '真空引擎的噴管必須又大又長才有效率——但這樣的東西在發射台上根本無處安放。於是工程師做了一個決定：把它整個塞進第一級的頭裡。級間段不只是連接件，它是第二級引擎的行李箱。',
        ds: '分離的那一刻，你看到的不只是兩截火箭分開——你看到一具巨大的噴管，從另一枚火箭的體內被抽出來。',
      },
    });
  })();

  /* ══════════ 柵格翼 ══════════ */
  (() => {
    const g = new THREE.Group(); v.refs.gf = [] as THREE.Group[];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const aim = new THREE.Group(); aim.position.y = 43.1; aim.rotation.y = -a; g.add(aim);
      const hinge = new THREE.Group(); hinge.position.set(R, 0, 0); aim.add(hinge);
      const fin = gridFin(2.0, 1.5, MAT.ti); fin.rotation.z = -Math.PI / 2; fin.position.x = 0.55; hinge.add(fin);
      hinge.rotation.z = -1.45;
      v.refs.gf.push(hinge);
    }
    const c = v.comp({
      id: 'gridfin', zh: '柵格翼', en: 'GRID FINS', obj: g, parent: b, ex: [0, 2, 0], anchor: [R + 1.4, 43.5, 0],
      info: {
        mat: '鈦合金整體鑄造',
        fn: '再入與下降時展開，像四隻手掌插進高速氣流，把火箭「抓」回預定的落點。',
        spec: '單片約 4 m² · 可獨立轉動',
        why: '為什麼是格柵不是平板？因為平板在超音速下會失速、會抖、還需要巨大的力矩去轉動。格柵翼由無數小翼面組成，每一格都在自己的小氣流裡工作——阻力大一點，但穩定、可控、而且轉起來省力。',
        ds: '最早的柵格翼是鋁做的，每次再入都會被燒融，飛一次就報廢。改成整體鑄造的鈦之後，同一組翼能反覆用幾十次——這是「可重複使用」從口號變成帳本數字的關鍵一步。',
      },
    });

    const lat2 = new THREE.Group();
    const demo = gridFin(2.0, 1.5, MAT.ti);
    demo.rotation.z = -Math.PI / 2; demo.position.set(2.95, 43.5, 0);
    lat2.add(demo);
    v.sub(c, {
      id: 'lattice', zh: '鈦合金格柵', en: 'TITANIUM LATTICE', obj: lat2, ex: [5, 0, 0], anchor: [3.4, 44.4, 0],
      info: {
        mat: '鈦合金 · 單件鑄造',
        fn: '格柵本體。數十片小翼面組成的網格，在超音速氣流裡提供可控的升力與阻力。',
        spec: '一體成型，無焊縫',
        why: '為什麼要「整體鑄造」而不是焊起來？因為焊縫是熱裂的起點。再入時翼面會被燒到通紅——任何接合處都是災難的入口。所以他們鑄造出全世界最大的一批鈦合金單件之一，只為了讓它沒有縫。',
        ds: '鈦在 1,000 °C 以上依然保有強度，而且燒紅之後——它自己就是隔熱層。這片翼不需要塗任何東西，它靠材料本身活下來。',
      },
    });

    const ga2 = new THREE.Group();
    const ac = cylM(0.17, 0.17, 0.8, MAT.dark, 14); ac.position.set(1.95, 43.1, 0); ac.rotation.z = Math.PI / 2;
    ga2.add(ac);
    v.sub(c, {
      id: 'rot', zh: '旋轉致動器', en: 'ROTARY ACTUATOR', obj: ga2, ex: [0, -3.5, 0], anchor: [1.95, 42.6, 0.5],
      info: {
        mat: '液壓旋轉驅動',
        fn: '轉動單片柵格翼的角度。四片獨立作動，就能同時控制滾轉、俯仰與偏航。',
        spec: '每片獨立閉環控制',
        why: '四片翼、三個自由度——這是一個「超定」的控制問題。飛控電腦必須每秒數十次地解一組方程式，決定每片翼各該轉幾度，才能讓一根 40 公尺的鋁管在音速下乖乖聽話。',
        ds: '這幾根桿子在再入時要頂著上千度的熱氣流工作。它們不是在「調整」火箭，它們是在跟大氣層搏鬥。',
      },
    });

    const hg = new THREE.Group();
    const hb = boxM(0.35, 0.3, 0.3, MAT.grey); hb.position.set(1.83, 43.1, 0); hg.add(hb);
    v.sub(c, {
      id: 'fold', zh: '折收鉸鏈', en: 'FOLDING HINGE', obj: hg, ex: [0, 3.5, 0], anchor: [1.83, 43.1, 0.45],
      info: {
        mat: '高強度鋼鉸鏈',
        fn: '升空時把翼面收貼在箭體上，再入前才張開。',
        spec: '單自由度折收',
        why: '柵格翼在上升段是純粹的累贅——阻力、抖動、氣動加熱，一樣不缺。所以它們得先摺起來躲好，等到真正需要它們的時候（下降）才伸出來。火箭上每一個「會動的東西」，都是一次在「有用」和「有害」之間的精算。',
        ds: '打開「任務時序」動畫，拉到回推翻轉之後——你會看到這四片翼「啪」地張開的那一刻。',
      },
    });
  })();

  /* ══════════ 著陸支腳 ══════════ */
  (() => {
    const g = new THREE.Group(); v.refs.legs = [] as THREE.Group[];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const aim = new THREE.Group(); aim.position.y = 2.1; aim.rotation.y = a; g.add(aim);
      const hinge = new THREE.Group(); hinge.position.set(R * 0.96, 0, 0); aim.add(hinge);
      const leg = boxM(0.5, 9.5, 0.5, MAT.dark); leg.position.y = 4.75; hinge.add(leg);
      const foot = cylM(0.7, 0.5, 0.25, MAT.grey, 10); foot.position.y = 9.5; hinge.add(foot);
      hinge.rotation.z = 0;
      v.refs.legs.push(hinge);
    }
    const c = v.comp({
      id: 'legs', zh: '著陸支腳', en: 'LANDING LEGS', obj: g, parent: b, ex: [0, -3, 0], anchor: [R + 1.2, 6, 0],
      info: {
        mat: '碳纖維 · 鋁蜂巢',
        fn: '四支收在箭體側面的碳纖維腿，在觸地前 20 秒由高壓氦一口氣撐開。',
        spec: '展開跨距約 18 m',
        why: '為什麼不做成飛機那樣的起落架？因為火箭是「站著」降落的，重心極高、落點誤差以公尺計、觸地瞬間速度接近零卻毫無容錯。這四條腿必須又輕、又長、又能吸收衝擊，還得在展開失敗時讓整枚火箭優雅地倒下——而不是爆炸。',
        ds: '早期的著陸失敗有一半是「腿的問題」：卡住、鎖不上、單腿先碰地。可重複使用的最後一哩路，是四根碳纖維管子走完的。',
      },
    });

    const st = new THREE.Group();
    const strut = cylM(0.24, 0.24, 9.4, MAT.carbon, 16); strut.position.set(1.76, 6.85, 0); st.add(strut);
    v.sub(c, {
      id: 'strut', zh: '碳纖維主柱', en: 'CARBON FIBRE STRUT', obj: st, ex: [4, 0, 0], anchor: [1.76, 8.5, 0.35],
      info: {
        mat: '碳纖維纏繞管',
        fn: '支腳的主體。既要撐住 25 噸的箭體，又不能重——它是整根火箭上「比強度」要求最高的結構之一。',
        spec: '單腿長約 9.5 m',
        why: '碳纖維的比強度是鋼的五倍以上。這裡不能用鋁：太重；不能用鋼：更重。當你要把一根 10 公尺長的柱子帶上太空再帶回來，材料表上剩下的選項只有一個。',
        ds: '摸起來像一根黑色的釣竿，卻能接住一枚從太空掉回來的火箭。',
      },
    });

    const hn = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const hx = boxM(0.28, 0.26, 0.03, MAT.alu);
      hx.position.set(1.76, 9.9 + i * 0.06, -0.12 + i * 0.06);
      hx.rotation.x = Math.PI / 2;
      hn.add(hx);
    }
    v.sub(c, {
      id: 'honey', zh: '鋁蜂巢夾層', en: 'HONEYCOMB CORE', obj: hn, ex: [0, 0, 4], anchor: [1.76, 10.2, 0.4],
      info: {
        mat: '鋁蜂巢',
        fn: '夾在碳纖維管壁之間，提供抗壓潰能力並吸收觸地能量。',
        spec: '可壓潰式（crushable）結構',
        why: '蜂巢的妙處在於：它在被壓扁的過程中，會維持一個幾乎恆定的阻力。這代表衝擊能量被「均勻地」吃掉，而不是在某一瞬間爆出一個尖峰——那個尖峰就是斷裂。',
        ds: '它是設計來被破壞的。著陸時它被壓扁，就代表它成功了。整枚火箭上，只有它的成功是以「自己壞掉」來定義的。',
      },
    });

    const dp = new THREE.Group();
    dp.add(tube([[1.0, 3.0, 0], [1.4, 4.2, 0], [1.72, 5.6, 0]], 0.11, MAT.grey, 16));
    v.sub(c, {
      id: 'deploy', zh: '高壓氦展開缸', en: 'HELIUM DEPLOY CYLINDER', obj: dp, ex: [-4, 0, 0], anchor: [1.2, 4.2, 0.4],
      info: {
        mat: '高壓氦氣缸',
        fn: '著陸前把支腳從貼身收攏一口氣撐到展開鎖死。',
        spec: '展開耗時僅數秒',
        why: '為什麼用氦氣而不是液壓或彈簧？因為它只需要用一次，而且必須「絕對展得開」。氦氣是這枚火箭上本來就有的東西（貯箱增壓用），不需要多帶一套系統——最好的零件，是你本來就有的那個。',
        ds: '這是全火箭最像「單向門」的機構：一旦推開，就沒有回頭路。展不開，就等於著陸失敗。',
      },
    });

    const cr = new THREE.Group();
    const cru = cylM(0.32, 0.32, 0.7, MAT.soot, 14); cru.position.set(1.76, 11.4, 0); cr.add(cru);
    v.sub(c, {
      id: 'crush', zh: '壓潰式緩衝器', en: 'CRUSH CORE', obj: cr, ex: [0, -4, 0], anchor: [1.76, 11.4, 0.45],
      info: {
        mat: '可壓潰鋁蜂巢筒',
        fn: '觸地瞬間被壓扁，把撞擊能量吃掉。四條腿各一個，落地不平時各壓各的。',
        spec: '一次性 · 落地後更換',
        why: '火箭著陸不像飛機——沒有跑道、沒有滑行、沒有第二次機會。它以幾乎為零的速度砸在甲板上，殘餘的動能必須在半秒內消失。彈簧會把它彈回去；油壓會太慢；只有「壓扁一塊金屬」剛剛好。',
        ds: '每一枚回收的第一級，四條腿裡都躺著四個被壓扁的蜂巢筒。那是它平安到家的收據。',
      },
    });
  })();

  /* ══════════ 第二級箭體（使用者點名的那一個） ══════════ */
  (() => {
    const g = new THREE.Group();
    const skin = cylM(R, R, 12, MAT.white, 48, true); skin.position.y = 53.4; g.add(skin);
    const c = v.comp({
      id: 's2', zh: '第二級箭體', en: 'STAGE 2 AIRFRAME', obj: g, parent: up, ex: [0, 7, 0], anchor: [R, 55, 0],
      info: {
        mat: '鋁鋰合金 2195',
        fn: '一台在真空中工作的完整火箭：自備推進劑、電力、姿態控制、導航與一具引擎。它的工作，是把酬載從一條會掉回地面的拋物線，加速到 7.8 km/s 的環繞速度。',
        spec: '直徑 3.7 m · 長約 12.6 m · 可多次點火',
        why: '為什麼第二級用完就丟？不是做不到，是不值得。它入軌時的速度是第一級的三倍，回收所需的防熱與燃料會吃掉大半酬載。SpaceX 算過這筆帳：回收佔造價七成的第一級划算，回收第二級不划算。這是工程裡最誠實的一種取捨——承認某件事不該做。',
        ds: '把它拆開。你會發現一件反直覺的事：這個「殼」幾乎就是整枚火箭本身。貯箱、結構、承力件是同一張鋁皮——它不是裝著油箱的火箭，它就是油箱。',
      },
    });

    const th = new THREE.Group();
    th.add(M(lat([[0.5, 47.6], [0.95, 48.2], [1.4, 48.9], [1.78, 49.6]], 40), MAT.grey));
    v.sub(c, {
      id: 'thrust', zh: '推力結構', en: 'THRUST STRUCTURE', obj: th, ex: [0, -5, 0], anchor: [1.3, 48.9, 0.7],
      info: {
        mat: '鋁合金錐形桁架',
        fn: '把 MVac 那 981 kN（約 100 噸力）的推力，從一個直徑不到一公尺的圓，擴散進整圈 3.7 公尺的箭體壁。',
        spec: '承受約 100 噸力',
        why: '引擎的推力集中在一個點上，箭體卻是一個大圓——中間必須有一個「力的翻譯器」。這個錐形桁架就是。它不燒、不轉、不發光，但所有的力都得從它身上過。',
        ds: '真空中，這 100 噸力推的是一個幾乎沒有重量的空殼——加速度會一路飆到 4 個 g。第二級最後的幾十秒，是整趟旅程裡最粗暴的一段。',
      },
    });

    const rp = new THREE.Group();
    const rt = cylM(R * 0.94, R * 0.94, 4.4, MAT.fuelV, 40, true); rt.position.y = 51.9; rp.add(rt);
    v.sub(c, {
      id: 'rp1', zh: 'RP-1 燃料槽', en: 'RP-1 TANK', obj: rp, ex: [-6, 0, 0], anchor: [-R * 0.65, 51.5, 0],
      info: {
        mat: '精煉煤油 RP-1',
        fn: '約 32 噸燃料，位於第二級下半，緊貼引擎。',
        spec: '常溫可儲存',
        why: '為什麼第二級不用液氫？液氫的比衝高得多，但密度只有煤油的十四分之一——槽體會膨脹到荒謬的尺寸，還得背一整套超低溫保溫系統。SpaceX 選了「一種引擎、一種燃料、兩級通用」：量產的簡潔，勝過紙面上的效率。',
        ds: '這是整個獵鷹哲學的縮影——不追求每一項指標最優，只追求整體最便宜、最快、最能重複做。',
      },
    });

    const bk = new THREE.Group();
    const d1 = dome(R * 0.94, 0.8, MAT.alu); d1.position.y = 54.1; bk.add(d1);
    const d2 = dome(R * 0.94, 0.8, MAT.alu); d2.rotation.x = Math.PI; d2.position.y = 54.0; bk.add(d2);
    v.sub(c, {
      id: 'bulk', zh: '共底隔框', en: 'COMMON BULKHEAD', obj: bk, ex: [-3, 2.5, 0], anchor: [-0.9, 54.7, 0.9],
      info: {
        mat: '鋁鋰合金雙層隔框',
        fn: '一道隔框，把上方的液氧槽與下方的煤油槽背靠背分開。',
        spec: '兩面溫差超過 180 °C',
        why: '每省下一公尺箭體，就省下數百公斤結構質量。而在入軌級，1 公斤結構幾乎就等於 1 公斤少掉的酬載——那可能是一顆衛星的差別。共底隔框是火箭設計裡「一石二鳥」的經典手法：一片板子，取代兩個端蓋和一整段空筒。',
        ds: '它的一面是 -183 °C 的液氧，另一面是常溫煤油。這片薄鋁的兩側，住著兩個溫差 180 度的世界。',
      },
    });

    const lx = new THREE.Group();
    const lt = cylM(R * 0.94, R * 0.94, 4.4, MAT.loxV, 40, true); lt.position.y = 56.5; lx.add(lt);
    v.sub(c, {
      id: 'lox', zh: '液氧槽', en: 'LOX TANK', obj: lx, ex: [6, 0, 0], anchor: [R * 0.65, 57, 0],
      info: {
        mat: '液態氧 · 約 -183 °C',
        fn: '約 75 噸氧化劑。靠「自生增壓」維持箱壓——把一小股液氧汽化後灌回槽頂，用它自己撐住自己。',
        spec: '箱壓數 bar 級',
        why: '為什麼液氧在上、燃料在下？因為密度大的液氧放遠一點，能把重心往前拉，讓箭體在飛行中像箭羽一樣自然穩定；同時燃料離引擎更近，管路更短、更輕。這個排列不是隨便選的，是氣動穩定與結構重量一起算出來的。',
        ds: '「用自己汽化的氣體撐住自己」——火箭裡到處都是這種自給自足的閉環。它離地球越遠，就越不能依賴任何外部的東西。',
      },
    });

    const bf = new THREE.Group();
    [50.5, 52.7, 55.3, 57.6].forEach((y) => { const r = torM(R * 0.88, 0.05, MAT.alu); r.position.y = y; bf.add(r); });
    v.sub(c, {
      id: 'baffle', zh: '防晃隔板', en: 'SLOSH BAFFLES', obj: bf, ex: [0, 0, 6], anchor: [-1.35, 56, 0],
      info: {
        mat: '薄鋁環板',
        fn: '槽內的環形擋板，打斷推進劑晃動。在真空中的長時間滑行段尤其關鍵。',
        spec: '多層佈置於槽壁',
        why: '入軌後火箭常要「滑行」半小時再點第二次火。這段時間裡處於失重狀態，幾十噸液體會在槽裡飄成一團——一旦晃動的頻率撞上姿態控制的頻率，就會共振：輕則燒光修正燃料，重則整級翻滾失控。',
        ds: '這幾片薄鋁環從不出現在任何一段精彩畫面裡。它們的成功，就是「什麼事都沒發生」。',
      },
    });

    const cv = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const t = cylM(0.26, 0.26, 2.2, MAT.carbon, 14);
      t.position.set(i === 0 ? 1.05 : -1.05, 56.5, 0.3);
      cv.add(t);
    }
    v.sub(c, {
      id: 'copv', zh: '氦氣增壓瓶', en: 'HELIUM COPV', obj: cv, ex: [5, 3, 0], anchor: [1.1, 57.7, 0.4],
      info: {
        mat: '碳纖維纏繞 · 鋁內襯',
        fn: '浸在液氧中的高壓氦瓶，供應閥門作動與備援增壓。',
        spec: '低溫下儲氣密度更高',
        why: '為什麼泡在液氧裡？因為冷。同樣的瓶子，低溫下能塞進更多氦——用溫度換體積，是火箭上最常見的免費午餐。',
        ds: '航太史上最著名的敏感件之一：低溫、超高壓、碳纖維纏繞層的耦合行為極難預測。SpaceX 為它重寫過整套加注流程。',
      },
    });

    const av = new THREE.Group();
    const abx = boxM(0.85, 0.75, 0.5, MAT.dark); abx.position.set(1.2, 58.2, 0.9); av.add(abx);
    const apl = boxM(0.5, 0.32, 0.06, MAT.gold); apl.position.set(1.2, 58.2, 1.18); av.add(apl);
    v.sub(c, {
      id: 'av', zh: '航電艙與電池', en: 'AVIONICS & BATTERIES', obj: av, ex: [0, 4, 4], anchor: [1.5, 58.6, 1.2],
      info: {
        mat: '三重冗餘飛控電腦',
        fn: '在第一級分離之後，這個盒子接管一切：導航、姿態、節流、關機時機、酬載釋放。',
        spec: '三機並算 · 多數決',
        why: '入軌的精度要求近乎變態：速度誤差幾公尺／秒，就會讓衛星的軌道差上幾十公里。而這台電腦要在震動、輻射與極端溫度中，連續正確運算八分鐘——沒有重開機的機會。',
        ds: '這是整枚火箭裡唯一「會思考」的部分。它決定了什麼時候關掉那 100 噸力——早了，衛星掉回大氣層；晚了，它飛向不該去的地方。',
      },
    });

    const cg = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const n = M(new THREE.ConeGeometry(0.1, 0.22, 12), MAT.grey);
      n.position.set(Math.cos(a) * R, 58.7, Math.sin(a) * R);
      n.lookAt(Math.cos(a) * 4, 58.7, Math.sin(a) * 4);
      cg.add(n);
    }
    v.sub(c, {
      id: 'cg', zh: '冷氣氮氣推進器', en: 'COLD-GAS THRUSTERS', obj: cg, ex: [4, 3, 4], anchor: [R + 0.5, 58.7, 0],
      info: {
        mat: '高壓氮氣噴嘴',
        fn: '在真空中做姿態控制；並且在引擎再次點火之前，先「把推進劑沉回槽底」。',
        spec: '純冷氣 · 不燃燒',
        why: '這是太空中最詭異的問題之一：失重狀態下，槽裡的液體會飄成一顆自由的球，離開出油口。引擎一點火，吸進去的是氣不是液——瞬間爆炸。所以在每一次重新點火之前，這幾股氮氣要先輕輕推火箭一下，讓液體因為「假重力」乖乖沉回槽底。這個動作叫 ullage burn。',
        ds: '整趟任務中最不起眼、卻攸關生死的一次操作：在點火之前，先把油「搖」回杯底。',
      },
    });

    const pa = new THREE.Group();
    pa.add(M(lat([[R, 59.4], [1.72, 59.9], [1.4, 60.5], [1.25, 61.0]], 40), MAT.carbon));
    v.sub(c, {
      id: 'paf', zh: '酬載適配器', en: 'PAYLOAD ADAPTER', obj: pa, ex: [0, 5, 0], anchor: [1.3, 60.7, 0.5],
      info: {
        mat: '碳纖維錐段 · 分離夾環',
        fn: '衛星與火箭之間唯一的接觸面。入軌後，夾環鬆開、彈簧推出——酬載自由。',
        spec: '低衝擊分離機構',
        why: '分離必須「輕輕地」：太用力，會把價值數億美元的衛星推得翻滾；太輕，兩者會分不開、甚至再撞回來。彈簧的力道要算到牛頓級，還得四周對稱——這是整趟旅程的最後一個工程動作，也是最不能出錯的一個。',
        ds: '火箭與酬載此生唯一的一次握手，也是最後一次。放開之後，它們永遠不會再相遇。',
      },
    });
  })();

  /* ══════════ 真空 Merlin ══════════ */
  (() => {
    const g = new THREE.Group();
    const b2 = M(lat(shift(bellPts(0.28, 1.3, 3.1, 24, 0.82), 47.4), 40), MAT.nio); g.add(b2);
    const head = cylM(0.25, 0.25, 0.6, MAT.grey, 16); head.position.y = 47.7; g.add(head);
    v.comp({
      id: 'mvac', zh: '真空 Merlin', en: 'MERLIN VACUUM', obj: g, parent: up, ex: [0, -5, 0], anchor: [0.9, 45.5, 0],
      info: {
        mat: '鈮合金輻射冷卻噴管',
        fn: '第二級唯一的引擎。和第一級的 Merlin 是同一顆心臟，只是換上一條長達 3 公尺的巨大裙襬。',
        spec: '真空推力 981 kN · 比衝約 348 s',
        why: '為什麼真空版的噴管這麼大？因為噴管的工作是「把燃氣的熱能轉成速度」，而外界壓力越低，能榨出的膨脹比就越大。在海平面這麼長的噴管會被大氣壓「壓垮」（流動分離）；但在真空裡，它多出來的每一公分都在換取比衝。同一顆引擎，兩種裙襬——這是火箭設計裡最優雅的一次「因地制宜」。',
        ds: '看飛行直播時，MVac 的噴管末段會被燒成暗橘色。那不是故障——鈮合金就是靠「燒紅自己、向太空輻射散熱」來活下來的。沒有冷卻劑，沒有管路，只有一塊敢發光的金屬。',
      },
    });
  })();

  /* ══════════ 整流罩（兩瓣，沿 Z 軸對開） ══════════ */
  (() => {
    const fpts: [number, number][] = [[R, 59.5], [2.35, 60.6], [2.6, 61.6], [2.6, 67], [2.25, 69.6], [1.35, 71.6], [0.08, 72.6]];
    v.refs.fair = [] as THREE.Group[];
    const halves = [
      { ps: -Math.PI / 2, s: 1, zh: '（＋Z 半）', en: 'A' },
      { ps: Math.PI / 2, s: -1, zh: '（－Z 半）', en: 'B' },
    ];
    halves.forEach((h, idx) => {
      const half = M(lat(fpts, 32, h.ps, Math.PI), MAT.white);
      const piv = new THREE.Group(); piv.position.y = 59.5;
      const inner = new THREE.Group(); inner.position.y = -59.5; inner.add(half); piv.add(inner);
      (piv.userData as any).s = h.s;
      v.refs.fair.push(piv);
      const c = v.comp({
        id: 'fair' + idx, zh: '整流罩' + h.zh, en: 'FAIRING ' + h.en, obj: piv, parent: up,
        ex: [0, 4, 0], anchor: [0, 6.5, h.s * 2.5], innerOffset: [0, -59.5, 0],
        info: {
          mat: '碳纖維／鋁蜂巢夾層',
          fn: '保護酬載穿越大氣層最暴力的 3 分鐘。出了大氣層就沒有用了——於是它對半裂開，被拋掉。',
          spec: '全長約 13 m · 直徑 5.2 m',
          why: '一對整流罩造價數百萬美元，而它的工作只有 3 分鐘。SpaceX 於是做了一件在航太界近乎瘋狂的事：讓它自己飛回來。兩瓣各自裝上冷氣推進器與翼傘，滑翔數十公里、精準落進海裡（或被船上的網子接住）。3 分鐘的工作，換一輩子的重複使用。',
          ds: '拆開它，你會看到裡面貼滿了隔音毯——因為升空時罩內的噪音高達 140 分貝，足以把一顆衛星活活震壞。',
        },
      });

      if (idx !== 0) return; // 內部細節只做一瓣，避免重複

      const sk = new THREE.Group();
      const innerShell = M(lat(fpts.map((p) => [p[0] * 0.93, p[1]] as [number, number]), 32, h.ps + 0.06, Math.PI - 0.12), MAT.alu);
      sk.add(innerShell);
      v.sub(c, {
        id: 'core', zh: '鋁蜂巢芯', en: 'HONEYCOMB CORE', obj: sk, ex: [0, 0, 4], anchor: [1.0, 65, 2.1],
        info: {
          mat: '鋁蜂巢 · 碳纖維面板',
          fn: '兩層碳纖維面板夾一層蜂巢。輕到可以一個人抬起一大塊，硬到能撐住 8 倍音速的氣動壓力。',
          spec: '壁厚僅數公分',
          why: '彎曲剛度和厚度的三次方成正比——把兩張薄板隔開，中間塞進幾乎沒重量的蜂巢，就能用同樣的材料換來幾十倍的抗彎能力。這是結構工程裡最漂亮的一次「以形換力」。',
          ds: '你正看著一種材料的極限：它必須同時是氣動外殼、隔音牆、承力結構——而且要輕到可以被丟掉。',
        },
      });

      const ac = new THREE.Group();
      const blanket = M(lat(fpts.map((p) => [p[0] * 0.86, p[1]] as [number, number]), 24, h.ps + 0.1, Math.PI - 0.2), MAT.felt);
      ac.add(blanket);
      v.sub(c, {
        id: 'acou', zh: '聲學隔音毯', en: 'ACOUSTIC BLANKETS', obj: ac, ex: [0, 0, 6], anchor: [0.6, 62.5, 1.9],
        info: {
          mat: '多層吸音纖維毯',
          fn: '吸收升空瞬間反彈回來的聲波，保護裡面的酬載。',
          spec: '罩內噪音可達 140 dB 以上',
          why: '火箭升空時，噴焰打在發射台上反彈回來的聲音，強度足以把電路板震到脫焊、把太陽能板震裂。這不是「吵」的問題——聲音在這個等級就是一種結構載荷。所以工程師在昂貴的衛星和 7,607 kN 的咆哮之間，鋪了幾層毯子。',
          ds: '發射台底下的大水池不是為了降溫——是為了消音。他們用幾十萬公升的水，把自己的火箭從自己的聲音裡救出來。',
        },
      });

      const sp = new THREE.Group();
      [61.5, 65, 68.5].forEach((y) => {
        const cyl = cylM(0.11, 0.11, 0.7, MAT.grey, 12);
        cyl.position.set(2.25, y, 0.15); cyl.rotation.z = Math.PI / 2;
        sp.add(cyl);
      });
      v.sub(c, {
        id: 'sep', zh: '分離氣動缸', en: 'PNEUMATIC SEPARATION', obj: sp, ex: [4, 0, 0], anchor: [2.5, 65, 0.4],
        info: {
          mat: '氣壓推桿 · 機械鎖',
          fn: '沿著兩瓣的接縫排列。解鎖後把兩瓣往外推開，讓它們像蚌殼一樣張開、脫離。',
          spec: '無火工品，可反覆測試',
          why: '傳統整流罩用爆炸索切開——一次性、不可測試、而且碎片可能打壞衛星。改成氣壓推開之後，工程師可以在地面把同一組整流罩開開合合幾百次，直到完全確定它會乖乖打開。「可以重複測試」本身，就是一種可靠度。',
          ds: '拋罩的那一刻，直播畫面上會突然亮起來——因為擋在鏡頭前的殼，飛走了。那是每次發射我最喜歡的一秒。',
        },
      });

      const cgf = new THREE.Group();
      [[1.4, 70.6, 1.4], [0.5, 70.9, 1.9]].forEach((p) => {
        const n = M(new THREE.ConeGeometry(0.1, 0.22, 12), MAT.grey);
        n.position.set(p[0], p[1], p[2]);
        n.lookAt(p[0] * 3, p[1], p[2] * 3);
        cgf.add(n);
      });
      v.sub(c, {
        id: 'cgf', zh: '姿態控制推進器', en: 'ATTITUDE THRUSTERS', obj: cgf, ex: [3, 4, 3], anchor: [1.4, 71.2, 1.5],
        info: {
          mat: '冷氣氮氣噴嘴',
          fn: '拋離之後，這一瓣還要在太空中「開車」——調整姿態，讓它以隔熱面朝前的角度重新進入大氣層。',
          spec: '再入前的姿態控制',
          why: '一片被丟掉的殼，為什麼還需要姿態控制？因為 SpaceX 要它活著回來。以錯誤的角度再入，它會燒毀或解體；以正確的角度，它能像一片樹葉一樣被大氣接住。這幾個噴嘴，是「垃圾」與「資產」之間的分界線。',
          ds: '這是整枚火箭上最叛逆的一個設計：連丟掉的部分，都不准真的丟掉。',
        },
      });

      const pc = new THREE.Group();
      const pack = boxM(0.7, 0.5, 0.5, MAT.dark); pack.position.set(1.0, 62, 1.7); pc.add(pack);
      v.sub(c, {
        id: 'chute', zh: '翼傘艙', en: 'PARAFOIL BAY', obj: pc, ex: [0, -4, 5], anchor: [1.0, 62.5, 2.0],
        info: {
          mat: '導引式翼傘',
          fn: '再入減速後張開的可操控翼傘。它會自己滑翔數十公里，飛向海上等待的回收船。',
          spec: 'GPS 導引 · 可控落點',
          why: '為什麼不用普通降落傘？因為普通傘只能「掉」，落點誤差以公里計，而海上的回收船只有幾十公尺寬。翼傘可以「飛」——它把一次自由落體，變成一次有目的地的滑翔。',
          ds: '早期他們真的用一艘裝著大網子的船去「接」它。後來發現，讓它輕輕落在海面上再撈起來就好。工程的浪漫，有時候會輸給工程的務實——但兩者都很美。',
        },
      });
    });
  })();

  v.refs.pl1 = makePlume(1.7, 15, 'k'); v.refs.pl1.position.y = 0.25; b.add(v.refs.pl1); v.plumes.push(v.refs.pl1);
  v.refs.pl2 = makePlume(1.35, 9, 'k'); v.refs.pl2.position.y = 44.4; up.add(v.refs.pl2); v.plumes.push(v.refs.pl2);

  v.ap('plume1', 0, (x) => v.refs.pl1.userData.set(x));
  v.ap('plume2', 0, (x) => v.refs.pl2.userData.set(x));
  v.ap('sep', 0, (x) => { up.position.y = x; });
  v.ap('flip', 0, (x) => { bPiv.rotation.z = x * Math.PI; });
  v.ap('gf', 0, (x) => { const r = lerp(-1.45, -0.06, x); v.refs.gf.forEach((h: THREE.Group) => (h.rotation.z = r)); });
  v.ap('legs', 0, (x) => { const r = lerp(0, -2.25, x); v.refs.legs.forEach((h: THREE.Group) => (h.rotation.z = r)); });
  v.ap('fair', 0, (x) => {
    v.refs.fair.forEach((p: THREE.Group) => {
      const s = (p.userData as any).s;
      p.rotation.x = -s * x * 1.05;
      p.position.z = s * x * 2.4;
    });
  });
}
