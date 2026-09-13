import React, { useEffect, useRef, useState } from "react";

export const OrbitGlassScene: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Mouse Parallax Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10; // -5deg to +5deg
      const y = (e.clientY / innerHeight - 0.5) * -8; // -4deg to +4deg
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 2. Animated Glowing Single Orbit Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const speed = 0.016; // Smooth rotation speed

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Center and radius of the single orbit around the phone slabs
      const cx = w * 0.49;
      const cy = h * 0.46;
      const rx = w * 0.42;
      const ry = h * 0.19;
      const rotationAngle = 0.36; // Incline angle matching reference

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationAngle);

      // 1. THE SINGLE GLOWING NEON ORBIT LINE
      // Outer glow
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(163, 255, 95, 0.25)";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#A3FF5F";
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Sharp bright core line
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(163, 255, 95, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 6;
      ctx.stroke();

      // 2. Compute 3D Positions for the Rotating Balls
      angle += speed;
      if (angle > Math.PI * 2) angle -= Math.PI * 2;

      // Ball 1: Bright Glowing Neon Lime Orb
      const s1X = rx * Math.cos(angle);
      const s1Y = ry * Math.sin(angle);

      // Ball 2: Dark Obsidian Specular Orb (180 deg opposite)
      const s2X = rx * Math.cos(angle + Math.PI);
      const s2Y = ry * Math.sin(angle + Math.PI);

      // Depth sort: back ball rendered first, front ball rendered second
      const isS1Front = s1Y > 0;

      const drawBall = (x: number, y: number, isLime: boolean) => {
        ctx.save();
        ctx.translate(x, y);

        if (isLime) {
          // Intense neon glow aura
          const glowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 24);
          glowGrad.addColorStop(0, "rgba(235, 255, 210, 0.95)");
          glowGrad.addColorStop(0.25, "rgba(163, 255, 95, 0.85)");
          glowGrad.addColorStop(0.65, "rgba(85, 214, 190, 0.25)");
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();

          // Core Solid Orb
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#F2FFE5";
          ctx.shadowColor = "#A3FF5F";
          ctx.shadowBlur = 16;
          ctx.fill();
        } else {
          // Metallic Obsidian Chrome Sphere
          ctx.shadowBlur = 0;
          const chromeGrad = ctx.createRadialGradient(-2.5, -2.5, 1, 0, 0, 8.5);
          chromeGrad.addColorStop(0, "#FFFFFF");
          chromeGrad.addColorStop(0.3, "#4F705B");
          chromeGrad.addColorStop(0.75, "#16251D");
          chromeGrad.addColorStop(1, "#08100C");

          ctx.fillStyle = chromeGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();

          // Specular Glint Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          ctx.arc(-2.8, -2.8, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      if (!isS1Front) {
        drawBall(s1X, s1Y, true);
        drawBall(s2X, s2Y, false);
      } else {
        drawBall(s2X, s2Y, false);
        drawBall(s1X, s1Y, true);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
        transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {/* 1. Photorealistic 3D Crystal Phone Slates (Zero black border artifacts, clean transparency) */}
      <img
        src="/assets/images/opspilot_hero_phones_clean.png"
        alt="OpsPilot Photorealistic Crystal Glass Phone Slates"
        className="w-full h-full object-contain pointer-events-none filter brightness-105 contrast-110"
        draggable={false}
      />

      {/* 2. Single Animated Glowing Orbit with Rotating Spheres */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};