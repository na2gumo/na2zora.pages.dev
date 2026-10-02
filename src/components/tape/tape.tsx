import { component$ } from "@builder.io/qwik";

interface TapeProps {
  /** テープに流す語 */
  items: string[];
  /** 語の区切り。"star" なら ✦ 形の図形、それ以外はその文字列 */
  sep?: string;
  /** 見た目のバリエーション（.tape--reverse / .tape--stripe / .tape--dark など） */
  class?: string;
  /** 1 つ分の中身を何回繰り返すか（画面幅より長くするため） */
  repeat?: number;
  /** 1 周にかかる時間（例: "28s"） */
  speed?: string;
}

/**
 * 警告テープ。中身を 2 回並べ、translateX(-50%) までのループで途切れず流す。
 * 装飾なので読み上げからは外す（同じ内容は本文側にある）。
 */
export const Tape = component$<TapeProps>(({ items, sep = "star", class: cls, repeat = 3, speed }) => {
  const half = Array.from({ length: repeat }, (_, r) =>
    items.map((item, i) => (
      <span key={`${r}-${i}`} class="tape__item">
        {item}
        {sep === "star" ? <i class="star" /> : sep}
      </span>
    )),
  );

  return (
    <div class={["tape", cls]} style={speed ? { "--tape-speed": speed } : undefined} aria-hidden="true">
      <div class="tape__track">
        <div class="tape__half">{half}</div>
        <div class="tape__half">{half}</div>
      </div>
    </div>
  );
});
