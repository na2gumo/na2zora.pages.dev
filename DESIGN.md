# na2zora — DESIGN SPEC

na2gumo（なつぐも）のポートフォリオ。**開発者**のページ。
この文書が唯一の正。実装者はここに書かれた見た目・文言・挙動をそのまま作る。書かれていない細部は「ZZZ（Zenless Zone Zero）のゲーム UI ならどうするか」で決める。

---

## 0. コンセプト: NA2ZORA TERMINAL

サイト全体が架空の端末「NA2ZORA TERMINAL」の画面という設定。訪問者はログインした「オペレーター」、na2gumo は端末に登録された「エージェント」。
**物語を読ませない。設定のある UI を触らせる。** 叙情的な文章・明朝体・自然モチーフ（空・雲・星）は一切使わない。

トーン: ストリート／ポップ、ハイコントラスト、ネオンライム、斜めの切り口、ステッカー、警告テープ、ハーフトーン、CRT、グリッチ。**ホバーすると必ず何かが起きる。**

ページ構成（上から）:

| ID | チャンネル | 中身 |
| --- | --- | --- |
| （全体） | BOOT | 初回だけ出る起動画面 |
| `#top` | CH.00 | ヒーロー（名前・モニター・警告テープ） |
| `#agent` | CH.01 AGENT FILE | プロフィール（資料カード） |
| `#loadout` | CH.02 LOADOUT | スキル（装備スロット） |
| `#log` | CH.03 ACTIVITY LOG | GitHub 活動（HUD メーター＋ログ） |
| （footer） | END OF TRANSMISSION | フッター |

---

## 1. デザイントークン（`src/styles/_base.scss` の `:root`）

### 色

| 変数 | 値 | 用途 |
| --- | --- | --- |
| `--bg` | `#09090b` | ページ背景 |
| `--panel` | `#131317` | パネル |
| `--panel-2` | `#1c1c22` | パネルのホバー・明るめ |
| `--line` | `rgb(255 255 255 / 0.1)` | 罫線 |
| `--line-strong` | `rgb(255 255 255 / 0.22)` | 強い罫線 |
| `--ink` | `#f3f3ee` | 文字 |
| `--dim` | `#8b8b96` | 補助文字 |
| `--lime` | `#d4ff1e` | メインアクセント |
| `--orange` | `#ff6a1a` | 警告・スタンプ |
| `--pink` | `#ff2e88` | グリッチ・差し色・LIVE |
| `--cyan` | `#2ee6ff` | 情報・グリッチ |

- ライム／オレンジ／ピンクの塗りの上の文字は必ず `--bg`
- `::selection` は ライム背景 × 黒文字
- `color-scheme: dark`。`html` と `body` の背景は `--bg`
- スクロールバー: `scrollbar-color: var(--lime) var(--bg)`

### 文字

| 変数 | フォント | 用途 |
| --- | --- | --- |
| `--font-display` | `"Anton", "Dela Gothic One", sans-serif` | 英字の巨大見出し。**必ず `text-transform: uppercase`**、`line-height: 0.85〜0.9` |
| `--font-head` | `"Dela Gothic One", var(--font-sans)` | 和文の見出し・ステッカーの和文 |
| `--font-sans` | `"BIZ UDPGothic", system-ui, sans-serif` | 本文。`line-height: 1.8` |
| `--font-mono` | `"Geist Mono", ui-monospace, "BIZ UDPGothic", monospace` | 数値・ID・ログ・ラベル。数字は `font-variant-numeric: tabular-nums` |

フォントは `fonts/raw/` の TTF を `scripts/subset-fonts.ts`（glypht）が `public/fonts/common/` にサブセット化する。設定済み（Dela Gothic One・Anton・BIZ UDPGothic・Geist Mono）。`pnpm build` の中で自動実行される。**ソースに新しい和文を書いたら `pnpm font:subset` を再実行すること。**

### 形

```scss
--gutter: clamp(16px, 4vw, 56px);
--notch: 16px;
--notch-clip: polygon(var(--notch) 0, 100% 0, 100% calc(100% - var(--notch)), calc(100% - var(--notch)) 100%, 0 100%, 0 var(--notch));
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
```

- **ノッチパネル**: 左上と右下の角を斜めに落とす `clip-path: var(--notch-clip)`。clip-path で border が切れるので、枠線は `outline` ではなく、背景に `linear-gradient` を重ねるか、内側に 1px 小さい要素を置いて作る
- **ステッカー** `.sticker`: `display:inline-block; transform: skewX(-10deg); padding: 2px 10px;`、中の `<span>` を `skewX(10deg)` で戻す。バリエーション `--lime`（塗り）、`--outline`（1px 枠）、`--pink`、`--orange`
- **角ブラケット**: 要素の四隅に L 字の 2px ライム線（`::before`/`::after` で 2 隅ずつ、`background` の linear-gradient 4 本でも可）

