/**
 * 16x16 のドット絵。1 文字 = 1 ピクセルで、"." は透明。
 * 色は PALETTE の文字に対応する。
 */
export const PALETTE: Record<string, string> = {
  k: "#1b1b22", // 輪郭
  w: "#f1f1f1",
  s: "#c9ced6", // 銀
  b: "#3b82f6", // 青
  r: "#ef4444",
  y: "#facc15",
  g: "#22c55e",
  t: "#e7e9ee", // 立方体の上面
  l: "#9ca3af", // 立方体の左面
  d: "#4b5563", // 立方体の右面
  c: "#22d3ee", // レンズ
  o: "#b7791f", // 金の影
  G: "#5fb43a", // 草
  H: "#4a9a2c", // 草（濃）
  e: "#8b5a2b", // 土
  E: "#6b4220", // 土（濃）
  a: "#a8763f", // 土の粒
  p: "#f59e0b", // 足・くちばし
  x: "#1d4ed8", // 盾（濃）
};

export const SPRITES = {
  web: [
    "................",
    ".kkkkkkkkkkkkkk.",
    ".kbbbbbbbbbbbbk.",
    ".kbrbybgbbbbbbk.",
    ".kkkkkkkkkkkkkk.",
    ".kwwwwwwwwwwwwk.",
    ".kwwwcwwwcwcwwk.",
    ".kwwcwwwwcwwcwk.",
    ".kwcwwwwcwwwwck.",
    ".kwwcwwcwwwwcwk.",
    ".kwwwcwcwwwcwwk.",
    ".kwwwwwwwwwwwwk.",
    ".kwwwwwwwwwwwwk.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
  ],
  cube: [
    "................",
    "......kkkk......",
    "....kkttttkk....",
    "..kkttttttttkk..",
    ".kttttttttttttk.",
    ".kkkttttttttkkk.",
    ".kllkkttttkkddk.",
    ".kllllkkkkddddk.",
    ".klllllkkdddddk.",
    ".klllllkkdddddk.",
    ".klllllkkdddddk.",
    ".klllllkkdddddk.",
    "..kklllkkdddkk..",
    "....kklkkdkk....",
    "......kkkk......",
    "................",
  ],
  penguin: [
    "................",
    "......kkkk......",
    ".....kkkkkk.....",
    ".....kwkkwk.....",
    ".....kkppkk.....",
    "....kkwwwwkk....",
    "...kkwwwwwwkk...",
    "...kwwwwwwwwk...",
    "..kkwwwwwwwwkk..",
    "..kkwwwwwwwwkk..",
    "..kkwwwwwwwwkk..",
    "...kwwwwwwwwk...",
    "...kkwwwwwwkk...",
    "..pppkkkkkkppp..",
    "..pppp....pppp..",
    "................",
  ],
  shield: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kssssssxxxxk..",
    "..kssssssxxxxk..",
    "..kssssssxxxxk..",
    "..kssssssxxxxk..",
    "..kxxxxxxssssk..",
    "..kxxxxxxssssk..",
    "..kxxxxxxssssk..",
    "...kxxxxxsssk...",
    "...kxxxxxsssk...",
    "....kxxxxssk....",
    ".....kxxxsk.....",
    "......kxsk......",
    ".......kk.......",
    "................",
  ],
  lock: [
    "................",
    "......kkkk......",
    ".....kssssk.....",
    "....kskkkksk....",
    "....ksk..ksk....",
    "....ksk..ksk....",
    "..kkkkkkkkkkkk..",
    "..kwwwwwwwwwwk..",
    "..kyyyyyyyyyyk..",
    "..kyyyykkyyyyk..",
    "..kyyyykkyyyyk..",
    "..kyyyyykyyyyk..",
    "..kyyyyyyyyyyk..",
    "..kooooooooook..",
    "..kkkkkkkkkkkk..",
    "................",
  ],
  headset: [
    "................",
    "................",
    "................",
    "..kkkkkkkkkkkk..",
    ".kddddddddddddk.",
    "kdccccddddccccdk",
    "kdcwccddddcwccdk",
    "kdccccdkkdccccdk",
    "kddddddkkddddddk",
    ".kddddk..kddddk.",
    "..kkkk....kkkk..",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  grass: [
    "................",
    "......kkkk......",
    "....kkGGHGkk....",
    "..kkGGGGGGHGkk..",
    ".kGHGGGGGGGGGGk.",
    ".kkkGGGGHGGGkkk.",
    ".kGGkkGGGGkkHHk.",
    ".kGeGGkkkkHHEHk.",
    ".kGeeeGkkEEHEEk.",
    ".keeaeekkEEEaEk.",
    ".keeeeekkEaEEEk.",
    ".kaeeeekkEEEEEk.",
    "..kkeeakkEEEkk..",
    "....kkekkEkk....",
    "......kkkk......",
    "................",
  ],
} as const;

export type SpriteName = keyof typeof SPRITES;

export const HEART = [
  ".kk.kk.",
  "krrkrrk",
  "krwrrrk",
  "krrrrrk",
  ".krrrk.",
  "..krk..",
  "...k...",
];

export interface Rect {
  x: number;
  y: number;
  w: number;
  fill: string;
}

/** 横に並んだ同色ピクセルを 1 つの rect にまとめる */
export function toRects(rows: readonly string[]): Rect[] {
  const rects: Rect[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let run = 1;
      while (row[x + run] === ch) run++;
      if (ch !== ".") rects.push({ x, y, w: run, fill: PALETTE[ch] });
      x += run;
    }
  });
  return rects;
}
