import React, { useEffect, useRef } from "react";

interface RotatingBallsOrbitProps {
  isDark?: boolean;
}

export const RotatingBallsOrbit: React.FC<RotatingBallsOrbitProps> = ({ isDark = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let angle = 0;
    const speed = 0.8; // Smooth orbital rotation (~7.8s per orbit)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    // Helper: Draw rounded rectangle path
    const drawRoundedRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + width - radius, y);
      c.quadraticCurveTo(x + width, y, x + width, y + radius);
      c.lineTo(x + width, y + height - radius);
      c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      c.lineTo(x + radius, y + height);
      c.quadraticCurveTo(x, y + height, x, y + height - radius);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
    };

    const render = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (delta > 0 && delta < 0.5) {
        angle += speed * delta;
        if (angle > Math.PI * 2) {
          angle %= Math.PI * 2;
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const dark = isDarkRef.current;

      // Fit 3D Artwork in the left hero zone (matching responsive canvas)
      const imageRatio = 1376 / 768;
      const containerRatio = w / h;

      let renderedWidth = w;
      let renderedHeight = h;
      let offsetX = 0;
      let offsetY = 0;

      if (containerRatio > imageRatio) {
        renderedWidth = w;
        renderedHeight = w / imageRatio;
        offsetY = (h - renderedHeight) / 2;
      } else {
        renderedHeight = h;
        renderedWidth = h * imageRatio;
        offsetX = (w - renderedWidth) / 2;
      }

      // Center of 3D object on left side
      const cx = offsetX + renderedWidth * (586.0 / 1376.0);
      const cy = offsetY + renderedHeight * (376.0 / 768.0);
      const rx = renderedWidth * (196.0 / 1376.0);
      const ry = renderedHeight * (58.0 / 768.0);
      const tilt = -0.34; // Tilt angle (~ -19.5 deg)
      const scaleFactor = Math.min(Math.max(renderedWidth / 1376.0, 0.65), 1.35);

      // ----------------------------------------------------
      // 1. Floor Glow & Reflection Pool
      // ----------------------------------------------------
      ctx.save();
      const floorY = cy + 180 * scaleFactor;
      const floorGlow = ctx.createRadialGradient(cx, floorY, 10 * scaleFactor, cx, floorY, 200 * scaleFactor);
      if (dark) {
        floorGlow.addColorStop(0, "rgba(163, 255, 95, 0.45)");
        floorGlow.addColorStop(0.3, "rgba(46, 133, 64, 0.22)");
        floorGlow.addColorStop(0.7, "rgba(13, 20, 16, 0.08)");
        floorGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        floorGlow.addColorStop(0, "rgba(46, 133, 64, 0.35)");
        floorGlow.addColorStop(0.35, "rgba(34, 197, 94, 0.18)");
        floorGlow.addColorStop(0.7, "rgba(46, 133, 64, 0.04)");
        floorGlow.addColorStop(1, "rgba(250, 250, 247, 0)");
      }
      ctx.fillStyle = floorGlow;
      ctx.beginPath();
      ctx.ellipse(cx, floorY, 220 * scaleFactor, 65 * scaleFactor, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------
      // 2. Inverted Floor Reflection of Glass Sculpture
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(cx, floorY);
      ctx.scale(1, -0.6);
      ctx.globalAlpha = dark ? 0.35 : 0.25;

      // Draw reflection plates
      const drawReflectPlates = () => {
        ctx.save();
        ctx.rotate(-0.18);
        ctx.fillStyle = dark ? "rgba(46, 133, 64, 0.6)" : "rgba(30, 80, 45, 0.5)";
        drawRoundedRect(ctx, -60 * scaleFactor, 0, 120 * scaleFactor, 180 * scaleFactor, 14 * scaleFactor);
        ctx.fill();
        ctx.restore();
      };
      drawReflectPlates();
      ctx.restore();

      // ----------------------------------------------------
      // 3. Orbital Ring (Back Arc)
      // ----------------------------------------------------
      const drawRingArc = (startAngle: number, endAngle: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);

        ctx.shadowColor = dark ? "#A3FF5F" : "#22C55E";
        ctx.shadowBlur = dark ? 16 : 10;
        ctx.strokeStyle = dark ? "#A3FF5F" : "#16A34A";
        ctx.lineWidth = 2.2 * scaleFactor;

        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, startAngle, endAngle);
        ctx.stroke();

        // Inner bright ring core
        ctx.shadowBlur = 4;
        ctx.strokeStyle = dark ? "#FFFFFF" : "#4ADE80";
        ctx.lineWidth = 1.0 * scaleFactor;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, startAngle, endAngle);
        ctx.stroke();

        ctx.restore();
      };

      // Back arc of ellipse (from PI to 2*PI in local ellipse coords)
      drawRingArc(Math.PI, Math.PI * 2);

      // ----------------------------------------------------
      // 4. Ball Coordinates along 3D Orbit
      // ----------------------------------------------------
      const b1_localX = rx * Math.cos(angle);
      const b1_localY = ry * Math.sin(angle);
      const b1_gx = cx + b1_localX * Math.cos(tilt) - b1_localY * Math.sin(tilt);
      const b1_gy = cy + b1_localX * Math.sin(tilt) + b1_localY * Math.cos(tilt);

      const b2_localX = rx * Math.cos(angle + Math.PI);
      const b2_localY = ry * Math.sin(angle + Math.PI);
      const b2_gx = cx + b2_localX * Math.cos(tilt) - b2_localY * Math.sin(tilt);
      const b2_gy = cy + b2_localX * Math.sin(tilt) + b2_localY * Math.cos(tilt);

      const isB1Front = b1_localY > 0;
      const isB2Front = b2_localY > 0;

      // Ball drawing functions
      const drawLimeOrb = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);

        const outerRadius = (dark ? 30 : 24) * scaleFactor;
        const outerGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, outerRadius);
        if (dark) {
          outerGlow.addColorStop(0, "rgba(225, 255, 190, 0.95)");
          outerGlow.addColorStop(0.3, "rgba(163, 255, 95, 0.85)");
          outerGlow.addColorStop(0.7, "rgba(85, 214, 190, 0.3)");
          outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          outerGlow.addColorStop(0, "rgba(74, 222, 128, 0.95)");
          outerGlow.addColorStop(0.35, "rgba(34, 197, 94, 0.75)");
          outerGlow.addColorStop(0.75, "rgba(22, 163, 74, 0.25)");
          outerGlow.addColorStop(1, "rgba(250, 250, 247, 0)");
        }

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = dark ? "#A3FF5F" : "#16A34A";
        ctx.shadowBlur = (dark ? 16 : 10) * scaleFactor;
        ctx.fillStyle = dark ? "#B9FF85" : "#22C55E";
        ctx.beginPath();
        ctx.arc(0, 0, 8.5 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 6 * scaleFactor;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, 5.0 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      const drawChromeOrb = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);

        const orbRadius = 9.0 * scaleFactor;
        const chromeGrad = ctx.createRadialGradient(
          -3 * scaleFactor,
          -3 * scaleFactor,
          1,
          0,
          0,
          orbRadius
        );

        if (dark) {
          chromeGrad.addColorStop(0, "#FFFFFF");
          chromeGrad.addColorStop(0.25, "#8BAE96");
          chromeGrad.addColorStop(0.55, "#304D3C");
          chromeGrad.addColorStop(0.85, "#121F17");
          chromeGrad.addColorStop(1, "#070E0A");
        } else {
          chromeGrad.addColorStop(0, "#FFFFFF");
          chromeGrad.addColorStop(0.25, "#CBD5E1");
          chromeGrad.addColorStop(0.6, "#475569");
          chromeGrad.addColorStop(0.9, "#1E293B");
          chromeGrad.addColorStop(1, "#0F172A");
        }

        ctx.fillStyle = chromeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Specular glint
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.beginPath();
        ctx.arc(-3 * scaleFactor, -3 * scaleFactor, 2.5 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();

        // Rim contour
        ctx.strokeStyle = dark ? "rgba(163, 255, 95, 0.55)" : "rgba(34, 197, 94, 0.75)";
        ctx.lineWidth = 1.3 * scaleFactor;
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      };

      // Draw spheres that are behind the glass plates
      if (!isB1Front) drawLimeOrb(b1_gx, b1_gy);
      if (!isB2Front) drawChromeOrb(b2_gx, b2_gy);

      // ----------------------------------------------------
      // 5. High-Contrast 3D Glass Sculpture Plates
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      // Plate 1: Back Smoked Obsidian Glass Plate
      ctx.save();
      ctx.rotate(-0.24);
      const p1w = 120 * scaleFactor;
      const p1h = 230 * scaleFactor;
      const p1x = -p1w / 2 - 25 * scaleFactor;
      const p1y = -p1h / 2 - 10 * scaleFactor;

      const p1Grad = ctx.createLinearGradient(p1x, p1y, p1x + p1w, p1y + p1h);
      if (dark) {
        p1Grad.addColorStop(0, "rgba(25, 45, 35, 0.75)");
        p1Grad.addColorStop(0.5, "rgba(10, 22, 16, 0.85)");
        p1Grad.addColorStop(1, "rgba(5, 12, 8, 0.92)");
      } else {
        // High-contrast deep tinted glass with emerald undertone for Light mode
        p1Grad.addColorStop(0, "rgba(18, 38, 28, 0.82)");
        p1Grad.addColorStop(0.5, "rgba(28, 55, 40, 0.78)");
        p1Grad.addColorStop(1, "rgba(15, 32, 24, 0.88)");
      }

      ctx.fillStyle = p1Grad;
      drawRoundedRect(ctx, p1x, p1y, p1w, p1h, 18 * scaleFactor);
      ctx.fill();

      // Sharp glass rim highlight
      ctx.strokeStyle = dark ? "rgba(163, 255, 95, 0.45)" : "rgba(34, 197, 94, 0.85)";
      ctx.lineWidth = 1.6 * scaleFactor;
      ctx.stroke();
      ctx.restore();

      // Plate 2: Glowing Emerald Neon Glass Core Plate
      ctx.save();
      ctx.rotate(0.12);
      const p2w = 115 * scaleFactor;
      const p2h = 210 * scaleFactor;
      const p2x = -p2w / 2 + 10 * scaleFactor;
      const p2y = -p2h / 2 + 5 * scaleFactor;

      const p2Grad = ctx.createLinearGradient(p2x, p2y, p2x + p2w, p2y + p2h);
      if (dark) {
        p2Grad.addColorStop(0, "rgba(163, 255, 95, 0.85)");
        p2Grad.addColorStop(0.4, "rgba(85, 214, 190, 0.65)");
        p2Grad.addColorStop(1, "rgba(30, 85, 55, 0.8)");
      } else {
        p2Grad.addColorStop(0, "rgba(46, 133, 64, 0.85)");
        p2Grad.addColorStop(0.4, "rgba(34, 197, 94, 0.75)");
        p2Grad.addColorStop(1, "rgba(20, 65, 38, 0.88)");
      }

      ctx.shadowColor = dark ? "#A3FF5F" : "#22C55E";
      ctx.shadowBlur = (dark ? 24 : 14) * scaleFactor;
      ctx.fillStyle = p2Grad;
      drawRoundedRect(ctx, p2x, p2y, p2w, p2h, 16 * scaleFactor);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = dark ? "rgba(255, 255, 255, 0.85)" : "rgba(163, 255, 95, 0.95)";
      ctx.lineWidth = 1.8 * scaleFactor;
      ctx.stroke();
      ctx.restore();

      // Plate 3: Front Translucent High-Gloss Facet
      ctx.save();
      ctx.rotate(-0.08);
      const p3w = 100 * scaleFactor;
      const p3h = 190 * scaleFactor;
      const p3x = -p3w / 2 - 10 * scaleFactor;
      const p3y = -p3h / 2 + 25 * scaleFactor;

      const p3Grad = ctx.createLinearGradient(p3x, p3y, p3x + p3w, p3y + p3h);
      if (dark) {
        p3Grad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
        p3Grad.addColorStop(0.5, "rgba(163, 255, 95, 0.2)");
        p3Grad.addColorStop(1, "rgba(10, 25, 18, 0.75)");
      } else {
        p3Grad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        p3Grad.addColorStop(0.4, "rgba(34, 197, 94, 0.35)");
        p3Grad.addColorStop(1, "rgba(18, 42, 30, 0.82)");
      }

      ctx.fillStyle = p3Grad;
      drawRoundedRect(ctx, p3x, p3y, p3w, p3h, 14 * scaleFactor);
      ctx.fill();

      // Beveled specular highlight edge
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.5 * scaleFactor;
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // ----------------------------------------------------
      // 6. Orbital Ring (Front Arc)
      // ----------------------------------------------------
      // Front arc of ellipse (from 0 to PI in local coords)
      drawRingArc(0, Math.PI);

      // ----------------------------------------------------
      // 7. Draw Spheres in Front
      // ----------------------------------------------------
      if (isB1Front) drawLimeOrb(b1_gx, b1_gy);
      if (isB2Front) drawChromeOrb(b2_gx, b2_gy);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-1"
    />
  );
};