### 共通クラス（`_base.scss` に置く）

- `.sticker`（上記）
- `.mono-label`: `font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim);`
- `.btn`: ノッチ（`--notch: 10px`）、`padding: 14px 22px`、`font-family: var(--font-display)`、`font-size: 1.15rem`、`letter-spacing: 0.04em`。
  - `.btn--primary`: ライム塗り・黒文字。ホバーで ピンク塗りに変わり、矢印が 4px 進む。`transition: 0.18s var(--ease-out)`
  - `.btn--ghost`: 透明＋`--line-strong` の枠（内側の box-shadow で）。ホバーでライム塗り・黒文字
- `.visually-hidden`

---

## 2. 全体レイヤー（`src/routes/layout.tsx`）

z-index の順（下から）:

1. **背景** `.bg`（`position: fixed; inset: 0; z-index: -1; pointer-events: none`）
   - ハーフトーン: `radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1.4px) 0 0 / 7px 7px`。`mask-image: linear-gradient(115deg, #000 0%, transparent 55%)` で左上だけに出す
   - 右下に大きなピンクのハーフトーン円（直径 60vmax、ドット 9px、`mask-image: radial-gradient(circle, #000 0 30%, transparent 70%)`、opacity 0.35）
2. **main とフッター**
3. **HUD ヘッダー**（z 50）
4. **スキャンライン＋ノイズ** `.crt`（fixed、z 90、`pointer-events: none`）
   - `repeating-linear-gradient(0deg, rgb(0 0 0 / 0.22) 0 1px, transparent 1px 3px)`、opacity 0.35
   - ノイズ: feTurbulence の SVG data URI を 200px タイル、opacity 0.05、`animation: noise 0.6s steps(3) infinite`（`background-position` を 3 か所に飛ばす）
5. **カーソル** `.cursor`（z 95）
6. **BOOT** `.boot`（z 100）

`body { overflow-x: clip; }`。横スクロールは絶対に出さない。

### 2.1 カーソル（`src/components/cursor/cursor.tsx`）

- `(pointer: fine)` かつ reduced-motion でないときだけ。ネイティブカーソルは**消さない**（追加の照準として出す）
- 24px の正方形の四隅にだけ 2px のライムの L 字（照準）。`mix-blend-mode: difference` は使わない（ライムのまま見せる）
- マウスに `lerp 0.2` で追従（requestAnimationFrame）。中心にはつかず、ポインタ位置に中心を合わせる
- `a, button, summary, [data-cursor]` に乗ると 44px に広がり、色がピンク、45° 回転。リンクなら右下に mono で `OPEN` の小さいラベル
- mousedown で 0.8 倍に縮む

### 2.2 HUD ヘッダー（`src/components/hud/hud.tsx`）

`position: fixed; top: 0; inset-inline: 0; height: 56px; padding-inline: var(--gutter)`、3 カラム（`grid-template-columns: 1fr auto 1fr`）。

- **左**: ロゴ
  - ライム塗りの平行四辺形ステッカーに Anton で `N2Z`（黒、1.3rem）
  - その右に mono 2 行: `NA2ZORA TERMINAL`（ink, 0.72rem）/ `// OPERATOR VIEW`（dim, 0.65rem）
  - リンク先 `#top`。ホバーでステッカーがピンクになり −4° 傾く
- **中央**（900px 以上のみ）: チャンネルナビ。mono 0.75rem、項目 `00 TOP` `01 AGENT` `02 LOADOUT` `03 LOG`（`#top` `#agent` `#loadout` `#log`）
  - 数字は dim、名前は ink。間隔 4px
  - **現在地（スクロールスパイ）**: ライム塗り・黒文字の skew ステッカーになる。切り替わりで背景がスライドする（項目ごとの背景ではなく、1 個の `.hud__indicator` が `translate` と `width` を transition で動く）
  - ホバー: 文字がピンクになり、1 回だけ 120ms のグリッチ（`translate` を ±2px で 3 ステップ揺らす）
- **右**: 時計とステータス
  - JST の実時刻 `HH:MM:SS`（mono, tabular-nums, 0.85rem）。1 秒ごとに更新
  - その左に `● ONLINE`（ドットはライム、`animation: blink 1.2s steps(2) infinite`）
