"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    // A few bigger/brighter stars
    const brightStars: Star[] = Array.from({ length: 20 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 1.2,
      alpha: Math.random() * 0.4 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#05050f");
      grad.addColorStop(0.5, "#080818");
      grad.addColorStop(1, "#0a0a14");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle nebula glow top-right
      const nebula = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.1, 0,
        canvas.width * 0.8, canvas.height * 0.1, canvas.width * 0.35
      );
      nebula.addColorStop(0, "rgba(30,50,120,0.12)");
      nebula.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle nebula glow bottom-left
      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.85, 0,
        canvas.width * 0.15, canvas.height * 0.85, canvas.width * 0.3
      );
      nebula2.addColorStop(0, "rgba(60,20,80,0.08)");
      nebula2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all stars with twinkle
      [...stars, ...brightStars].forEach((s) => {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha * twinkle})`;
        ctx.fill();

        // Glow for bigger stars
        if (s.r > 1.2) {
          const glow = ctx.createRadialGradient(
            s.x * canvas.width, s.y * canvas.height, 0,
            s.x * canvas.width, s.y * canvas.height, s.r * 4
          );
          glow.addColorStop(0, `rgba(180, 210, 255, ${0.15 * twinkle})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      t += 0.015;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: "none" }}
    />
  );
}
