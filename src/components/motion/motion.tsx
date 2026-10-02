import { component$, useVisibleTask$ } from "@builder.io/qwik";

/**
 * [data-reveal] を監視して、画面に入ったら .is-in を付ける（一度出たら戻さない）。
 * DOM は持たない。ヒーロー内の reveal は BOOT が終わる（html.boot-done）まで待つ。
 */
export const Motion = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const root = document.documentElement;
      // BOOT の後に見せたい要素は、boot-done が付くまで保留する
      const pending = new Set<Element>();
      const isGated = (el: Element) => !!el.closest(".hero");
      const bootDone = () => root.classList.contains("boot-done");

      const reveal = (el: Element) => {
        el.classList.add("is-in");
        io.unobserve(el);
      };

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (isGated(entry.target) && !bootDone()) {
              pending.add(entry.target);
              continue;
            }
            reveal(entry.target);
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );

      const observeAll = () => {
        document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
      };
      observeAll();

      // boot-done が付いたら、保留していたものを出す
      const mo = new MutationObserver(() => {
        if (!bootDone()) return;
        pending.forEach(reveal);
        pending.clear();
      });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });

      // REBOOT: ヒーローの登場演出を最初からやり直す
      const onReboot = () => {
        document.querySelectorAll(".hero [data-reveal]").forEach((el) => {
          el.classList.remove("is-in");
          io.observe(el);
        });
      };
      window.addEventListener("na2zora:reboot", onReboot);

      cleanup(() => {
        io.disconnect();
        mo.disconnect();
        pending.clear();
        window.removeEventListener("na2zora:reboot", onReboot);
      });
    },
    { strategy: "document-ready" },
  );

  return <></>;
});