- **900px 未満**: 中央を消し、右側に現在のチャンネル名（`CH.02 LOADOUT` など）を mono で出す。時計は残す
- スクロール 8px を超えたら背景 `rgb(9 9 11 / 0.82)` ＋ `backdrop-filter: blur(10px)` ＋ 下に `--line` の 1px（transition 0.2s）
- **スクロール進捗バー**: ヘッダー直下に高さ 2px、ライム、`transform: scaleX(進捗)`、`transform-origin: left`

### 2.3 Motion（`src/components/motion/motion.tsx`）

レイアウトに 1 個置く、DOM を持たないコンポーネント（`useVisibleTask$` か `useOnDocument`）。

- `[data-reveal]` を IntersectionObserver（`rootMargin: "0px 0px -12% 0px"`）で監視し、入ったら `.is-in` を付けて監視をやめる（一度出たら戻さない）
- CSS（`_base.scss`）:
  - 既定 `[data-reveal]`: `clip-path: polygon(0 0, 0 0, 0 100%, 0 100%)` → `.is-in` で `polygon(0 0, 100% 0, 100% 100%, 0 100%)`。0.7s `--ease-out`。左から斜めに切り開くように見せるため、開始は `polygon(0 0, 0 0, -20% 100%, -20% 100%)`、終了は `polygon(0 0, 120% 0, 100% 100%, 0 100%)` にする
  - `[data-reveal="up"]`: `opacity: 0; translate: 0 32px` → `opacity 1; translate 0`
  - `[data-reveal="pop"]`: `scale: 0.6; opacity: 0` → `scale 1` を `--ease-pop` で
  - `[data-reveal="slam"]`: `scale: 2.2; opacity: 0; rotate: -14deg` → `scale 1; rotate -8deg`（スタンプ用）。0.35s `cubic-bezier(0.5, 0, 0.75, 0)`
  - `transition-delay: calc(var(--i, 0) * 70ms)`。子要素の時差は `style={{ "--i": n }}`
- **JS が動かない／`html` に `.js` がないとき**は全部最初から見える状態にする（`.js [data-reveal]` にだけ初期の隠し状態を当てる。`html.js` は `router-head` のインラインスクリプトで付ける）
- `prefers-reduced-motion: reduce` では初期状態も見える状態にし、transition なし

### 2.4 BOOT（`src/components/boot/boot.tsx`）

**初回だけ**出る全画面の起動画面。合計 2.6 秒。CSS アニメーションだけで進み、最後は `visibility: hidden` になる（JS が死んでも閉じる）。

- 表示条件: `sessionStorage["na2zora:booted"]` が無いとき。`router-head` のインラインスクリプトで、フラグがあれば `html.booted` を付け、`.booted .boot { display: none }`。フラグは BOOT が終わったとき（`animationend`）か SKIP 時に立てる
- `prefers-reduced-motion: reduce` のときは出さない（CSS で `display: none`）
- `aria-hidden="true"`。フォーカスを奪わない。ただし SKIP ボタンだけはクリック可
- 中身（黒背景、左寄せ、`padding: var(--gutter)`、縦中央、mono 0.85rem、ライン間 1.9）:

  ```
  NA2ZORA TERMINAL  v2.6                        ← ink, 1rem
  > mounting /dev/agent .................. [ OK ]
  > linking github.com/na2gumo ........... [ OK ]
  > syncing activity feed ................ [ OK ]  12 PUSHES / 7D
  > operator authenticated
  ```

  - `[ OK ]` はライム。`12 PUSHES / 7D` は実データ（`pushesThisWeek`）、取得失敗時は `[ OFFLINE ]` をオレンジで
  - 各行は 0.22s 間隔で現れる（`opacity` を `steps(1)` で。タイプライター風にしたければ `width` を `steps(n)` で伸ばしてもよい）
  - 最後の行の後ろにブロックカーソル `█` が点滅
  - 下にプログレスバー（幅 min(420px, 100%)、高さ 6px、ライム、0.0s→2.0s で 0→100%、`steps(12)` でカクカク進む）。右に `%` の数字は不要
- 2.0s: **ワイプ**。画面全体を覆うライムのパネルが右下から左上へ斜めに走り抜ける（`clip-path` の polygon をアニメーション、0.45s）。走っている間、中央に Anton で `NA2ZORA` を黒で 18vw（ライムのパネルにだけ見える）
- 2.45s: BOOT 全体が `opacity 0` → `visibility: hidden`
- 右下に `SKIP ›`（mono, dim、ホバーでライム）。クリック、`Esc`、`Enter` で即終了（`.boot--skip` を付けて 0.15s で消える）
- ページ本体は BOOT の下で普通に描画されている（BOOT が閉じるとヒーローの `data-reveal` が既に出ている状態。ヒーローの登場演出を BOOT の後に見せたいので、**ヒーローの reveal は `html.boot-done` が付いてから**動かす。BOOT が出ない場合は最初から `boot-done`）

