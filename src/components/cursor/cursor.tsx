import { component$, useVisibleTask$ } from "@builder.io/qwik";

/** 乗ると照準が広がる要素 */
const HOVER_SELECTOR = "a, button, summary, [data-cursor]";

/**
 * 追加の照準カーソル。ネイティブカーソルは消さない。
 * (pointer: fine) かつ reduced-motion でないときだけ動く。
 */
export const Cursor = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      if (!matchMedia("(pointer: fine)").matches) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const el = document.querySelector<HTMLElement>(".cursor");
      if (!el) return;

      // 目標位置と表示位置（lerp 0.2 で追従）
      let tx = -100;
      let ty = -100;
      let x = tx;
      let y = ty;
      let raf = 0;
      let seen = false;

      const loop = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        // 中心をポインタ位置に合わせる（24px の正方形なので -12px）
        el.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
        // ほぼ追いついたら止める
        if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(loop);
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        tx = e.clientX;
        ty = e.clientY;
        if (!seen) {
          // 最初の 1 回は飛んでこないよう、その場に置く
          seen = true;
          x = tx;
          y = ty;
          el.classList.add("is-on");
        }
        const target = e.target as Element | null;
        const hit = target?.closest?.(HOVER_SELECTOR);
        el.classList.toggle("is-hover", !!hit);
        el.classList.toggle("is-link", !!hit && !!target?.closest?.("a"));
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const onDown = () => el.classList.add("is-down");
      const onUp = () => el.classList.remove("is-down");
      const onLeave = () => el.classList.remove("is-on");
      const onEnter = () => {
        if (seen) el.classList.add("is-on");
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerdown", onDown, { passive: true });
      document.addEventListener("pointerup", onUp, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      document.documentElement.addEventListener("mouseenter", onEnter);

      cleanup(() => {
        if (raf) cancelAnimationFrame(raf);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerdown", onDown);
        document.removeEventListener("pointerup", onUp);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        document.documentElement.removeEventListener("mouseenter", onEnter);
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <div class="cursor" aria-hidden="true">
      <div class="cursor__reticle" />
      <span class="cursor__label">OPEN</span>
    </div>
  );
});
