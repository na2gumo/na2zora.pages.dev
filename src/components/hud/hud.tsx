import { component$, useVisibleTask$ } from "@builder.io/qwik";

/** チャンネル一覧。id は各セクションの id に対応する */
const CHANNELS = [
  { id: "top", num: "00", name: "TOP" },
  { id: "agent", num: "01", name: "AGENT" },
  { id: "loadout", num: "02", name: "LOADOUT" },
  { id: "log", num: "03", name: "LOG" },
] as const;

/**
 * 画面上部に固定する HUD ヘッダー。
 * スクロールスパイ・時計・進捗バーは、毎フレーム Qwik を再描画しないよう DOM を直接更新する。
 */
export const Hud = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const header = document.querySelector<HTMLElement>(".hud");
      const nav = header?.querySelector<HTMLElement>(".hud__nav");
      const indicator = header?.querySelector<HTMLElement>(".hud__indicator");
      const links = Array.from(header?.querySelectorAll<HTMLAnchorElement>(".hud__link") ?? []);
      const label = header?.querySelector<HTMLElement>(".hud__channel");
      const clock = header?.querySelector<HTMLElement>(".hud__clock");
      const bar = header?.querySelector<HTMLElement>(".hud__progress");
      if (!header) return;

      // ---- 時計（JST） ----
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tokyo",
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      let clockTimer: number | undefined;
      const tick = () => {
        if (clock) clock.textContent = fmt.format(new Date());
        // 秒の切り替わりに合わせて次を予約する
        clockTimer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
      };
      tick();

      // ---- インジケーター（現在地の背景。1 個が translate と scale で動く） ----
      let current = -1;
      let placed = false;
      const placeIndicator = () => {
        const link = links[Math.max(current, 0)];
        if (!indicator || !nav || !link || link.offsetWidth === 0) return;
        // 最初の 1 回は transition なしで置く（左端から滑ってくるのを防ぐ）
        if (!placed) indicator.style.transition = "none";
        // 幅 100px の板を scaleX で伸縮させる（width の transition を避ける）
        indicator.style.translate = `${link.offsetLeft}px 0`;
        indicator.style.scale = `${link.offsetWidth / 100} 1`;
        nav.classList.add("hud__nav--ready");
        if (!placed) {
          void indicator.offsetWidth;
          indicator.style.transition = "";
          placed = true;
        }
      };

      const setActive = (index: number) => {
        if (index === current) return;
        current = index;
        links.forEach((l, i) => {
          l.classList.toggle("is-active", i === index);
          if (i === index) l.setAttribute("aria-current", "location");
          else l.removeAttribute("aria-current");
        });
        if (label) label.textContent = `CH.${CHANNELS[index].num} ${CHANNELS[index].name}`;
        placeIndicator();
      };

      // ---- スクロール（passive + rAF で間引く） ----
      let raf = 0;
      const update = () => {
        raf = 0;
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 8);

        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        if (bar) bar.style.transform = `scaleX(${p})`;

        // 画面の上から 35% の位置を通過した最後のセクションが現在地
        const probe = window.innerHeight * 0.35;
        let index = 0;
        CHANNELS.forEach((c, i) => {
          const el = document.getElementById(c.id);
          if (el && el.getBoundingClientRect().top <= probe) index = i;
        });
        // いちばん下まで来たら最後のチャンネルにする
        if (max > 0 && y >= max - 4) index = CHANNELS.length - 1;
        setActive(index);
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      const onResize = () => {
        placeIndicator();
        onScroll();
      };

      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      // フォントが読み込まれるとリンクの幅が変わるので置き直す
      document.fonts?.ready.then(placeIndicator);

      cleanup(() => {
        window.clearTimeout(clockTimer);
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <header class="hud">
      <a href="#top" class="hud__logo" aria-label="NA2ZORA TERMINAL トップへ">
        <span class="sticker sticker--lime hud__mark">
          <span>N2Z</span>
        </span>
        <span class="hud__logo-text">
          <span class="hud__logo-name">NA2ZORA TERMINAL</span>
          <span class="hud__logo-sub">// OPERATOR VIEW</span>
        </span>
      </a>

      <nav class="hud__nav" aria-label="チャンネル">
        <span class="hud__indicator" aria-hidden="true" />
        {CHANNELS.map((c) => (
          <a key={c.id} href={`#${c.id}`} class={["hud__link", c.id === "top" && "is-active"]}>
            <span class="hud__num">{c.num}</span> <span class="hud__name">{c.name}</span>
          </a>
        ))}
      </nav>

      <div class="hud__status">
        <span class="hud__channel">CH.00 TOP</span>
        <span class="hud__online">
          <span class="dot dot--blink" aria-hidden="true" /> ONLINE
        </span>
        <time class="hud__clock">--:--:--</time>
      </div>

      <div class="hud__progress" aria-hidden="true" />
    </header>
  );
});