### 2.5 フッター: END OF TRANSMISSION（`src/components/site-footer/site-footer.tsx`）

- 上端に警告テープ（3.1 と同じ `.tape`、傾き 0、黒地にライム文字の版）
- **巨大テロップ**: Anton、`font-size: 15vw`、白抜き（`color: transparent; -webkit-text-stroke: 1.5px var(--lime)`）。`END OF TRANSMISSION ✦ ` を繰り返して左へ流す（40s linear infinite）。ホバー中は流れが 1/4 の速さになり、文字がライムで塗られる
- 下段（3 カラム、モバイルは縦積み、`padding: 48px var(--gutter) 32px`）:
  - 左: mono `NA2ZORA TERMINAL` / `© {年} na2gumo` / `Built with Qwik + Cloudflare Pages`（dim）
  - 中: リンク `GITHUB ↗`（`https://github.com/na2gumo`、Anton 2rem、ホバーでライム＋斜めにずれる）
  - 右: `.btn--ghost` で `↑ REBOOT`。押すと `sessionStorage` のフラグを消し、`scrollTo(0)`（smooth）し、BOOT を再生する（`html.booted`/`boot-done` を外して BOOT 要素を再マウントするか、クラスを付け直してアニメーションを再起動）

---

## 3. セクション（`src/routes/index.tsx`）

### 3.0 セクション見出し（`src/components/section-head/section-head.tsx`）

props: `index: "01"`, `title: "AGENT FILE"`, `sub: "エージェント資料"`, `meta?: string`（右端の mono）、`id`（h2 の id）。

```
 0̲1̲                                                   CH.01 / 03
 AGENT FILE
 ／ エージェント資料
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- 番号: Anton、`font-size: clamp(6rem, 16vw, 13rem)`、白抜き（`-webkit-text-stroke: 1.5px var(--lime)`、`color: transparent`）、`line-height: 0.8`、位置は左上。タイトルが番号の下半分に重なる（`margin-top: -0.45em`）
- タイトル: Anton `clamp(2.6rem, 7vw, 5.5rem)`、ink、`letter-spacing: 0.01em`
- サブ: Dela Gothic One 1rem、dim、先頭にライムの `／`
- 右上 `meta`: `.mono-label`。既定は `CH.{index} / 03`
- 下線: 1px `--line` の上に、幅 120px のライムの線が重なる。reveal で 0 → 120px に伸びる
- 番号・タイトル・サブはそれぞれ `data-reveal` で時差（`--i` 0,1,2）
- セクション自体: `padding: clamp(96px, 16vh, 160px) var(--gutter)`、`max-width: 1280px; margin-inline: auto`

### 3.1 CH.00 ヒーロー（`#top`）

`min-height: 100svh`、`padding-top: 96px`。デスクトップ（≥ 960px）は 12 カラム: 左 7 カラムがテキスト、右 5 カラムがモニター。モバイルは縦積み（テキスト → モニター）。

**左カラム**（上から）:

1. 行: `.sticker--lime` に `CH.00` ＋ mono `AGENT ONLINE — ID: na2gumo`（dim、`●` はライム点滅）
2. **名前** `NA2GUMO`: `h1`、Anton、`font-size: clamp(4.6rem, 15.5vw, 14rem)`、`line-height: 0.82`、ink。`h1` にはスクリーンリーダー用に「なつぐも (na2gumo)」を `aria-label` で
   - **グリッチ**: `::before`（ピンク）と `::after`（シアン）に `content: attr(data-text)`。普段は非表示。**4.5 秒ごとに 0.35 秒だけ**バーストする: 各疑似要素が `clip-path: inset(a% 0 b% 0)` で横帯に切られ、`translate: ±4px` でずれる。keyframes は 6 ステップ以上で帯の位置を変える。本体も同時に `skewX(-6deg)` を 1 フレーム
   - ホバー中はバーストが 1.2 秒周期で繰り返す
3. **なつぐも**: Dela Gothic One `clamp(1.6rem, 3.6vw, 2.6rem)`、黒文字、背後にライムの帯（`skewX(-10deg)` のステッカー、左右 padding 14px）。`margin-top: 12px`
4. **ステッカー列**（`gap: 10px`、`margin-top: 28px`、`data-reveal="pop"` を `--i` 0〜2 で）:
   - `DEVELOPER`（`.sticker--lime`、Anton 1.1rem）
   - `STUDENT`（`.sticker--outline`）
   - `VRCHAT RESIDENT`（`.sticker--pink`）
