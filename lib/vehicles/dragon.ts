import * as THREE from 'three';
import type { VehicleLike } from '../types';
import { MAT } from '../materials';
import { makePlume } from '../plume';
import { lat, M, cylM, boxM, torM, dome } from '../geometry';

// 天龍號 2。全高 8.1 m。cap group 位於 y = 3.7（艙段座標系）。
export function buildDragon(v: VehicleLike) {
  v.rad = 2.6;
  const cap = v.grp('cap'); cap.position.y = 3.7;

  /* ══════════ 貨艙段 ══════════ */
  (() => {
    const g = new THREE.Group();
    const s2 = M(new THREE.CylinderGeometry(1.9, 1.9, 3.5, 32, 1, true, 0, Math.PI), MAT.solar); s2.position.y = 1.75; g.add(s2);
    const w2 = M(new THREE.CylinderGeometry(1.9, 1.9, 3.5, 32, 1, true, Math.PI, Math.PI), MAT.white); w2.position.y = 1.75; g.add(w2);
    const c = v.comp({
      id: 'trunk', zh: '貨艙段', en: 'TRUNK', obj: g, parent: v.root, ex: [0, -5, 0], anchor: [1.9, 1.75, 0],
      info: {
        mat: '複合材料殼體',
        fn: '飛船的下半截。它不加壓、不載人、也不回家——再入前就被拋掉，在大氣層裡燒成一道流星。但在那之前，它供電、散熱、載貨、還負責讓整艘船在上升段飛得穩。',
        spec: '再入前拋棄 · 不回收',
        why: '為什麼要有一個「注定被丟掉」的艙段？因為太陽能板和散熱器又大又脆弱，帶著它們穿過再入的等離子體毫無意義。與其設計一套能收起來、能耐熱、能重複使用的複雜機構，不如接受：這部分就是消耗品。有時候最好的工程決定，是承認某個東西不值得救。',
        ds: '每一次龍飛船回家，都會先「脫掉」自己的下半身。那道燒毀的軌跡，是它替組員擋下的最後一件事。',
      },
    });

    const sol = new THREE.Group();
    const panel = M(new THREE.CylinderGeometry(1.93, 1.93, 3.2, 32, 1, true, 0.1, Math.PI - 0.2), MAT.solar);
    panel.position.y = 1.75; sol.add(panel);
    v.sub(c, {
      id: 'solar', zh: '體貼式太陽能陣', en: 'BODY-MOUNTED SOLAR', obj: sol, ex: [4, 0, 3], anchor: [1.4, 2.6, 1.4],
      info: {
        mat: '砷化鎵太陽能電池',
        fn: '直接貼在弧形殼體上的太陽能板。不展開、不轉動、不追日——就這樣貼著。',
        spec: '供應全船電力與電池充電',
        why: '早期的龍飛船有一對會展開的太陽能翼。SpaceX 在龍 2 上把它們刪掉了，直接貼在殼上。代價是發電效率較低（永遠有一半照不到太陽）；換來的是：沒有展開機構、沒有鉸鏈、沒有「展不開就任務失敗」的單點故障。他們用「多貼一點面積」，換掉了一整類可能致命的故障。',
        ds: '這是 SpaceX 的簽名動作：能刪掉的機構就刪掉。零件不存在，就不會壞。',
      },
    });

    const rad = new THREE.Group();
    const r1 = M(new THREE.CylinderGeometry(1.93, 1.93, 3.2, 32, 1, true, Math.PI + 0.1, Math.PI - 0.2), MAT.white);
    r1.position.y = 1.75; rad.add(r1);
    v.sub(c, {
      id: 'rad', zh: '散熱器', en: 'RADIATORS', obj: rad, ex: [-4, 0, -3], anchor: [-1.4, 2.6, -1.4],
      info: {
        mat: '白色高輻射率塗層板',
        fn: '太陽能板的背面。它的工作正好相反——不是吸熱，是把船內的廢熱丟進太空。',
        spec: '被動輻射散熱',
        why: '太空是真空——沒有空氣可以吹、沒有水可以冷卻。散熱的唯一方式是「輻射」：把熱變成紅外線扔出去。所以這一面必須永遠背對太陽、永遠面向宇宙的黑暗。整艘船的姿態，有一部分就是為了讓這片白板一直看著虛空。',
        ds: '一面吸太陽，一面看黑暗。這艘船的兩側，同時活在兩種宇宙裡。',
      },
    });

    const rk = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const bx = boxM(2.2, 0.12, 1.6, MAT.dark);
      bx.position.set(0, 0.7 + i * 1.0, 0);
      rk.add(bx);
    }
    v.sub(c, {
      id: 'rack', zh: '非增壓貨架', en: 'UNPRESSURIZED CARGO', obj: rk, ex: [0, -6, 0], anchor: [0.9, 1.8, 0.9],
      info: {
        mat: '鋁合金貨架',
        fn: '裝載不怕真空的貨物——外部實驗設備、備用太陽能板、太空站的替換零件。',
        spec: '直接暴露於真空',
        why: '有些東西根本不需要加壓艙的保護：一塊要裝在太空站外壁的實驗板、一組散熱模組。把它們放在這裡，就省下了寶貴的加壓容積——那可是要用「每公斤幾萬美元」計價的空間。',
        ds: '太空站外面那些看起來像積木的實驗裝置，大多是坐這一層上去的。',
      },
    });

    const fin = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const f = boxM(0.1, 3.3, 0.7, MAT.white);
      f.position.set(Math.cos(a) * 1.95, 1.75, Math.sin(a) * 1.95);
      f.lookAt(0, 1.75, 0);
      fin.add(f);
    }
    v.sub(c, {
      id: 'fin', zh: '氣動穩定鰭', en: 'AERO STABILISERS', obj: fin, ex: [0, 0, 5], anchor: [2.2, 3.0, 0],
      info: {
        mat: '複合材料鰭片',
        fn: '四片小翼。它們的用途只有一個：在「逃逸」的時候救命。',
        spec: '被動穩定 · 無作動機構',
        why: '如果火箭在上升段爆炸，飛船必須靠 SuperDraco 猛地衝出去——但那時它會以極高的速度穿越稠密的大氣。一個又鈍又重的膠囊在超音速下會翻滾。這四片鰭把重心與壓力中心的關係扳正，讓它像飛鏢一樣自己穩住。就像羽毛之於箭。',
        ds: '正常任務中，它們什麼都不做。它們存在的意義，是為了那一次可能永遠不會發生的災難。',
      },
    });
  })();

  /* ══════════ 防熱盾 ══════════ */
  (() => {
    const g = new THREE.Group();
    const sh = dome(2.02, 0.5, MAT.pica); sh.rotation.x = Math.PI; sh.position.y = 0.02; g.add(sh);
    const c = v.comp({
      id: 'shield', zh: '防熱盾', en: 'HEAT SHIELD', obj: g, parent: cap, ex: [0, -2.5, 0], anchor: [2.0, -0.15, 0],
      info: {
        mat: 'PICA-X 燒蝕材料',
        fn: '再入時朝前的那一面。它不「抵抗」高溫——它主動犧牲自己：受熱碳化、逐層汽化，把熱量隨著自己的碎屑一起帶走。',
        spec: '耐受再入駐點高溫 · 可重複使用數次',
        why: '兩種防熱哲學：陶瓷瓦「隔絕」熱量（星艦），燒蝕材「消耗」自己（龍飛船）。燒蝕更重、且會被吃掉，但它的極限高得多——即使從月球以 11 km/s 回來也擋得住。載人任務不賭運氣：他們選了那個「一定不會失敗」的，即使它比較笨重。',
        ds: 'PICA 原本是 NASA 開發的，貴到只能做小塊。SpaceX 改良成 PICA-X，成本降到約十分之一——然後把它做成了一整面盾。',
      },
    });

    const br = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rr = i === 0 ? 0 : 1.25;
      const t = M(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 6), MAT.pica);
      t.position.set(Math.cos(a) * rr, -0.55, Math.sin(a) * rr);
      br.add(t);
    }
    v.sub(c, {
      id: 'brick', zh: 'PICA-X 燒蝕磚', en: 'PICA-X TILES', obj: br, ex: [0, -3, 0], anchor: [1.3, -0.6, 0.6],
      info: {
        mat: '酚醛浸漬碳燒蝕體',
        fn: '一塊塊拼起來的燒蝕磚。它的內部 90% 是空隙，像一塊被酚醛樹脂浸透的碳纖維海綿。',
        spec: '單片可承受數千度駐點溫度',
        why: '高溫來襲時，酚醛樹脂會分解、汽化，從表面往外噴出一層氣體——這層氣體把最熾熱的邊界層「吹離」表面。這叫「發汗冷卻」。它不是在硬扛熱，它是在用自己的血汗，把火焰推開。',
        ds: '每一塊落海回收的龍飛船防熱盾，表面都是焦黑、龜裂、缺角的。那不是損壞——那是它燒掉的部分，替裡面四個人換來的命。',
      },
    });

    const bp = new THREE.Group();
    const plate = M(new THREE.CircleGeometry(1.95, 40), MAT.alu);
    plate.rotation.x = Math.PI / 2; plate.position.y = -0.08; bp.add(plate);
    v.sub(c, {
      id: 'back', zh: '背板結構', en: 'BACKPLATE', obj: bp, ex: [0, -1.2, 0], anchor: [-1.5, -0.1, 0.7],
      info: {
        mat: '鋁合金承力板',
        fn: '燒蝕磚後面的那塊板。它承接整個減速過程中的氣動力——高達 4 個 g 的減速度，全壓在這裡。',
        spec: '同時是艙體底部結構',
        why: '防熱盾不只要「不被燒穿」，還要「不被壓垮」。再入時它同時承受高溫與高壓——這是兩種完全衝突的需求：耐熱的材料通常很脆，耐壓的材料通常怕熱。答案是分層：脆的在外面被燒掉，強的在裡面撐著。',
        ds: '好的工程往往長這樣——不是找一種全能的材料，而是讓兩種各有弱點的材料，互相掩護。',
      },
    });

    const sl = new THREE.Group();
    const ring = torM(2.0, 0.06, MAT.felt); ring.position.y = 0.1; sl.add(ring);
    v.sub(c, {
      id: 'seal', zh: '盾緣密封', en: 'EDGE SEAL', obj: sl, ex: [0, -1.5, 2.5], anchor: [2.05, 0.1, 0.4],
      info: {
        mat: '陶瓷纖維密封條',
        fn: '防熱盾與艙壁之間的接縫。整艘船最脆弱的一條線。',
        spec: '阻擋等離子體侵入',
        why: '再入時，飛船被一層 1,500 °C 以上的等離子體包住。它會找任何一條縫鑽進來——而防熱盾的邊緣就是最大的那條。哥倫比亞號太空梭的悲劇，正是起因於防熱層的一個缺口。所有航太工程師都記得那件事，所以他們把最多的偏執，留給了這一圈。',
        ds: '一整艘船、四條人命，有時候取決於一圈幾公分寬的密封條做得夠不夠好。',
      },
    });
  })();

  /* ══════════ 加壓艙 ══════════ */
  (() => {
    const g = new THREE.Group();
    const body = M(lat([[2.0, 0.12], [2.02, 0.5], [1.85, 1.6], [1.5, 2.8], [1.18, 3.6], [1.1, 3.9]], 48), MAT.white); g.add(body);
    const win = M(new THREE.SphereGeometry(0.22, 16, 12), MAT.glass); win.position.set(1.35, 2.4, 0); win.scale.z = 0.4; g.add(win);
    const c = v.comp({
      id: 'capsule', zh: '加壓艙', en: 'PRESSURE CAPSULE', obj: g, parent: cap, ex: [0, 2.5, 0], anchor: [1.75, 2.6, 0],
      info: {
        mat: '鋁合金壓力殼 · 外部隔熱',
        fn: '四個人在真空中活下去的全部憑藉。一個 9.3 立方公尺的鋁泡泡，裡面有一個大氣壓、20 °C 的空氣、和一趟去往太空站的旅程。',
        spec: '加壓容積約 9.3 m³ · 最多 4 人（設計可達 7 人）',
        why: '這是整個 SpaceX 產品線裡，唯一一個「不能失敗」的東西。火箭炸了可以再造，衛星丟了可以再射——但這個鋁殼裡有人。所有的冗餘、所有的偏執、所有那些看起來過度的設計，都是因為裡面坐著四個會呼吸的人。',
        ds: '把它拆開。你會發現裡面幾乎沒有按鈕——只有三塊觸控螢幕。這艘船重新定義了「太空船的樣子」。',
      },
    });

    const pv = new THREE.Group();
    pv.add(M(lat([[1.86, 0.35], [1.88, 0.6], [1.72, 1.65], [1.4, 2.75], [1.1, 3.45], [1.02, 3.75]], 40), MAT.alu));
    v.sub(c, {
      id: 'shell', zh: '壓力殼', en: 'PRESSURE VESSEL', obj: pv, ex: [3, 0, 3], anchor: [-1.6, 2.2, 0.7],
      info: {
        mat: '鋁合金焊接殼體',
        fn: '真正把空氣關在裡面的那一層。外面所有的隔熱、外殼、塗裝都只是衣服——這一層才是皮膚。',
        spec: '承受 1 大氣壓的內外壓差',
        why: '在地面，1 個大氣壓不算什麼；在真空裡，它是每平方公尺 10 噸的力，永遠向外推。這個殼被設計成從內部「撐開」時最強——就像一顆氣球。它的形狀不是為了好看，是壓力自己選出來的。',
        ds: '你此刻正被 1 個大氣壓包圍著，卻毫無感覺。太空人只隔著這一層鋁——而外面，什麼都沒有。',
      },
    });

    const st = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const s = boxM(0.7, 0.16, 1.3, MAT.seat);
      s.position.set(Math.cos(a) * 0.85, 1.35, Math.sin(a) * 0.85);
      s.rotation.y = -a; s.rotation.x = -0.25;
      st.add(s);
      const bk = boxM(0.7, 1.0, 0.14, MAT.seat);
      bk.position.set(Math.cos(a) * 1.1, 1.75, Math.sin(a) * 1.1);
      bk.lookAt(0, 1.75, 0); bk.rotateX(0.25);
      st.add(bk);
    }
    v.sub(c, {
      id: 'seats', zh: '組員座椅', en: 'CREW SEATS', obj: st, ex: [0, 3, 0], anchor: [1.1, 2.1, 1.1],
      info: {
        mat: '碳纖維椅殼 · 客製化座墊',
        fn: '四張朝上的躺椅。每一張都依照該位太空人的身體，量身列印。',
        spec: '可承受發射與落海的雙重衝擊',
        why: '為什麼是躺著、而且面朝上？因為人體對「胸背方向」的加速度耐受力最好（可達 8-10 g），對「頭腳方向」最差（幾個 g 就會失去意識）。躺椅的角度不是為了舒適——是為了讓血液在 4 個 g 的減速中，還留在腦子裡。',
        ds: '每一張椅子的椅墊，都是根據那個人的身體 3D 掃描後客製的。這艘船認得坐在裡面的是誰。',
      },
    });

    const dp = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5;
      const p = boxM(0.62, 0.42, 0.05, MAT.glass);
      p.position.set(Math.sin(a) * 1.25, 2.35, Math.cos(a) * 1.25);
      p.lookAt(0, 2.0, 0);
      dp.add(p);
    }
    v.sub(c, {
      id: 'display', zh: '觸控顯示面板', en: 'TOUCHSCREEN DISPLAYS', obj: dp, ex: [0, 3, 4], anchor: [0.5, 2.75, 1.4],
      info: {
        mat: '大尺寸觸控螢幕 ×3',
        fn: '整艘船的所有操作介面。沒有滿牆的搖桿與按鈕——只有三塊玻璃。',
        spec: '手套可操作 · 全冗餘',
        why: '太空梭的座艙有超過 2,000 個開關。龍飛船有 3 塊螢幕、和 30 幾個實體按鈕（只留給最緊急的動作）。為什麼敢這樣做？因為它本來就是自動駕駛的——人不是來「開船」的，是來監督的。這是把「太空人是駕駛」改寫成「太空人是乘客」的一次哲學革命。',
        ds: '第一次坐上去的太空人說：「感覺像走進一輛未來的車。」——他們沒說錯，設計這個座艙的，正是同一批設計電動車內裝的人。',
      },
    });

    const ec = new THREE.Group();
    const b1 = boxM(1.0, 0.6, 0.7, MAT.dark); b1.position.set(0, 0.72, -1.15); ec.add(b1);
    const t1 = cylM(0.24, 0.24, 0.7, MAT.grey, 14); t1.position.set(-0.85, 0.75, -0.9); ec.add(t1);
    const t2 = cylM(0.24, 0.24, 0.7, MAT.grey, 14); t2.position.set(0.85, 0.75, -0.9); ec.add(t2);
    v.sub(c, {
      id: 'eclss', zh: '生命維持系統', en: 'ECLSS', obj: ec, ex: [0, -3, -4], anchor: [0.6, 1.1, -1.3],
      info: {
        mat: '氧氣瓶 · 氮氣瓶 · 環控模組',
        fn: '製造並維持一個「可以呼吸的世界」：氧氣濃度、總壓、溫度、濕度——全部由這幾個盒子控制。',
        spec: '支援 4 人數日（緊急時更久）',
        why: '這裡的每一個參數都是雙面刃：氧氣太少會缺氧，太多會讓整艙變成一顆炸彈（阿波羅一號的三名太空人，就是死在純氧艙的一場火裡）。所以龍飛船用的是「氧氣＋氮氣」的混合，就像地球的空氣。安全，有時候意味著刻意選擇比較麻煩的那條路。',
        ds: '這幾個不起眼的盒子，是四個人與真空之間唯一的化學屏障。它們不能休息，一秒都不行。',
      },
    });

    const co = new THREE.Group();
    const cx = cylM(0.3, 0.3, 0.8, MAT.grey, 16); cx.position.set(-1.05, 0.85, 0.75); co.add(cx);
    const cf = boxM(0.4, 0.4, 0.3, MAT.gold); cf.position.set(-1.05, 1.35, 0.75); co.add(cf);
    v.sub(c, {
      id: 'co2', zh: '二氧化碳清除', en: 'CO₂ SCRUBBER', obj: co, ex: [-4, 0, 3], anchor: [-1.3, 1.4, 1.0],
      info: {
        mat: '氫氧化鋰／胺類吸附劑',
        fn: '把太空人呼出來的二氧化碳，從空氣裡抓掉。',
        spec: '持續運轉，濾芯可更換',
        why: '密閉艙裡真正會先殺死你的，不是缺氧——是二氧化碳的累積。濃度到 5% 就開始頭痛、判斷力下降，10% 就會致命。阿波羅十三號那個著名的「用膠帶和襪子改裝濾罐」的橋段，救的正是這件事。這個不起眼的圓筒，是所有載人太空船裡最不能停的一台機器。',
        ds: '呼吸這件事，在地球上免費。在這裡，它需要一台機器、一組濾芯、和一個永不斷電的承諾。',
      },
    });

    const pa = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const p = cylM(0.26, 0.26, 0.6, MAT.white, 14);
      p.position.set(Math.cos(a) * 0.6, 3.45, Math.sin(a) * 0.6);
      pa.add(p);
    }
    v.sub(c, {
      id: 'chute', zh: '降落傘艙', en: 'PARACHUTE BAY', obj: pa, ex: [0, 5, 0], anchor: [0.7, 3.75, 0.7],
      info: {
        mat: '4 具主傘 + 2 具引導傘',
        fn: '再入的最後一幕：兩具小傘先把船穩住，四具巨大的主傘再張開，讓它輕輕落進海裡。',
        spec: '主傘直徑約 35 m ×4',
        why: '為什麼是 4 具而不是 3 具？因為 3 具就夠了——第 4 具是純粹的冗餘。SpaceX 做了上百次空投測試，包括故意讓其中一具不開，確認剩下 3 具仍能安全落地。當你的貨物是人命，「夠用」永遠不夠。',
        ds: '龍飛船本來設計成用 SuperDraco「推進著陸」，像火箭一樣穩穩落地。NASA 覺得風險太高，於是他們退回了降落傘。有時候最好的工程決定，是放下自己最酷的那個點子。',
      },
    });

    const ds = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const s = boxM(0.16, 0.12, 0.16, MAT.gold);
      s.position.set(Math.cos(a) * 0.75, 3.82, Math.sin(a) * 0.75);
      ds.add(s);
    }
    v.sub(c, {
      id: 'sensor', zh: '對接感測器', en: 'DOCKING SENSORS', obj: ds, ex: [0, 4, 0], anchor: [0.8, 3.95, 0.5],
      info: {
        mat: '光達（LiDAR）· 紅外相機',
        fn: '在最後 200 公尺，它用雷射和紅外線「看」著太空站，一公分一公分地算出相對位置與速度。',
        spec: '全自動對接，人可隨時接管',
        why: '兩個以 27,000 km/h 繞地飛行的物體要輕輕地碰在一起——它們的相對速度必須降到每秒幾公分。這比穿針還難，而且沒有 GPS 可用（太近了）。所以飛船必須自己「看見」目標。對接的最後幾分鐘，是全程唯一沒有地面能幫上忙的時刻。',
        ds: '俄羅斯的聯盟號直到今天，很多時候還是靠太空人手動對接。龍飛船讓這件事變成了自動——太空人只需要看著螢幕上的數字，慢慢歸零。',
      },
    });
  })();

  /* ══════════ SuperDraco ══════════ */
  (() => {
    const g = new THREE.Group(); v.refs.sdPl = [] as any[];
    for (let i = 0; i < 4; i++) {
      const a = ((i * 90 + 45) * Math.PI) / 180;
      const pod = cylM(0.28, 0.32, 1.0, MAT.white, 16);
      pod.position.set(Math.cos(a) * 1.65, 1.15, Math.sin(a) * 1.65);
      pod.lookAt(Math.cos(a) * 3, 1.6, Math.sin(a) * 3); g.add(pod);
      const nz = M(new THREE.ConeGeometry(0.14, 0.3, 12), MAT.inco);
      nz.position.set(Math.cos(a) * 1.95, 1.0, Math.sin(a) * 1.95);
      nz.lookAt(Math.cos(a) * 4, 0.4, Math.sin(a) * 4); g.add(nz);
      const pl = makePlume(0.24, 2.2, 'h');
      pl.position.copy(nz.position);
      pl.lookAt(Math.cos(a) * 4, -1, Math.sin(a) * 4);
      cap.add(pl); v.refs.sdPl.push(pl); v.plumes.push(pl);
    }
    v.comp({
      id: 'sd', zh: 'SuperDraco 逃逸引擎', en: 'SUPERDRACO', obj: g, parent: cap, ex: [0, 1, 2.5], anchor: [1.75, 1.3, 1.0],
      info: {
        mat: 'Inconel · 3D 列印燃燒室',
        fn: '8 具嵌在艙壁裡的引擎，兩兩成對。如果火箭出事，它們會在 100 毫秒內全力點燃，把整個載人艙從死神手裡拽走。',
        spec: '單機推力 71 kN · 0 → 100 km/h 僅需 1.2 秒',
        why: '為什麼把逃逸引擎「內建」在飛船上？傳統做法是在飛船頂上裝一座逃逸塔——但那座塔一旦沒用上（99% 的情況），就得被丟掉，白白浪費質量。SuperDraco 整合進艙體，全程待命、任何高度都能啟動，而且不用時可以直接帶回地球再用。',
        ds: '它們的燃燒室是 3D 列印出來的——因為那個內部的冷卻流道結構，用傳統工法根本做不出來。人類第一次讓「印出來的零件」負責保住太空人的命。',
      },
    });
  })();

  /* ══════════ Draco 姿態推進器 ══════════ */
  (() => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.3;
      const c1 = M(new THREE.ConeGeometry(0.06, 0.16, 10), MAT.dark);
      c1.position.set(Math.cos(a) * 1.0, 3.3, Math.sin(a) * 1.0);
      c1.lookAt(Math.cos(a) * 3, 3.6, Math.sin(a) * 3);
      g.add(c1);
    }
    v.comp({
      id: 'draco', zh: 'Draco 姿態推進器', en: 'DRACO THRUSTERS', obj: g, parent: cap, ex: [0, 3, 0], anchor: [1.05, 3.35, 0],
      info: {
        mat: '自燃推進劑（NTO / MMH）',
        fn: '16 具小型推進器。它們負責在軌道上轉身、變軌，以及對接時那些以「公分」為單位的微調。',
        spec: '單機推力約 400 N',
        why: '為什麼用「自燃」推進劑——兩種液體碰到就自己燒起來？因為在太空裡，你最不想聽到的兩個字是「點火失敗」。沒有火星塞、沒有點火器、沒有任何可能失靈的東西：閥門一開，它就一定會燒。可靠度，來自於「沒有東西可以出錯」。',
        ds: '它們和 SuperDraco 同屬 Draco 家族——一個負責保命，一個負責導航。一大一小，一次都不能錯。',
      },
    });
  })();

  /* ══════════ 鼻錐蓋（修正錨點座標系） ══════════ */
  (() => {
    const nc = M(lat([[1.1, 0], [1.0, 0.4], [0.7, 0.7], [0.35, 0.85], [0.05, 0.9]], 32), MAT.white);
    const piv = new THREE.Group(); piv.position.set(0, 3.92, -0.95);
    const inner = new THREE.Group(); inner.position.set(0, 0, 0.95); nc.position.y = 0; inner.add(nc); piv.add(inner);
    v.refs.noseP = piv;
    v.comp({
      id: 'nose', zh: '鼻錐蓋', en: 'NOSECONE', obj: piv, parent: cap, ex: [0, 2, 0], anchor: [0.65, 0.5, 0.95],
      info: {
        mat: '複合材料鉸接蓋',
        fn: '保護頂端的對接口穿越大氣層。入軌後向上掀開，露出對接機構；返回前再蓋回去。',
        spec: '鉸接式 · 可反覆開合',
        why: '對接機構是一圈精密的金屬環——它絕對不能被上升段的氣動加熱與震動摧殘。但它又必須在太空中完全暴露。所以這片蓋子必須「打得開、也關得回來」：關不回來，再入時等離子體會從那個洞灌進來。這是一個「兩次都不能失敗」的機構。',
        ds: '播放「鼻錐開啟」動畫。那個緩緩掀起的動作，是龍飛船的招牌——像一隻在太空中抬起頭的動物。',
      },
    });
  })();

  /* ══════════ 對接機構 ══════════ */
  (() => {
    const g = new THREE.Group();
    const ring = torM(0.55, 0.08, MAT.gold); ring.position.y = 3.95; g.add(ring);
    const htch = cylM(0.42, 0.42, 0.12, MAT.grey, 24); htch.position.y = 3.9; g.add(htch);
    v.comp({
      id: 'dock', zh: '對接機構', en: 'DOCKING PORT', obj: g, parent: cap, ex: [0, 3.5, 0], anchor: [0.6, 4.05, 0],
      info: {
        mat: 'IDSS 國際對接標準介面',
        fn: '兩艘飛行器之間的握手。先軟接觸、吸收殘餘動能，再硬鎖、加壓，最後打開艙門——變成一條可以走過去的走廊。',
        spec: '符合國際標準，可與 ISS 直接對接',
        why: '為什麼要「國際標準」？因為在軌道上，最壞的情況是：一艘船出事了，另一艘船靠得過去卻接不上。IDSS 讓所有國家的飛船都能對接彼此的艙口——這不是技術問題，這是一份寫在金屬上的救援承諾。',
        ds: '當這一圈金屬環鎖上、壓力平衡、艙門打開的那一刻，一艘從地球飛來的船，就變成了太空站的一個房間。',
      },
    });
  })();

  v.ap('sd', 0, (x) => v.refs.sdPl.forEach((p: any) => p.userData.set(x)));
  v.ap('lift', 0, (x) => { cap.position.y = 3.7 + x; });
  v.ap('trunk', 0, (x) => { const c = v.find('trunk'); if (c) c.obj.position.y = c.baseP.y - x; });
  v.ap('nose', 0, (x) => { v.refs.noseP.rotation.x = -x * 1.9; });
}
