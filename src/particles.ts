interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function makeParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    r: Math.random() * 1.4 + 0.6,
  };
}

export function initParticles(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c5cff";

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let raf = 0;
  let resizeTimer = 0;

  function targetCount(): number {
    const area = width * height;
    return Math.round(Math.min(60, Math.max(18, area / 22000)));
  }

  // Cheap: only updates the canvas backing store + transform. Safe to run on every resize event.
  function updateCanvasSize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Expensive-ish: reconciles particle count and re-clamps positions instead of
  // throwing everything away, so a resize doesn't visibly "reset" the animation.
  function reconcileParticles(): void {
    for (const p of particles) {
      if (p.x > width) p.x = width;
      if (p.y > height) p.y = height;
    }
    const target = targetCount();
    if (particles.length > target) {
      particles.length = target;
    } else {
      while (particles.length < target) {
        particles.push(makeParticle(width, height));
      }
    }
  }

  function draw(): void {
    ctx!.clearRect(0, 0, width, height);
    ctx!.fillStyle = accent;
    ctx!.globalAlpha = 0.25;
    for (const p of particles) {
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

  function onResize(): void {
    updateCanvasSize();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      reconcileParticles();
      if (prefersReducedMotion) draw();
    }, 150);
  }

  updateCanvasSize();
  reconcileParticles();
  draw();

  window.addEventListener("resize", onResize, { passive: true });

  if (prefersReducedMotion) return;

  raf = requestAnimationFrame(step);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(step);
    }
  });
}