5. 一文（`--font-sans`、`clamp(1rem, 1.4vw, 1.15rem)`、ink 0.85、`max-width: 32em`、`margin-top: 24px`）:
   「開発者で、学生。VRChat に生息しています。最近は Minecraft にも手を付けたり。」
6. ボタン列（`margin-top: 36px`、`gap: 12px`）: `.btn--primary` `OPEN AGENT FILE ↓`（`#agent`）／`.btn--ghost` `GITHUB ↗`（新しいタブ）

**右カラム: モニター** `.monitor`

- ノッチパネル（`--notch: 22px`）、`aspect-ratio: 4 / 5`、`max-width: 440px`、`justify-self: end`、`rotate: 2.5deg`
- 背面に、モニターより少し大きいライムの平行四辺形（`clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%)`、`translate: 18px 18px`、`rotate: -4deg`）
- 枠: 外側 `--panel`、内側 8px 内に画面
- **上バー**（mono 0.7rem、高さ 28px）: 左 `CAM-01`、右 `● LIVE`（ピンク、点滅）
- **画面**: アバター（`/avatar.avif`、フォールバック `https://avatars.githubusercontent.com/u/266047745?v=4`）を `object-fit: cover`
  - 色: `filter: grayscale(1) contrast(1.15)` の上に `mix-blend-mode: multiply` のライム（`--lime`）レイヤーを重ねてデュオトーンにする。モニターのホバーで 0.4s かけて元の色へ
  - 上にスキャンライン（2px 周期）と、ゆっくり下へ流れる明るい帯（高さ 18%、`linear-gradient(transparent, rgb(255 255 255 / 0.08), transparent)`、6s linear infinite）
  - 四隅にライムの角ブラケット
  - 画面の左下に Anton `NA2GUMO` 小さく（1.4rem、ink）と、その下に mono `CLASS: DEVELOPER`
- **下バー**（mono 0.7rem）: 左 `SIGNAL ▮▮▮▮▯`、右 `PUSH.7D {pushesThisWeek}`（取得失敗時 `--`）
- **パララックス**（`pointer: fine` のみ）: マウス位置（ビューポート中心からの −1〜1）で、モニターは `translate(-x*14px, -y*14px)` と `rotateX(y*6deg) rotateY(-x*8deg)`（親に `perspective: 900px`）。背面のライムは逆方向に `x*8px`。lerp で滑らかに

**下端: 警告テープ 2 本**（`.hero__tapes`、ヒーローの最下部に絶対配置、`inset-inline: -10vw`、高さ 140px のゾーン）

- `.tape` 共通: 高さ 46px、`display:flex; overflow:hidden; white-space:nowrap`。中身を 2 回並べて `translateX(-50%)` までループ
- テープ A: `rotate: -3.5deg`、ライム塗り、Anton 1.5rem 黒、`WEB DEV ✦ UNITY ✦ LINUX ✦ CYBERSECURITY ✦ PRIVACY ✦ VRCHAT ✦ MINECRAFT ✦ `、左へ 28s
- テープ B: `rotate: 2.5deg`、黒地、上下に 6px の警告ストライプ（`repeating-linear-gradient(-45deg, var(--lime) 0 10px, var(--bg) 10px 20px)`）、mono 0.8rem ライム `// NA2ZORA TERMINAL — AGENT na2gumo — STATUS: ONLINE — CLEARANCE: PUBLIC `、右へ 36s
- A が B の上に重なる（z-index）。テープのホバーで流れが止まる
- **スクロール合図**: 左下 mono `SCROLL ▼`（▼ が 1s で上下 4px）

**登場（BOOT の後）**: ステッカー行（up, i0）→ 名前（既定ワイプ, i1）→ なつぐも（pop, i3）→ ステッカー（pop, i4〜6）→ 一文・ボタン（up, i7, i8）→ モニター（`data-reveal="up"`、i3、さらに 0.6s かけて `rotate` が 10deg → 2.5deg）→ テープ（横から滑り込む: A は左から、B は右から、i6）

### 3.2 CH.01 AGENT FILE（`#agent`、`src/components/agent-file/agent-file.tsx`）

SectionHead: `01` / `AGENT FILE` / `エージェント資料`。

**資料カード** `.dossier`: ノッチパネル（`--notch: 24px`）、`--panel`、`padding: clamp(20px, 3vw, 40px)`、デスクトップは 2 カラム `280px 1fr`（gap 40px）、モバイル 1 カラム。カード全体が `data-reveal`（ワイプ）。

