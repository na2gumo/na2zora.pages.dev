// 日時・リポジトリ名まわりの整形ヘルパー（日時はすべて Asia/Tokyo）

const JST = "Asia/Tokyo";

// `Intl.DateTimeFormat` の生成は重いので、モジュールで 1 回だけ作る
const stampFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST,
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  // 24:00 表記にならないよう h23 を指定する
  hourCycle: "h23",
});

/** ISO 8601 を JST の `MM/DD HH:mm` にする。不正な値は `--` */
export function formatJstStamp(iso: string): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "--";
  const parts = Object.fromEntries(
    stampFormatter.formatToParts(time).map((p) => [p.type, p.value])
  );
  return `${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}

/** 相対時刻（`JUST NOW` / `12M AGO` / `3H AGO` / `2D AGO`）。不正な値は `--` */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "--";
  const sec = Math.max(0, Math.floor((now - time) / 1000));
  if (sec < 60) return "JUST NOW";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}M AGO`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}H AGO`;
  return `${Math.floor(hour / 24)}D AGO`;
}

/** `na2gumo/foo (main)` を `{ repo: "foo", branch: "main" }` に分解する */
export function splitRepoName(repoName: string): { repo: string; branch?: string } {
  const m = /^(.*?)(?: \((.+)\))?$/.exec(repoName);
  const full = m?.[1] ?? repoName;
  return {
    repo: full.replace(/^na2gumo\//, ""),
    branch: m?.[2],
  };
}

/** 指定文字数で切って `…` を付ける（サロゲートペアを壊さないよう配列化して数える） */
export function truncate(text: string, max: number): string {
  const chars = Array.from(text);
  return chars.length > max ? `${chars.slice(0, max).join("")}…` : text;
}
