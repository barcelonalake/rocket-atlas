# ROCKET ATLAS · 運載火箭互動圖鑑

> Telemetry Paper（工程圖紙展廳）設計語言的 SpaceX 運載火箭 3D 互動探索平台
> Next.js 14 · React Three Fiber · TypeScript · Zustand · GSAP

這是「單檔驗證版」之後的正式工程化重寫。相同的程序化幾何與互動邏輯，被拆解成型別化、模組化、可持續擴充的專案結構。

---

## 快速開始

```bash
npm install
npm run dev      # http://localhost:3000
```

其他指令：

```bash
npm run build      # 正式建置
npm run start      # 啟動正式建置
npm run typecheck  # tsc --noEmit
```

需求：Node.js 18.17+。

---

## 設計語言：Telemetry Paper

刻意避開火箭視覺化最常見的「深色太空 + 霓虹強調色」套路，改採明亮工程紙美學——不鏽鋼、銅、鈦、鈮的 PBR 反射在亮環境下最耐看，如同博物館產品攝影。

設計 token 定義於 `lib/tokens.ts`，並與 `app/globals.css` 的 CSS 變數同步：

| 角色 | 值 |
| --- | --- |
| 紙白背景 | `#F6F5F0` |
| 近黑墨線 | `#17191C` |
| 髮絲線 | `#E2E0D8` |
| 唯一強調色（國際橘） | `#E8501C` |
| 液氧 / 燃料 / 高溫 / TEB | `#1596B4` / `#E59A2F` / `#D8483A` / `#2FBF71` |

字體：系統 CJK sans + 等寬 mono（遙測數字）。簽名元素為 **CAD 圖紙視窗**：細格線、10m 距離環、HTML 導線標籤、`H = X m` 尺寸線、角落圖框標記與圖號。


---

## 核心體驗：打開它，看見裡面

這一版的重點不是「更多元件」，而是**每個元件都可以被拆開**。

| 模式 | 你看到什麼 |
| --- | --- |
| 實體 | 乾淨的外部組件 |
| 線框 | 工程線框圖 |
| **X 光** | 外殼變幽靈，**全機所有內部構造同時現形**——貯箱、隔框、管路、氣瓶、航電，一次看完 |
| **拆解** | 只留下該元件、外殼透明化，內部零件可個別點選、爆炸、聚焦 |

進入拆解：點選元件 → 「拆開看內部」，或直接**雙擊**元件。X 光模式下直接點內部零件，會直接鑽進該元件的拆解視圖。`Esc` 退出。

**48 個主元件 · 76 個內部零件 · 103 段「為何這樣設計」。**

每張說明卡有四層：材質 / 功能 / 規格，加上一段 **為何這樣設計（WHY）**——不只講「這是什麼」，講清楚工程師當初面對什麼取捨、為什麼非這樣不可。這是整個升級的靈魂：讓人看懂結構之後，還能看懂它背後的判斷。

範例（第二級箭體 → 冷氣氮氣推進器）：
> 失重狀態下，槽裡的液體會飄成一顆自由的球，離開出油口。引擎一點火，吸進去的是氣不是液——瞬間爆炸。所以在每一次重新點火之前，這幾股氮氣要先輕輕推火箭一下，讓液體因為「假重力」乖乖沉回槽底。

### 本版修正的既有缺陷

- 級間段 Y 座標寫成 `2.2`（掉在引擎艙旁），應為 `45.1`
- 星艦襟翼的鉸鏈掛到 `ship` 而非元件自己的 group，導致襟翼**無法被點選**
- 整流罩兩瓣沿 X 軸切分、卻繞 X 軸開合（對不上）；已改為沿 Z 軸對開
- 整流罩與天龍號鼻錐的標籤錨點用了錯誤的座標系，標籤飄在半空

---

## 專案結構