カード上辺に、タブのような見出しバー: 左 mono `FILE: AGENT_na2gumo.dat`、右 mono `CLEARANCE: PUBLIC`（ライム）。下に `--line`。

**左カラム**:

- 証明写真: 正方形、ライムの 2px 枠、アバターを grayscale(1)。ホバーでカラー
- **スタンプ** `VERIFIED`: 写真の右下に重ねる。Anton 1.6rem、オレンジの 3px 枠と文字、`rotate: -8deg`、`opacity: 0.92`、`mix-blend-mode: screen`。`data-reveal="slam"`（`--i: 6`、カードのワイプ後に叩きつけられる）
- 写真の下: バーコード（高さ 36px、`repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 4px, var(--ink) 4px 5px, transparent 5px 8px)` を不規則に見えるよう 2 本重ねる）、その下に mono `ID-na2gumo`

**右カラム: 属性テーブル** `dl`（各行 `display: grid; grid-template-columns: 130px 1fr; padding: 14px 0; border-bottom: 1px solid var(--line)`）。行は `data-reveal="up"` で `--i` 1〜6。

| ラベル（`.mono-label`） | 値 |
| --- | --- |
| `NAME` | なつぐも **(na2gumo)** ※「なつぐも」を Dela Gothic One 1.3rem、括弧部分は mono dim |
| `CLASS` | `Developer / Student` |
| `HABITAT` | `VRChat` |
| `LANGUAGE` | `日本語` |
| `CURRENTLY` | `Minecraft にも手を付けたり` |
| `LINK` | `github.com/na2gumo ↗`（シアン、ホバーでライム＋下線） |

- 行ホバー: 左に 3px のライム線が `scaleY(0→1)` で伸び、背景 `--panel-2`、ラベルがライムになる。`padding-left` が 0 → 12px に動く

**テーブルの下: BIO**（`margin-top: 28px`）

- mono ラベル `// BIO`
- 本文「VRChatに生息している学生です。最近はMinecraftにも手を付けたり。」（`--font-sans` 1.05rem）
- 左にピンクの 3px 線、`padding-left: 18px`

**その下: ステータス 3 枚**（横並び、モバイルは縦、`gap: 10px`、`margin-top: 28px`）。小さいノッチパネル `--panel-2`、`--notch: 10px`

| ラベル | 値 |
| --- | --- |
| `PUSH / 7D` | `pushesThisWeek`（Anton 2.2rem、ライム） |
| `EVENTS` | `items.length`（Anton 2.2rem、ink） |
| `LAST SIGNAL` | 最新アイテムの `createdAt` を JST で `MM/DD HH:mm`（Anton 2.2rem、ink） |

取得失敗時はどれも `--`（dim）。

### 3.3 CH.02 LOADOUT（`#loadout`、`src/components/loadout/loadout.tsx`）

SectionHead: `02` / `LOADOUT` / `装備スキル`。

**データ**（コンポーネント先頭の配列。ユーザーが後で書き換えやすいように）:

| # | name | tag | note |
| --- | --- | --- | --- |
| 01 | Web Dev | `SKILL` | このサイトも Qwik + Cloudflare Pages 製。 |
| 02 | Unity | `SKILL` | スキル・興味 |
| 03 | Linux | `SKILL` | スキル・興味 |
| 04 | CyberSecurity | `SKILL` | スキル・興味 |
| 05 | Privacy | `SKILL` | スキル・興味 |
| 06 | VRChat | `HABITAT` | 生息地。 |
| 07 | Minecraft | `NEW` | 最近手を付けた。 |

**事実以外は書かない。** レベルや熟練度の数値は作らない。

レイアウト: デスクトップ（≥ 960px）は 2 カラム `minmax(0, 1.25fr) minmax(0, 1fr)`、gap 32px。左が **ディスプレイ**、右が **スロット一覧**。モバイルは スロット一覧（横スクロールのチップ列）→ ディスプレイ。

**スロット一覧** `role="tablist"`、各スロットは `button role="tab"`:

- 1 行の高さ 64px、`--panel` 背景、`border-bottom: 1px solid var(--line)`、`display: grid; grid-template-columns: 48px 1fr auto; align-items: center; padding-inline: 18px`
- 番号 mono（dim）、name は Anton 1.6rem、右端に tag（`.mono-label`。`NEW` だけピンク、`HABITAT` はシアン）
- ホバー: 背景 `--panel-2`、name が 6px 右へ、左端に 4px のピンクの縦線
- **選択中**: ライム塗り、全テキスト黒、`transform: skewX(-8deg) translateX(14px)`、`--ease-pop` 0.25s。中のテキストは skew を戻さない（傾いたままでよい）
- キー操作: セクションが 40% 以上見えているとき、数字キー `1`〜`7` で選択、`↑`/`↓` で前後（端でループ）。修飾キー付きは無視。フォーカスがフォームにあるときは無視
- スロット一覧の下に `EQUIPPED 7 / 9` の mono と、9 マスのメーター（各 18×8px、7 つがライム、2 つが `--line` の枠だけ）
- モバイル: 一覧は横並びのチップ（Anton 1.1rem、`padding: 8px 14px`、skew）、横スクロール（`scroll-snap`）、番号と tag は出さない

