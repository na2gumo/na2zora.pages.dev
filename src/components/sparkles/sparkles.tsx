import { component$, useVisibleTask$ } from "@builder.io/qwik";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  isBurst: boolean;
}

export const Sparkles = component$(() => {
  useVisibleTask$(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "sparkle-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const colors = [
      "#38bdf8", // Sky blue
      "#818cf8", // Indigo
      "#c084fc", // Purple
      "#f472b6", // Pink
      "#fbbf24", // Gold
      "#ffffff", // White
    ];

    const createParticle = (x: number, y: number, isBurst = false) => {
      const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isBurst ? Math.random() * 5 + 2 : Math.random() * 1.5 + 0.5;
      const size = isBurst ? Math.random() * 4 + 2 : Math.random() * 3 + 1.5;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isBurst ? 1 : 0.5),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: isBurst ? Math.random() * 0.02 + 0.02 : Math.random() * 0.03 + 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        isBurst,
      });
    };

    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // カーソル移動時は少し間引いて上品にキラキラを配置
      if (now - lastMoveTime > 25) {
        lastMoveTime = now;
        for (let i = 0; i < 2; i++) {
          createParticle(
            e.clientX + (Math.random() - 0.5) * 8,
            e.clientY + (Math.random() - 0.5) * 8,
            false
          );
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      // クリック時は弾けるように星屑が四方八方に拡散
      const burstCount = 18;
      for (let i = 0; i < burstCount; i++) {
        createParticle(e.clientX, e.clientY, true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    // 星型（4芒星のキラキラ）を描画する関数
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // ほんのり重力
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // キラキラした4芒星を描画
        drawStar(ctx, 0, 0, 4, p.size * 2, p.size * 0.5);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    };
  });

  return null;
});
