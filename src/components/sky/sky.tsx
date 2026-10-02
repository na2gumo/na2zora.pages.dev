import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Cloud } from "../cloud/cloud";
import { DAY_START, skyAt, type WeatherKind } from "../../lib/sky";

interface SkyProps {
  weather: WeatherKind;
}

interface Anchor {
  y: number;
  t: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

/** 決定的な乱数（星の配置を毎回同じにする） */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// 天気ごとに流れていく雲の数
const DRIFT_COUNT: Record<WeatherKind, number> = {
  clear: 2,
  sunny: 4,
  unknown: 4,
  cloudy: 7,
  rain: 8,
};

/**
 * 画面の背景に固定された空。
 * [data-sky-time] を持つ要素の中心が画面中央に来たとき、その時刻の空になるよう補間する。
 * 時刻は CSS 変数として <html> に書き込み、"sky:time" イベントで HUD に知らせる。
 */
export const Sky = component$<SkyProps>(({ weather }) => {
  const starsRef = useSignal<HTMLCanvasElement>();
  const rainRef = useSignal<HTMLCanvasElement>();

  useVisibleTask$(({ cleanup }) => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- スクロール位置 → 時刻 ----
    let anchors: Anchor[] = [];
    const measure = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-sky-time]"))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { y: rect.top + window.scrollY + rect.height / 2, t: Number(el.dataset.skyTime) };
        })
        .sort((a, b) => a.y - b.y);
    };

    const timeAtScroll = (scrollY: number) => {
      const line = scrollY + window.innerHeight / 2;
      if (anchors.length === 0) return DAY_START;
      if (line <= anchors[0].y) return anchors[0].t;
      for (let i = 1; i < anchors.length; i++) {
        const a = anchors[i - 1];
        const b = anchors[i];
        if (line <= b.y) return a.t + ((line - a.y) / (b.y - a.y)) * (b.t - a.t);
      }
      return anchors[anchors.length - 1].t;
    };

    const scrollForTime = (t: number) => {
      if (anchors.length === 0) return 0;
      const clamped = Math.min(Math.max(t, anchors[0].t), anchors[anchors.length - 1].t);
      for (let i = 1; i < anchors.length; i++) {
        const a = anchors[i - 1];
        const b = anchors[i];
        if (clamped <= b.t) {
          const y = a.y + ((clamped - a.t) / (b.t - a.t)) * (b.y - a.y);
          return y - window.innerHeight / 2;
        }
      }
      return document.documentElement.scrollHeight;
    };

    let night = 0;
    let t = DAY_START;
    const apply = () => {
      t = timeAtScroll(window.scrollY);
      const s = skyAt(t);
      night = s.night;
      const vars: Record<string, string> = {
        "--sky-top": s.top,
        "--sky-mid": s.mid,
        "--sky-low": s.low,
        "--cloud-hi": s.cloudHi,
        "--cloud-lo": s.cloudLo,
        "--night": s.night.toFixed(3),
        "--dusk": s.dusk.toFixed(3),
        "--sun-x": `${s.sunX.toFixed(2)}vw`,
        "--sun-y": `${s.sunY.toFixed(2)}vh`,
        "--sun-o": s.sunOpacity.toFixed(3),
        "--sun-color": s.sunColor,
        "--moon-x": `${s.moonX.toFixed(2)}vw`,
        "--moon-y": `${s.moonY.toFixed(2)}vh`,
        "--moon-o": s.moonOpacity.toFixed(3),
      };
      for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
      root.dataset.skyPhase = t < 16.5 ? "day" : t < 19.4 ? "dusk" : "night";
      document.dispatchEvent(new CustomEvent("sky:time", { detail: { t } }));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        apply();
      });
    };

    const onGoto = (e: Event) => {
      const target = (e as CustomEvent<{ t: number }>).detail.t;
      window.scrollTo({ top: scrollForTime(target), behavior: reduced ? "auto" : "smooth" });
    };

    measure();
    apply();
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("sky:goto", onGoto);

    // ---- 星（夜になるほど見える） ----
    const canvas = starsRef.value!;
    const ctx = canvas.getContext("2d")!;
    const rand = rng(20260802);
    const stars: Star[] = Array.from({ length: 260 }, () => ({
      x: rand(),
      y: Math.pow(rand(), 1.4) * 0.92,
      r: rand() < 0.08 ? 1.3 + rand() * 0.8 : 0.4 + rand() * 0.8,
      phase: rand() * Math.PI * 2,
      speed: 0.6 + rand() * 1.8,
    }));
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 3000;

    let w = 0;
    let h = 0;
    const fit = (c: HTMLCanvasElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStars = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      if (night < 0.01) return;
      for (const s of stars) {
        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(now / 1000 * s.speed + s.phase);
        ctx.globalAlpha = night * tw * (1 - s.y * 0.55);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 流れ星
      if (!reduced && night > 0.75) {
        if (!shooting && now > nextShoot) {
          shooting = { x: (0.3 + Math.random() * 0.7) * w, y: Math.random() * h * 0.35, vx: -9, vy: 4.2, life: 1 };
          nextShoot = now + 5000 + Math.random() * 7000;
        }
        if (shooting) {
          const g = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * 14, shooting.y - shooting.vy * 14);
          g.addColorStop(0, "rgba(255,255,255,0.95)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = night * shooting.life;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(shooting.x, shooting.y);
          ctx.lineTo(shooting.x - shooting.vx * 14, shooting.y - shooting.vy * 14);
          ctx.stroke();
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.life -= 0.018;
          if (shooting.life <= 0) shooting = null;
        }
      }
      ctx.globalAlpha = 1;
    };

    // ---- 雨（今週ほとんど push していないとき） ----
    const rainCanvas = rainRef.value;
    const rainCtx = rainCanvas?.getContext("2d") ?? null;
    const drops = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 10 + Math.random() * 16,
      v: 0.9 + Math.random() * 0.8,
    }));
    const drawRain = () => {
      if (!rainCtx) return;
      rainCtx.clearRect(0, 0, w, h);
      rainCtx.strokeStyle = night > 0.5 ? "rgba(170,190,230,0.35)" : "rgba(255,255,255,0.45)";
      rainCtx.lineWidth = 1;
      rainCtx.beginPath();
      for (const d of drops) {
        const x = d.x * w;
        const y = d.y * h;
        rainCtx.moveTo(x, y);
        rainCtx.lineTo(x - d.len * 0.18, y + d.len);
        if (!reduced) {
          d.y += (d.v * 14) / h;
          d.x -= (d.v * 2.5) / w;
          if (d.y > 1.05) {
            d.y = -0.05;
            d.x = Math.random() * 1.1;
          }
        }
      }
      rainCtx.stroke();
    };

    const resize = () => {
      fit(canvas);
      if (rainCanvas) fit(rainCanvas);
      if (reduced) {
        drawStars(0);
        drawRain();
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const loop = (now: number) => {
      drawStars(now);
      drawRain();
      raf = requestAnimationFrame(loop);
    };
    // 動きを減らす設定のときはアニメーションせず、時刻が変わったときだけ描き直す
    const redrawStill = () => drawStars(0);
    if (!reduced) raf = requestAnimationFrame(loop);
    else document.addEventListener("sky:time", redrawStill);

    cleanup(() => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("sky:goto", onGoto);
      document.removeEventListener("sky:time", redrawStill);
    });
  });

  const drifts = Array.from({ length: DRIFT_COUNT[weather] }, (_, i) => i);

  return (
    <div class={["sky", `sky--${weather}`]} aria-hidden="true">
      <div class="sky__gradient" />
      <div class="sky__dusk" />
      <div class="sky__sun" />
      <div class="sky__moon" />
      <canvas class="sky__stars" ref={starsRef} />
      <div class="sky__drift">
        {drifts.map((i) => (
          <div key={i} class="sky__drift-item" style={{ "--i": i }}>
            <Cloud variant="puff" />
          </div>
        ))}
      </div>
      <div class="sky__overcast" />
      {weather === "rain" && <canvas class="sky__rain" ref={rainRef} />}
    </div>
  );
});

