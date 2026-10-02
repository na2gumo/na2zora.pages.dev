import { component$, useId } from "@builder.io/qwik";

type Circle = [cx: number, cy: number, r: number];

// 入道雲: 横に広い土台から、塔のように盛り上がる
const TOWER: Circle[] = [
  // 頂上
  [500, 70, 58], [440, 125, 62], [565, 118, 64], [495, 120, 80],
  // 上部
  [385, 245, 82], [455, 190, 95], [550, 182, 92], [615, 245, 82],
  [330, 380, 92], [410, 318, 110], [520, 300, 120], [612, 352, 102],
  // 中腹
  [250, 520, 105], [340, 470, 120], [460, 430, 140], [580, 455, 130],
  [690, 505, 115], [785, 548, 96],
  // 土台（下は画面外まで伸ばす）
  [60, 650, 90], [190, 620, 120], [330, 600, 140], [490, 605, 150],
  [650, 595, 140], [800, 620, 125], [930, 650, 95],
  [120, 760, 130], [380, 770, 160], [640, 770, 160], [880, 760, 130],
];

// ちぎれ雲
const PUFF: Circle[] = [
  [108, 58, 46], [166, 52, 42], [62, 80, 34], [218, 74, 34],
  [140, 86, 38], [96, 92, 30], [190, 92, 32], [258, 92, 22],
];

const SHAPES = {
  tower: { circles: TOWER, w: 1000, h: 720 },
  puff: { circles: PUFF, w: 300, h: 130 },
};

interface CloudProps {
  variant: "tower" | "puff";
  class?: string;
}

/**
 * 丸を重ねて作る雲。上の丸から順に、影 → 本体 → ハイライトを重ねていくので、
 * 手前（下）のもこもこが奥のもこもこに影を落として立体に見える。
 * 色は CSS 変数 --cloud-hi / --cloud-lo に従い、時刻に合わせて白 → 茜色 → 藍色へ変わる。
 */
export const Cloud = component$<CloudProps>(({ variant, class: cls }) => {
  const id = useId();
  const { circles, w, h } = SHAPES[variant];
  const tower = variant === "tower";
  const ordered = [...circles].sort((a, b) => a[1] - b[1]);

  return (
    <svg
      class={["cloud", `cloud--${variant}`, cls]}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--cloud-hi)" }} />
          <stop offset={tower ? 0.45 : 0.3} style={{ stopColor: "var(--cloud-hi)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--cloud-hi) 45%, var(--cloud-lo))" }} />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" />
          <stop offset={tower ? 0.66 : 0.72} stop-color="#fff" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-100" y="-100" width={w + 200} height={h + 100}>
          <rect x="-100" y="-100" width={w + 200} height={h + 100} fill={`url(#${id}-fade)`} />
        </mask>
        <filter id={`${id}-fluff`} filterUnits="userSpaceOnUse" x="-60" y="-60" width={w + 120} height={h + 120}>
          <feTurbulence type="fractalNoise" baseFrequency={tower ? 0.014 : 0.035} numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale={tower ? 26 : 10} />
          <feGaussianBlur stdDeviation={tower ? 3 : 0.9} />
        </filter>
        <filter id={`${id}-soft`} filterUnits="userSpaceOnUse" x="-60" y="-60" width={w + 120} height={h + 120}>
          <feGaussianBlur stdDeviation={tower ? 14 : 5} />
        </filter>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g filter={`url(#${id}-fluff)`}>
          {ordered.map(([cx, cy, r], i) => (
            <g key={i}>
              {/* 影（右下にずらす） */}
              <circle cx={cx + r * 0.1} cy={cy + r * 0.12} r={r} style={{ fill: "var(--cloud-lo)" }} />
              {/* 本体 */}
              <circle cx={cx - r * 0.02} cy={cy - r * 0.03} r={r * 0.94} fill={`url(#${id}-body)`} />
            </g>
          ))}
        </g>
        {/* 日の当たる左上をふんわり明るく */}
        <g filter={`url(#${id}-soft)`} style={{ fill: "var(--cloud-hi)" }} opacity="0.75">
          {ordered.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx - r * 0.22} cy={cy - r * 0.28} r={r * 0.5} />
          ))}
        </g>
      </g>
    </svg>
  );
});
