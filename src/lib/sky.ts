/**
 * 「夏の一日」の空の色と天体の位置を、時刻（時間単位の小数、例: 18.5 = 18:30）から計算する。
 * ページのスクロール位置 → 時刻 → 空の見た目、の後ろ半分を担当する。
 */

type RGB = [number, number, number];

interface SkyKey {
  t: number;
  top: string;
  mid: string;
  low: string;
  cloudHi: string;
  cloudLo: string;
}

// 昼 → 夕焼け → 夜 のキーフレーム。間は線形補間する。
const KEYS: SkyKey[] = [
  { t: 11, top: "#1a5ed6", mid: "#3c92ee", low: "#b4dcff", cloudHi: "#ffffff", cloudLo: "#b3c7e4" },
  { t: 14.5, top: "#1959cf", mid: "#3a8bea", low: "#bfe1ff", cloudHi: "#ffffff", cloudLo: "#b0c3e0" },
  { t: 16.6, top: "#2c5fb6", mid: "#6b9fd9", low: "#f2d7aa", cloudHi: "#fff3e0", cloudLo: "#c2a5a8" },
  { t: 18, top: "#2a3c8c", mid: "#b8667f", low: "#ffae6a", cloudHi: "#ffe0c6", cloudLo: "#a35f7c" },
  { t: 18.8, top: "#1b2262", mid: "#683e86", low: "#ff7b5a", cloudHi: "#f6a68e", cloudLo: "#5b3a6d" },
  { t: 19.6, top: "#0c1340", mid: "#25286a", low: "#5a3a78", cloudHi: "#6a5a8b", cloudLo: "#2a2550" },
  { t: 21, top: "#050a26", mid: "#0b1440", low: "#1a2560", cloudHi: "#383f6d", cloudLo: "#161b3e" },
  { t: 24, top: "#02040f", mid: "#060a22", low: "#0c1236", cloudHi: "#262b52", cloudLo: "#0e1230" },
];

export const DAY_START = 12;
export const DAY_END = 24;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mix = (a: RGB, b: RGB, k: number): string =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(" ")})`;

export interface SkyState {
  top: string;
  mid: string;
  low: string;
  cloudHi: string;
  cloudLo: string;
  /** 0 = 昼, 1 = 夜。星の明るさに使う */
  night: number;
  /** 0..1 夕焼けの強さ */
  dusk: number;
  sunX: number;
  sunY: number;
  sunOpacity: number;
  sunColor: string;
  moonX: number;
  moonY: number;
  moonOpacity: number;
}

export function skyAt(t: number): SkyState {
  let i = KEYS.findIndex((k) => k.t > t);
  if (i === -1) i = KEYS.length - 1;
  const a = KEYS[Math.max(0, i - 1)];
  const b = KEYS[i];
  const k = b.t === a.t ? 1 : clamp((t - a.t) / (b.t - a.t));
  const pick = (key: keyof Omit<SkyKey, "t">) => mix(hex(a[key]), hex(b[key]), k);

  // 太陽: 右上から右下の地平線へ沈む
  const sp = clamp((t - 11) / (18.95 - 11));
  const sunColor = mix(hex("#fff8e1"), hex("#ff6a3d"), smoothstep(15.5, 18.8, t));

  // 月: 19 時半ごろ左下から昇る
  const mp = clamp((t - 19.3) / (24 - 19.3));
  const moonRise = 1 - Math.pow(1 - mp, 2.2);

  return {
    top: pick("top"),
    mid: pick("mid"),
    low: pick("low"),
    cloudHi: pick("cloudHi"),
    cloudLo: pick("cloudLo"),
    night: smoothstep(18.9, 20.6, t),
    dusk: smoothstep(16, 18.2, t) * (1 - smoothstep(19, 20, t)),
    sunX: 70 + 22 * sp,
    sunY: 11 + 86 * Math.pow(sp, 2.3),
    sunOpacity: 1 - smoothstep(18.75, 19.05, t),
    sunColor,
    moonX: 13 + 12 * mp,
    moonY: 104 - 84 * moonRise,
    moonOpacity: smoothstep(19.3, 20.2, t),
  };
}

/** 18.5 → "18:30"（24 時以降も 25:10 のように数え続ける） */
export function formatSkyTime(t: number): string {
  const total = Math.round(t * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export type WeatherKind = "clear" | "sunny" | "cloudy" | "rain" | "unknown";

export interface Weather {
  kind: WeatherKind;
  label: string;
  icon: string;
}

/** 直近 7 日間の push 回数から今週の空模様を決める */
export function weatherFromPushes(ok: boolean, pushes: number): Weather {
  if (!ok) return { kind: "unknown", label: "観測できず", icon: "？" };
  if (pushes >= 8) return { kind: "clear", label: "快晴", icon: "☀" };
  if (pushes >= 3) return { kind: "sunny", label: "晴れ", icon: "☀" };
  if (pushes >= 1) return { kind: "cloudy", label: "くもり", icon: "☁" };
  return { kind: "rain", label: "雨", icon: "☂" };
}
