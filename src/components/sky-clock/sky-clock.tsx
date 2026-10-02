import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { DAY_START, formatSkyTime } from "../../lib/sky";

/** 訪問者の現在時刻を、ページ上の時刻（12:00〜24:00、深夜は 24 時以降）に読み替える */
const realSkyTime = (d: Date) => {
  const h = d.getHours() + d.getMinutes() / 60;
  return h < 5 ? h + 24 : h;
};

/**
 * ヘッダー右上の時計。ページの空が今何時かを表示し、
 * 「いまの空へ」で訪問者の現在時刻と同じ空の位置までスクロールする。
 */
export const SkyClock = component$(() => {
  const timeRef = useSignal<HTMLElement>();
  const iconRef = useSignal<HTMLElement>();
  const now = useSignal("");

  useVisibleTask$(({ cleanup }) => {
    const onTime = (e: Event) => {
      const t = (e as CustomEvent<{ t: number }>).detail.t;
      if (timeRef.value) timeRef.value.textContent = formatSkyTime(t);
      if (iconRef.value) iconRef.value.dataset.phase = t < 19.2 ? "sun" : "moon";
    };
    document.addEventListener("sky:time", onTime);

    const tick = () => {
      const d = new Date();
      now.value = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    tick();
    const id = window.setInterval(tick, 20_000);

    cleanup(() => {
      document.removeEventListener("sky:time", onTime);
      window.clearInterval(id);
    });
  });

  const gotoNow = $(() => {
    const t = realSkyTime(new Date());
    // 朝（5〜12 時）はページにないので昼のいちばん上へ
    document.dispatchEvent(new CustomEvent("sky:goto", { detail: { t: Math.max(t, DAY_START) } }));
  });

  return (
    <div class="sky-clock">
      <span class="sky-clock__face" aria-label="このページの空の時刻">
        <span class="sky-clock__icon" ref={iconRef} data-phase="sun" aria-hidden="true" />
        <span class="sky-clock__time" ref={timeRef}>
          {formatSkyTime(DAY_START)}
        </span>
      </span>
      <button type="button" class="sky-clock__now" onClick$={gotoNow} title="あなたの現在時刻と同じ空までスクロールします">
        いまの空へ{now.value && <span class="sky-clock__real">{now.value}</span>}
      </button>
    </div>
  );
});