**ディスプレイ** `role="tabpanel"`: ノッチパネル（`--notch: 28px`）、`--panel`、`min-height: 420px`、`padding: 36px`、`position: relative; overflow: hidden`

- 背景に巨大な番号（Anton 22rem、白抜き `--line-strong` の stroke、右下にはみ出す）
- 左上: `.sticker` で tag（`SKILL` ライム／`HABITAT` シアン塗り／`NEW` ピンク）＋ mono `SLOT 01`
- 中央左: **アイコン**（96×96、SVG、ライムの 2.5px 線、`fill: none`、`stroke-linecap: square`）
  - Web Dev: `</>`（山括弧 2 つとスラッシュ）
  - Unity: アイソメトリックの立方体（6 角形の外形 + 中心から 3 本）
  - Linux: 角丸でない四角いターミナル窓 + 中に `>_`
  - CyberSecurity: 盾 + 中にチェック
  - Privacy: 南京錠
  - VRChat: VR ゴーグル（横長の角丸四角 + 2 つのレンズ穴 + 左右のベルト）
  - Minecraft: アイソメトリックの立方体の上面だけジグザグ（草ブロック）
- その下: name（Anton `clamp(3rem, 6vw, 5rem)`）、note（`--font-sans` 1rem、dim）
- 下端: mono `PRESS 1-7 / ↑↓ TO SWITCH`（dim、モバイルでは非表示）
- **切り替え演出**（選択が変わるたび、`key` で再マウントして CSS アニメーション）:
  - アイコン・name・note が 0.28s のグリッチイン: 最初の 2 ステップは `clip-path: inset(40% 0 35% 0)` と `translate: 8px 0`（ピンクの `text-shadow: -3px 0 var(--pink), 3px 0 var(--cyan)`）、最後に元へ
  - 背景の番号が下から 30px スライドイン
  - ディスプレイ左端に 1 フレームだけライムのフラッシュ（`::after` で幅 100% → 0 のライムの帯が左から右へ抜ける、0.35s）

### 3.4 CH.03 ACTIVITY LOG（`#log`、`src/components/activity-log/activity-log.tsx`）

SectionHead: `03` / `ACTIVITY LOG` / `活動ログ` / meta `SOURCE: api.github.com — CACHE 15MIN`。

**上段: HUD メーター 3 枚**（デスクトップ 3 カラム `1fr 1.6fr 1fr`、モバイル縦）。各ノッチパネル `--panel`、`--notch: 14px`、`padding: 22px`、上に `.mono-label`、`data-reveal="up"`（i 0〜2）

1. `PUSHES / 7D`: Anton 5.5rem、ライム。reveal で 0 からカウントアップ（0.9s、easeOut、`requestAnimationFrame`）。下に mono `LAST 7 DAYS`
2. `14-DAY SIGNAL`: 棒グラフ。14 本（`pushesByDay`、古い順）、高さ 110px のエリア、棒の幅は均等・gap 4px
   - 高さ `max(3px, n / max * 100%)`、色 ライム、**今日（最後）の棒だけピンク**、0 の日は `--line-strong` の 3px
   - reveal で棒が下から伸びる（`scaleY 0→1`、`transform-origin: bottom`、`--i` で 30ms ずつ）
   - 棒ホバー: 棒が ink に、上に小さいツールチップ（mono 0.7rem、黒地ライム枠）`{n} PUSH · {d}D AGO`（今日は `TODAY`）
   - 下に軸ラベル mono 0.65rem dim: 左 `-13D`、右 `TODAY`
3. `LAST SIGNAL`: 最新アイテムの相対時刻（`3H AGO` / `2D AGO` / `JUST NOW`）を Anton 3rem ink、その下に mono でリポジトリ名（`na2gumo/` を除く）

**下段: ログ端末** `.term`（`margin-top: 24px`、ノッチパネル `--notch: 18px`、`--panel`、`data-reveal`）

