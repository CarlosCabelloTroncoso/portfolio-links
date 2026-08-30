interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function initParticles(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c5cff";
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let particles: Particle[] = [];

  function particleCount(): number {
    const area = width * height;
    return Math.round(Math.min(60, Math.max(18, area / 22000)));
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCount();
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 1.4 + 0.6,
    }));
  }

  function draw(): void {
    ctx!.clearRect(0, 0, width, height);
    ctx!.fillStyle = accent;
    for (const p of particles) {
      ctx!.globalAlpha = 0.25;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  function step(): void {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
    draw();
    raf = requestAnimationFrame(step);
  }

  let raf = 0;

  resize();
  draw();

  if (prefersReducedMotion) {
    window.addEventListener("resize", () => {
      resize();
      draw();
    });
    return;
  }

  raf = requestAnimationFrame(step);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(step);
    }
  });

  window.addEventListener("resize", resize);
}