```
app/                     Next.js App Router
  layout.tsx             根佈局 + metadata
  page.tsx               動態載入 Experience（ssr: false，WebGL 僅限 client）
  globals.css            Telemetry Paper 全域樣式

lib/                     與框架無關的核心（純 three.js / 資料）
  tokens.ts              設計 token
  types.ts               Vehicle / Comp / Sequence 型別
  geometry.ts            幾何輔助（lat / bellPts / tube / dome / gridFin …）
  materials.ts           PBR 材質庫 + 共享剖面平面
  plume.ts               引擎尾焰 shader
  flow.ts                推進劑流路粒子系統
  sample.ts              關鍵幀取樣器
  vehicle.ts             Vehicle 類別（材質複製、拾取、爆炸、檢視模式、高亮）
  camera.ts              攝影機控制器橋接（供 Canvas 外的 UI 呼叫）
  defs.ts                五具載具定義 + 飛行時序資料
  vehicles/              程序化幾何建構器
    falcon9.ts  merlin.ts  raptor.ts  stack.ts  dragon.ts

components/              React / R3F
  Experience.tsx         組合根（VehicleProvider 包裹全部）
  VehicleProvider.tsx    載具實例快取 + context
  Scene.tsx              Canvas · 攝影棚環境 · CAD 網格 · 攝影機 · 載具掛載 · 拾取 · 每幀驅動器 · 標籤投影
  Overlays.tsx           標籤 / 導線 / 提示的 HTML 層（Canvas 外）
  overlay.ts             疊層 DOM 註冊表
  Sidebar.tsx            載具卡片 + 檢視控制（模式 / 標籤 / 爆炸 / 剖面）
  Topbar.tsx             麵包屑 + 攝影機預設 + 隔離 / 重置 / 全螢幕
  SeqBar.tsx             序列晶片 + 時間軸
  InfoPanel.tsx          載具總覽 / 元件細節 / 序列資訊 / 流路圖例
  Loading.tsx            載入動畫

store/
  useStore.ts            Zustand 全域狀態（單一真理來源）
```

### 架構要點

- **狀態與物件分離**：Zustand `useStore` 只存 UI 狀態（選取、檢視模式、爆炸值、序列播放…）。笨重的 three.js 物件不進 store，由 `VehicleProvider` 快取並經 context 提供。
- **命令式幾何、宣告式外殼**：載具幾何是與框架無關的 `Vehicle` 類別，回傳 `THREE.Group`，透過 `<primitive>` 掛載。React 只負責 UI 與生命週期；每幀更新集中在 `Scene.tsx` 的單一 `FrameDriver`（`useFrame`）中，效能可控。
- **拾取**：交給 R3F 的事件系統（`<primitive onPointerMove/onClick/onPointerMissed>`），instanced mesh 也能正確命中。
- **攝影機**：drei `<CameraControls>` 提供阻尼軌道與程序化飛行；`lib/camera.ts` 以 module-level 橋接讓 Canvas 外的按鈕也能驅動。
- **標籤疊層**：HTML 標籤 + SVG 導線在 Canvas 外渲染，`FrameDriver` 每幀把 3D 錨點投影到螢幕座標，含左右分桶防重疊與每 4 幀一次的遮擋 raycast。

> `reactStrictMode` 已關閉：命令式 three.js 物件只該建置一次，Strict Mode 的雙重呼叫會讓每具載具被建兩遍。

---

## 內容範圍與邊界

**已實作**：5 具載具（獵鷹 9、Merlin 1D、Raptor、超重·星艦、天龍號 2）、40+ 可選元件（各附材質 / 功能 / 規格 / 觀察）、爆炸視圖、剖面、X 光 / 線框、攝影機預設、聚焦 / 隔離、獵鷹 9 完整任務時序、超重·星艦熱分離、天龍號逃逸序列、Merlin 燃氣產生器循環與 Raptor 全流量分級燃燒流路動畫、隔熱瓦與 33 引擎 InstancedMesh。

**邊界（誠實揭露）**：

- 幾何為**程序化重建**——比例、機械層級、可拆解元件正確，但非授權 GLTF 工程模型，屬教育示意精度。
- 數據為**公開約略值**。
- 行動裝置為基本支援（側欄抽屜化、資訊面板底部卡片）。

### 後續路線（適合在 Claude Code 續建）

1. **GLTF 資產管線**：以 `useGLTF` + Draco 載入高精度模型，取代（或疊加於）程序化幾何；`Vehicle` 的 comp 抽象已預留每件可選網格的接點。
2. **後製**：`@react-three/postprocessing` 加入 Bloom（尾焰）、SSAO、色調分級。
3. **LOD 與效能**：`<Detailed>` 分級、隔熱瓦與引擎的視錐 / 距離裁切、行動裝置降載策略。
4. **狀態持久化**：URL query 序列化目前檢視（載具 / 選取 / 序列）以利分享深連結。
5. **無障礙**：鍵盤導覽元件樹、`aria-live` 播報序列事件、對比與 reduced-motion 已部分處理，可再強化。
6. **測試**：Playwright 對關鍵互動做視覺回歸。

---

數據為公開資料之約略值，幾何為教育用途之程序化重建，與 SpaceX 官方無關。
