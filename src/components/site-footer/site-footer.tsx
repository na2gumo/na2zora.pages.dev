import { $, component$ } from "@builder.io/qwik";
import { Tape } from "../tape/tape";

const TAPE_ITEMS = ["END OF TRANSMISSION", "NA2ZORA TERMINAL", "SEE YOU NEXT SESSION"];

/** ティッカーの流れ方を変える（ホバーで 1/4 の速さ） */
const setTickerRate = (el: HTMLElement, rate: number) => {
  el.querySelectorAll<HTMLElement>(".footer__ticker-track").forEach((track) => {
    track.getAnimations().forEach((a) => {
      a.playbackRate = rate;
    });
  });
};

/**
 * END OF TRANSMISSION: フッター。
 */
export const SiteFooter = component$(() => {
  const year = new Date().getFullYear();

  // REBOOT: BOOT を最初から再生する（フラグの削除と再マウントは Boot 側が受け持つ）
  const reboot = $(() => {
    window.dispatchEvent(new CustomEvent("na2zora:reboot"));
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  const slow = $((_: Event, el: HTMLElement) => setTickerRate(el, 0.25));
  const normal = $((_: Event, el: HTMLElement) => setTickerRate(el, 1));

  return (
    <footer class="footer">
      <Tape items={TAPE_ITEMS} class="tape--dark" speed="32s" repeat={5} />

      {/* 巨大テロップ。白抜きで左へ流れ、ホバーでゆっくり + ライム塗り */}
      <div class="footer__ticker" onMouseEnter$={slow} onMouseLeave$={normal} aria-hidden="true">
        <div class="footer__ticker-track">
          <span class="footer__ticker-text">
            END OF TRANSMISSION <i class="star" />
          </span>
          <span class="footer__ticker-text">
            END OF TRANSMISSION <i class="star" />
          </span>
        </div>
      </div>
      <p class="visually-hidden">END OF TRANSMISSION</p>

      <div class="footer__body">
        <div class="footer__col footer__col--meta mono-label">
          <p class="footer__line footer__line--ink">NA2ZORA TERMINAL</p>
          <p class="footer__line">© {year} na2gumo</p>
          <p class="footer__line">Built with Qwik + Cloudflare Pages</p>
        </div>

        <div class="footer__col footer__col--link">
          <a class="footer__link" href="https://github.com/na2gumo" target="_blank" rel="noopener noreferrer">
            GITHUB <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="footer__col footer__col--reboot">
          <button type="button" class="btn btn--ghost" onClick$={reboot}>
            <span class="btn__arrow btn__arrow--up">↑</span> REBOOT
          </button>
        </div>
      </div>
    </footer>
  );
});
