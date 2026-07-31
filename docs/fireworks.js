(() => {
  "use strict";

  const MESSAGE = {
    title: "致我最好的朋友游若云同学",
    body: "愿你被温柔以待，烟花为你绽放",
  };

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d", { alpha: false });
  const titleEl = document.getElementById("message-title");
  const bodyEl = document.getElementById("message-body");
  const installBtn = document.getElementById("install-btn");

  titleEl.textContent = MESSAGE.title;
  bodyEl.textContent = MESSAGE.body;

  const COLORS = [
    "#ff5c6e",
    "#ffb048",
    "#78d2ff",
    "#aaff96",
    "#d296ff",
    "#ff78b4",
    "#ffe678",
    "#64b4ff",
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let rockets = [];
  let particles = [];
  let elapsed = 0;
  let sinceAuto = 0;
  let autoInterval = 900;
  let lastTs = 0;
  let reducedMotion = false;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.max(36, Math.floor((width * height) / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75,
      r: rand(0.6, 1.4),
      b: rand(0.35, 1),
      speed: rand(0.8, 2.4),
      phase: rand(0, Math.PI * 2),
    }));
  }

  function launchAt(x, y) {
    const startX = x + rand(-36, 36);
    const rise = Math.max(80, height - y);
    const duration = rise / rand(9.5, 12.5);
    rockets.push({
      x: startX,
      y: height + 8,
      vx: (x - startX) / duration,
      vy: -rise / duration,
      targetY: y,
      color: pick(COLORS),
      pattern: (Math.random() * 3) | 0,
    });
  }

  function spawnAuto() {
    const n = 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < n; i++) {
      launchAt(rand(width * 0.12, width * 0.88), rand(height * 0.14, height * 0.42));
    }
  }

  function addBurst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = speed * rand(0.55, 1.15);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: Math.random() < 0.2 ? lighten(color, 1.25) : color,
        life: rand(0.75, 1.15),
        decay: rand(0.012, 0.022),
        size: rand(1.5, 2.8),
        spark: false,
      });
    }
  }

  function addRing(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + rand(-0.04, 0.04);
      const s = speed * rand(0.92, 1.08);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        life: rand(0.85, 1.2),
        decay: rand(0.013, 0.02),
        size: rand(1.6, 2.6),
        spark: false,
      });
    }
  }

  function addHeart(x, y, color, scale) {
    const samples = 52;
    for (let i = 0; i < samples; i++) {
      const t = (Math.PI * 2 * i) / samples;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      particles.push({
        x,
        y,
        vx: hx * scale * 0.045,
        vy: hy * scale * 0.045,
        color: i % 3 === 0 ? lighten(color, 1.2) : color,
        life: rand(0.95, 1.3),
        decay: rand(0.011, 0.018),
        size: rand(1.8, 3),
        spark: false,
      });
    }
    for (let i = 0; i < 20; i++) {
      const t = rand(0, Math.PI * 2);
      const f = rand(0.2, 0.7);
      const hx = 16 * Math.pow(Math.sin(t), 3) * f;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * f;
      particles.push({
        x,
        y,
        vx: hx * scale * 0.045,
        vy: hy * scale * 0.045,
        color: "#ffb4c8",
        life: rand(0.7, 1),
        decay: rand(0.015, 0.025),
        size: rand(1.2, 2),
        spark: false,
      });
    }
  }

  function lighten(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    r = Math.min(255, Math.round(r * factor));
    g = Math.min(255, Math.round(g * factor));
    b = Math.min(255, Math.round(b * factor));
    return `rgb(${r},${g},${b})`;
  }

  function explode(rocket) {
    const { x, y, color, pattern } = rocket;
    if (pattern === 1) {
      addRing(x, y, color, 36 + ((Math.random() * 18) | 0), rand(3.0, 4.4));
      addBurst(x, y, lighten(color, 1.25), 16 + ((Math.random() * 12) | 0), rand(1.1, 2.0));
    } else if (pattern === 2) {
      addHeart(x, y, color, rand(8.5, 12.5));
      addBurst(x, y, "#fffff0", 12 + ((Math.random() * 8) | 0), rand(0.9, 1.7));
    } else {
      addBurst(x, y, color, 50 + ((Math.random() * 30) | 0), rand(2.6, 4.5));
      addBurst(x, y, lighten(color, 1.3), 18 + ((Math.random() * 14) | 0), rand(1.0, 2.1));
    }

    for (let i = 0; i < 16; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.5, 3.2);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: "#fffff5",
        life: rand(0.35, 0.7),
        decay: rand(0.035, 0.06),
        size: rand(1, 1.8),
        spark: true,
      });
    }
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#060a1c");
    g.addColorStop(0.55, "#0c122a");
    g.addColorStop(1, "#121630");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.5, height * 1.05, 0, width * 0.5, height * 1.05, width * 0.7);
    glow.addColorStop(0, "rgba(40,50,90,0.28)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    for (const s of stars) {
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(elapsed * 0.001 * s.speed + s.phase));
      ctx.fillStyle = `rgba(230,235,255,${s.b * tw * 0.86})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(33, ts - lastTs);
    lastTs = ts;
    elapsed += dt;
    sinceAuto += dt;

    if (!reducedMotion && sinceAuto >= autoInterval) {
      sinceAuto = 0;
      autoInterval = rand(700, 1400);
      spawnAuto();
    }

    drawBackground();

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.085 * 0.15;

      if (Math.random() < 0.45) {
        particles.push({
          x: r.x + rand(-2, 2),
          y: r.y + rand(-2, 2),
          vx: rand(-0.4, 0.4),
          vy: rand(0.2, 1),
          color: "#ffc878",
          life: rand(0.3, 0.55),
          decay: rand(0.04, 0.08),
          size: rand(1, 1.6),
          spark: true,
        });
      }

      const trail = ctx.createLinearGradient(r.x, r.y, r.x - r.vx * 3.2, r.y - r.vy * 3.2);
      trail.addColorStop(0, "rgba(255,240,200,0.9)");
      trail.addColorStop(1, "rgba(255,160,60,0)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.vx * 3.2, r.y - r.vy * 3.2);
      ctx.stroke();

      ctx.fillStyle = "#fff5d2";
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (r.vy >= -1.5 || r.y <= r.targetY) {
        explode(r);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.spark ? 0.034 : 0.085;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > height + 40) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = Math.max(0, Math.min(1, p.life));
      if (!p.spark) {
        ctx.fillStyle = hexAlpha(p.color, alpha * 0.22);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = hexAlpha(p.color, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (particles.length > 3800) particles.splice(0, particles.length - 3800);

    requestAnimationFrame(tick);
  }

  function hexAlpha(color, alpha) {
    if (color.startsWith("rgb")) {
      return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
    }
    const n = parseInt(color.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function pointerPos(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onPointer(e) {
    e.preventDefault();
    const { x, y } = pointerPos(e);
    // avoid launching under dedication text too densely on first tap area — still allow
    launchAt(x, Math.min(y, height * 0.7));
    if (navigator.vibrate) navigator.vibrate(12);
  }

  canvas.addEventListener("pointerdown", onPointer, { passive: false });
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 120));

  // PWA install prompt
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();
  if (!reducedMotion) spawnAuto();
  requestAnimationFrame(tick);
})();