- **タイトルバー**（高さ 36px、`--panel-2`、`padding-inline: 16px`）: 左に 3 つの 10px の四角（ライム・オレンジ・ピンク）、中央 mono `~/na2gumo/activity.log`、右 mono `TAIL -F`（ライム、点滅）
- **行**（`<details>`、最大 12 件）: `summary` は `display: grid; grid-template-columns: 108px 92px minmax(0, 1fr) auto 20px; gap: 16px; align-items: center; padding: 12px 18px; border-bottom: 1px solid var(--line)`、mono 0.85rem
  - 1 列目: 時刻 `[10/01 14:22]`（JST、dim）
  - 2 列目: 種別バッジ（skew ステッカー、mono 0.7rem 太め、幅いっぱい中央寄せ）:
    | type | 表示 | 色 |
    | --- | --- | --- |
    | Push | `PUSH` | ライム塗り |
    | PR | `PR` | シアン塗り |
    | Issue | `ISSUE` | オレンジ塗り |
    | Create | `CREATE` | ピンク塗り |
    | Release | `RELEASE` | ライム枠 |
    | Fork | `FORK` | シアン枠 |
    | Star | `STAR` | オレンジ枠 |
    | Delete / Comment / その他 | 大文字の type | dim 枠 |
  - 3 列目: リポジトリ名（`na2gumo/` を除く。ブランチ `(main)` は dim）、ink、はみ出しは `…`
  - 4 列目: 要約。Push は `{count} COMMITS`（1 なら COMMIT）、他は `detail` を 40 字で切る。dim
  - 5 列目: `▸`。開くと 90° 回転してライム
  - ホバー: 背景 `--panel-2`、左に 3px ライム線、`▸` が 3px 右へ
  - 行は `data-reveal="up"` で `--i` = 行番号（最大 12）
  - デフォルトの disclosure マーカーは消す（`list-style: none` と `::-webkit-details-marker`）
  - **モバイル（< 720px）**: 2 段組。1 段目 バッジ＋時刻、2 段目 リポジトリ名＋要約（要約は 1 行で切る）
- **展開部**: `padding: 6px 18px 16px 142px`（モバイル 18px）。`detailsList` を最大 8 件、各行 `sha` チップ（mono 0.72rem、ライムの 1px 枠、ライム文字）＋メッセージ（リンク、ink 0.85、ホバーでライム）。9 件以上は `+{n} MORE`（dim）。`detailsList` が無く `detail` があればそれを表示。行全体のリンク先 `targetUrl` は末尾に `OPEN ↗` として置く
- **末尾**: プロンプト行 `na2gumo@na2zora:~$ ` ＋ 点滅ブロックカーソル（ライム）。その下の行に右寄せで `.btn--ghost` `FULL LOG ON GITHUB ↗`
- **取得失敗 / 0 件**: 行の代わりに `[ERR] SIGNAL LOST — GitHub に接続できませんでした。`（オレンジ、mono）と、`FULL LOG ON GITHUB ↗`

日時はすべて **Asia/Tokyo** で整形する（`Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", ... })`）。相対時刻はサーバー描画時点の `Date.now()` 基準でよい。

---

## 4. データ

- `src/routes/layout.tsx` の `useGitHubFeed`（routeLoader$）→ `GitHubFeed`（`src/lib/github.ts`）
  ```ts
  interface GitHubFeed {
    ok: boolean;
    items: GitHubActivityItem[];   // 新しい順、最大 12
    pushesThisWeek: number;        // 直近 7 日の PushEvent 数
    pushesByDay: number[];         // 直近 14 日、古い順。失敗時は []
  }
  ```
- `src/routes/api/github-events/index.ts` は `items` だけ返す（変更不要）

## 5. head

- title: `なつぐも (na2gumo) — NA2ZORA TERMINAL`
- description: `開発者 なつぐも (na2gumo) のポートフォリオ。`
- `theme-color`: `#09090b`
- router-head: Anton の woff2 を preload（`/fonts/common/Anton.woff2`、実際のファイル名は fonts.css を確認）。`html.js` を付けるインラインスクリプトと、BOOT のフラグを見て `html.booted boot-done` を付けるインラインスクリプト（同じ 1 本でよい。`<head>` の先頭寄り）

## 6. 品質

- `pnpm build`（client / server / types / lint）が通ること。lint は error 0（`useVisibleTask$` の warning は可）
- 幅 360px で横スクロールが出ないこと。ガターは最小 16px
- `prefers-reduced-motion: reduce`: BOOT なし、テロップ停止、グリッチなし、reveal は最初から表示、パララックス・カーソルなし
- アニメーションは `transform` / `opacity` / `clip-path` だけ。`scroll` イベントは `passive` ＋ rAF で間引く
- テストコードは書かない
