import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AudioReactiveSphereProps {
  isPlaying?: boolean;
  color?: "cyan" | "violet" | "fuchsia";
  size?: number;
  className?: string;
}

export function AudioReactiveSphere({
  isPlaying = false,
  color = "cyan",
  size = 300,
  className,
}: AudioReactiveSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const colorPalettes = {
    cyan: {
      primary: [0, 220, 255],
      secondary: [100, 255, 218],
      accent: [180, 100, 255],
      highlight: [255, 255, 255],
    },
    violet: {
      primary: [139, 92, 246],
      secondary: [167, 139, 250],
      accent: [236, 72, 153],
      highlight: [255, 255, 255],
    },
    fuchsia: {
      primary: [236, 72, 153],
      secondary: [244, 114, 182],
      accent: [139, 92, 246],
      highlight: [255, 255, 255],
    },
  };

  const palette = colorPalettes[color];

  useEffect(() => {
    if (!isPlaying) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.7);
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const noise = useCallback((x: number, y: number, t: number) => {
    return (
      Math.sin(x * 0.5 + t) * 0.5 +
      Math.sin(y * 0.5 + t * 1.3) * 0.5 +
      Math.sin((x + y) * 0.3 + t * 0.7) * 0.5 +
      Math.sin(Math.sqrt(x * x + y * y) * 0.5 - t) * 0.5
    );
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.42;

    ctx.clearRect(0, 0, width, height);

    const time = timeRef.current;
    const intensity = isPlaying ? 0.5 + audioLevel * 0.5 : 0.3;
    const morphSpeed = isPlaying ? 0.03 : 0.008;
    const morphAmount = isPlaying ? 15 + audioLevel * 20 : 8;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const noiseVal = noise(x * 0.02, y * 0.02, time * morphSpeed);
        const morphedRadius = radius + noiseVal * morphAmount;

        if (dist < morphedRadius) {
          const normalizedDist = dist / morphedRadius;
          const sphereZ = Math.sqrt(1 - normalizedDist * normalizedDist);

          const nx = dx / morphedRadius;
          const ny = dy / morphedRadius;
          const nz = sphereZ;

          const lightX = 0.3;
          const lightY = -0.5;
          const lightZ = 0.8;
          const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
          const diffuse = Math.max(0, (nx * lightX + ny * lightY + nz * lightZ) / lightLen);

          const reflectX = 2 * nz * nx - lightX;
          const reflectY = 2 * nz * ny - lightY;
          const reflectZ = 2 * nz * nz - lightZ;
          const specular = Math.pow(Math.max(0, reflectZ / Math.sqrt(reflectX * reflectX + reflectY * reflectY + reflectZ * reflectZ)), 32);

          const plasmaVal = noise(
            nx * 3 + time * 0.02,
            ny * 3 + time * 0.015,
            nz * 3 + time * 0.01
          );

          const fresnel = Math.pow(1 - sphereZ, 2);

          const colorMix = (plasmaVal + 1) * 0.5;
          const r1 = palette.primary[0];
          const g1 = palette.primary[1];
          const b1 = palette.primary[2];
          const r2 = palette.secondary[0];
          const g2 = palette.secondary[1];
          const b2 = palette.secondary[2];
          const r3 = palette.accent[0];
          const g3 = palette.accent[1];
          const b3 = palette.accent[2];

          let r, g, b;
          if (colorMix < 0.33) {
            const t = colorMix * 3;
            r = r1 * (1 - t) + r2 * t;
            g = g1 * (1 - t) + g2 * t;
            b = b1 * (1 - t) + b2 * t;
          } else if (colorMix < 0.66) {
            const t = (colorMix - 0.33) * 3;
            r = r2 * (1 - t) + r3 * t;
            g = g2 * (1 - t) + g3 * t;
            b = b2 * (1 - t) + b3 * t;
          } else {
            const t = (colorMix - 0.66) * 3;
            r = r3 * (1 - t) + r1 * t;
            g = g3 * (1 - t) + g1 * t;
            b = b3 * (1 - t) + b1 * t;
          }

          const iridescence = Math.sin(normalizedDist * 6 + time * 0.05) * 0.3 + 0.7;
          r *= iridescence;
          g *= iridescence * 1.1;
          b *= iridescence * 1.2;

          const lighting = 0.4 + diffuse * 0.4 + fresnel * 0.3;
          r = r * lighting * intensity + specular * 255 * 0.6;
          g = g * lighting * intensity + specular * 255 * 0.6;
          b = b * lighting * intensity + specular * 255 * 0.6;

          const edgeFade = Math.pow(sphereZ, 0.3);
          const alpha = edgeFade * 255;

          const idx = (y * width + x) * 4;
          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = alpha;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.8,
      centerX, centerY, radius * 1.5
    );
    glowGradient.addColorStop(0, `rgba(${palette.primary[0]}, ${palette.primary[1]}, ${palette.primary[2]}, ${isPlaying ? 0.3 * intensity : 0.1})`);
    glowGradient.addColorStop(0.5, `rgba(${palette.accent[0]}, ${palette.accent[1]}, ${palette.accent[2]}, ${isPlaying ? 0.15 * intensity : 0.05})`);
    glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    timeRef.current += 1;
    animationRef.current = requestAnimationFrame(draw);
  }, [isPlaying, audioLevel, noise, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, draw]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: size, height: size }}
        data-testid="audio-reactive-sphere"
      />
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-20"
          style={{
            background: `radial-gradient(circle, rgba(${palette.primary.join(",")}, 0.4) 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
