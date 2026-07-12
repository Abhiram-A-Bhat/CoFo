"use client";

import { useEffect, useRef } from "react";

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    // Time ticker for scrolling
    let time = 0;
    
    // Grid spacing configuration (used to generate coordinates)
    const gridSpacing = 80;

    // Helper to get Y position of stock chart
    const getStaticChartY = (worldX: number) => {
      const baseTrend = -worldX * 0.28;
      const wave1 = Math.sin(worldX * 0.005) * 35;
      const wave2 = Math.cos(worldX * 0.012) * 15;
      const wave3 = Math.sin(worldX * 0.030) * 5;
      return height * 0.65 + baseTrend + wave1 + wave2 + wave3;
    };

    const handleResize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += 0.015;
      
      // Clear screen
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Define static screen positions for the arrow focal point
      const arrowX = width * 0.5; 
      const arrowY = height * 0.5;

      // Camera horizontal offset based on time
      const cameraX = time * 130; 
      
      const worldXAtArrow = cameraX + arrowX;
      const staticYAtArrow = getStaticChartY(worldXAtArrow);
      
      const cameraYOffset = arrowY - staticYAtArrow;

      // 1. Draw static background candlesticks with 20% opacity
      ctx.lineWidth = 1.2;
      const candleSpacing = gridSpacing * 1.2;
      const startCandleX = Math.floor(cameraX / candleSpacing) * candleSpacing;
      
      for (let worldX = startCandleX - candleSpacing * 4; worldX < startCandleX + width + candleSpacing; worldX += candleSpacing) {
        const screenX = worldX - cameraX;
        const colIdx = Math.floor(worldX / candleSpacing);
        
        const candleBaseY = getStaticChartY(worldX) + cameraYOffset;
        
        const seedValue = Math.sin(colIdx * 12.9898) * 43758.5453;
        const wickHeight = 35 + Math.abs(seedValue % 40);
        const bodyHeight = wickHeight * 0.5;
        const isGreen = (seedValue % 2) > 0;

        // Opacity boosted to exactly 20% (0.2) for wicks, and 12% (0.12) for filled candle bodies
        ctx.strokeStyle = isGreen ? "rgba(16, 185, 129, 0.20)" : "rgba(239, 68, 68, 0.15)";
        ctx.fillStyle = isGreen ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.08)";

        // Wick
        ctx.beginPath();
        ctx.moveTo(screenX, candleBaseY - wickHeight);
        ctx.lineTo(screenX, candleBaseY + wickHeight);
        ctx.stroke();

        // Body
        ctx.fillRect(screenX - 4, candleBaseY - bodyHeight, 8, bodyHeight * 2);
        ctx.strokeRect(screenX - 4, candleBaseY - bodyHeight, 8, bodyHeight * 2);
      }

      // 2. Render static history line (does not squiggle with time)
      const chartPoints: { x: number; y: number }[] = [];
      const resolution = 6;

      for (let screenX = -50; screenX <= arrowX; screenX += resolution) {
        const worldX = screenX + cameraX;
        const screenY = getStaticChartY(worldX) + cameraYOffset;
        chartPoints.push({ x: screenX, y: screenY });
      }

      if (chartPoints.length > 1) {
        // Gradient fill under the static line
        ctx.beginPath();
        ctx.moveTo(chartPoints[0].x, height);
        for (let i = 0; i < chartPoints.length; i++) {
          ctx.lineTo(chartPoints[i].x, chartPoints[i].y);
        }
        ctx.lineTo(arrowX, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, arrowY - 150, 0, height);
        grad.addColorStop(0, "rgba(16, 185, 129, 0.04)");
        grad.addColorStop(1, "rgba(16, 185, 129, 0.00)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw solid growth trend line
        ctx.beginPath();
        ctx.moveTo(chartPoints[0].x, chartPoints[0].y);
        for (let i = 1; i < chartPoints.length; i++) {
          ctx.lineTo(chartPoints[i].x, chartPoints[i].y);
        }
        
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Arrow Head aligned to the local trajectory
      const lastPoint = chartPoints[chartPoints.length - 1] || { x: arrowX, y: arrowY };
      const prevPoint = chartPoints[chartPoints.length - 3] || { x: arrowX - 10, y: arrowY };
      const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);
      
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-16, -8);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-16, 8);
      ctx.closePath();

      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full block bg-[#0a0a0a]" />;
}
