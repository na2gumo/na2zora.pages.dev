import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Tape } from "../tape/tape";

interface HeroProps {
  /** GitHub の取得に成功したか */
  ok: boolean;
  /** 直近 7 日の Push 数 */
  pushes: number;
}

const TAPE = ["KEEP OUT"];

/**
 * CH.00 ヒーロー。名前・ステッカー・モニター・警告テープ。
 */
export const Hero = component$<HeroProps>(({ ok, pushes }) => {
  // マウスに合わせてモニターを傾けるパララックス（pointer: fine のみ）
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      if (!matchMedia("(pointer: fine)").matches) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const monitor = document.querySelector<HTMLElement>(".monitor");
      if (!monitor) return;

      // 目標（-1〜1）と現在値
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let raf = 0;

      const loop = () => {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        monitor.style.transform = `translate(${-x * 14}px, ${-y * 14}px) rotateX(${y * 6}deg) rotateY(${-x * 8}deg)`;
        // 背面のライムは逆方向へ
        monitor.style.setProperty("--bx", `${x * 8}px`);
        monitor.style.setProperty("--by", `${y * 8}px`);
        if (Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001) {
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(loop);
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(loop);
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      cleanup(() => {
        if (raf) cancelAnimationFrame(raf);
        document.removeEventListener("pointermove", onMove);
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <section id="top" class="hero" aria-label="トップ">
      <div class="hero__grid">
        {/* ---- 左: テキスト ---- */}
        <div class="hero__text">
          <div class="hero__id" data-reveal="up" style={{ "--i": 0 }}>
            <span class="sticker sticker--lime hero__ch">
              <span>CH.00</span>
            </span>
            <span class="mono-label hero__id-text">
              <span class="dot dot--blink" aria-hidden="true" /> AGENT ONLINE — ID: na2gumo
            </span>
          </div>

          <div class="hero__name-wrap" data-reveal style={{ "--i": 1 }}>
            <h1 class="hero__name" data-text="NA2GUMO" aria-label="なつぐも (na2gumo)">
              NA2GUMO
            </h1>
          </div>

          <div class="hero__jp-wrap" data-reveal="pop" style={{ "--i": 3 }}>
            <p class="hero__jp">
              <span>なつぐも</span>
            </p>
          </div>

          <ul class="hero__stickers">
            <li data-reveal="pop" style={{ "--i": 4 }}>
              <span class="sticker sticker--lime">
                <span>DEVELOPER</span>
              </span>
            </li>
            <li data-reveal="pop" style={{ "--i": 5 }}>
              <span class="sticker sticker--outline">
                <span>STUDENT</span>
              </span>
            </li>
            <li data-reveal="pop" style={{ "--i": 6 }}>
              <span class="sticker sticker--pink">
                <span>VRCHAT RESIDENT</span>
              </span>
            </li>
          </ul>

          <div class="hero__actions" data-reveal="up" style={{ "--i": 8 }}>
            <a href="#agent" class="btn btn--primary">
              OPEN AGENT FILE <span class="btn__arrow">↓</span>
            </a>
            <a href="https://github.com/na2gumo" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
              GITHUB <span class="btn__arrow">↗</span>
            </a>
          </div>
        </div>

        {/* ---- 右: モニター ---- */}
        <div class="hero__monitor" data-reveal="up" style={{ "--i": 3 }}>
          <div class="monitor">
            <div class="monitor__back" aria-hidden="true" />
            <div class="monitor__body">
              <div class="monitor__bar mono-label">
                <span>CAM-01</span>
                <span class="monitor__live">
                  <span class="dot dot--pink dot--blink" aria-hidden="true" /> LIVE
                </span>
              </div>

              <div class="monitor__screen">
                <picture>
                  <source srcset="/avatar.avif" type="image/avif" />
                  <img
                    class="monitor__img"
                    src="https://avatars.githubusercontent.com/u/266047745?v=4"
                    alt="na2gumo のアバター"
                    width="440"
                    height="440"
                    decoding="async"
                  />
                </picture>
                <span class="monitor__tint" aria-hidden="true" />
                <span class="monitor__scan" aria-hidden="true" />
                <span class="monitor__sweep" aria-hidden="true" />
                <span class="monitor__corners" aria-hidden="true" />
                <div class="monitor__cap">
                  <p class="monitor__cap-name">NA2GUMO</p>
                  <p class="monitor__cap-class mono-label">CLASS: DEVELOPER</p>
                </div>
              </div>

              <div class="monitor__bar mono-label">
                <span class="monitor__signal">
                  SIGNAL
                  <span class="monitor__meter" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i class="is-off" />
                  </span>
                </span>
                <span>PUSH.7D {ok ? pushes : "--"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero__scroll mono-label" aria-hidden="true">
        SCROLL <span class="hero__scroll-arrow">▼</span>
      </div>

      {/* ---- 下端: 警告テープ 2 本 ---- */}
      <div class="hero__tapes">
        <div class="hero__tape hero__tape--a" data-reveal="left" style={{ "--i": 6 }}>
          <Tape items={TAPE} repeat={8} speed="28s" />
        </div>
        <div class="hero__tape hero__tape--b" data-reveal="right" style={{ "--i": 6 }}>
          <Tape items={TAPE} class="tape--stripe tape--reverse" speed="36s" repeat={8} />
        </div>
      </div>
    </section>
  );
});
