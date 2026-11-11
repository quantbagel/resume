const TAU = Math.PI * 2;
const COPY = "lucas miranda is building abstract — compute and physical ai. on the internet as quantbagel. say hello on x.";
const COLORS = [
  ["#000000", "#ffffff"], ["#163cff", "#ffffff"], ["#ff3b30", "#ffffff"],
  ["#d7ff00", "#111111"], ["#7c3aed", "#ffffff"], ["#00d9ff", "#001018"],
  ["#ff6a00", "#ffffff"], ["#ff4fa3", "#19000c"],
];
// Words in the ring that open a page when tapped. Each is matched at its last appearance in COPY.
const LINKS = [["abstract", "https://abstract.inc/inference"], ["x", "https://x.com/quantbagel"]].map(([word, href]) => {
  const from = Array.from(COPY.slice(0, COPY.lastIndexOf(word))).length;
  return { from, to: from + Array.from(word).length, href };
});
const linkOf = (index: number) => LINKS.find(link => index >= link.from && index < link.to);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
// The slowest wall impact, in px/s, that counts as a bump. Anything slower is the ring settling.
const BUMP = 40;
type Ball = { x: number; y: number; vx: number; vy: number; r: number; angle: number; sx: number; sy: number };
type Particle = { char: string; x: number; y: number; vx: number; vy: number; angle: number; spin: number; targetX: number; targetY: number; targetAngle: number };
type Callbacks = {
  onGameChange: (game: { score: number; seconds: number } | null) => void;
  onRoundEnd: (score: number) => void;
  onPauseChange: (paused: boolean) => void;
};
export type Playground = {
  destroy: () => void; reset: () => void; startGame: () => void;
  setObscured: (value: boolean) => void; setPaused: (value: boolean) => void;
  setSound: (value: boolean) => void;
};

export function createPlayground(canvas: HTMLCanvasElement, callbacks: Callbacks): Playground {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const ctx = context;
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduceMotion.matches, obscured = false, destroyed = false;
  let width = 0, height = 0, ratio = 1, baseRadius = 180;
  let theme = 0, sound = true, audio: AudioContext | undefined;
  let lastSound = 0, lastTime = 0, frameId = 0;
  let ball: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 180, angle: Math.PI, sx: 1, sy: 1 };
  let puck: Ball | null = null;
  let game: { score: number; remaining: number; seconds: number; ended: boolean } | null = null;
  let drag: { id: number; dx: number; dy: number; startX: number; startY: number; lastX: number; lastY: number; time: number; started: number; moved: boolean; pressure: number } | null = null;
  let lastTap = { time: 0, x: 0, y: 0 }, tappedLink: string | null = null;
  let pinch: { distance: number; radius: number } | null = null;
  const pointers = new Map<number, { x: number; y: number }>();
  let particles: Particle[] = [], burstTime = 0, returning = false;
  let goalFlash = 0;
  // The glyph advances are measured once, not on every animation frame.
  ctx.font = '400 26px "Helvetica Neue", Helvetica, Arial, sans-serif';
  const glyphs = Array.from(COPY).map(char => ({ char, width: ctx.measureText(char).width }));
  const textWidth = glyphs.reduce((sum, glyph) => sum + glyph.width, 0);

  function setTheme(index: number) {
    theme = index % COLORS.length;
    document.documentElement.style.setProperty("--page-bg", COLORS[theme][0]);
    document.documentElement.style.setProperty("--page-fg", COLORS[theme][1]);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[theme][0]);
  }
  // Browsers keep audio suspended until the visitor's first gesture. Until then there is no
  // speaker: notes scheduled on a suspended context would all sound at once when it resumes.
  function speaker() {
    audio ??= new AudioContext();
    if (audio.state === "running") return audio;
    void audio.resume().catch(() => {});
    return null;
  }
  function tone(force: number, frequency = 160) {
    if (!sound || performance.now() - lastSound < 35) return;
    try {
      const audio = speaker();
      if (!audio) return;
      lastSound = performance.now();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(45, audio.currentTime + .12);
      gain.gain.setValueAtTime(Math.min(.16, .04 + force / 8000), audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .14);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .15);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Audio must never interrupt the interaction. */ }
  }
  function resize() {
    const oldWidth = width, oldHeight = height;
    width = canvas.clientWidth; height = canvas.clientHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const size = Math.min(height * .550469, width - 12, height - 12);
    baseRadius = Math.max(42, Math.min(size * (width <= 700 ? .3125 : .425), (width - 36) / 2, (height - 36) / 2));
    ball.r = baseRadius * (game ? .46 : 1);
    ball.x = oldWidth ? ball.x / oldWidth * width : width / 2;
    ball.y = oldHeight ? ball.y / oldHeight * height : height / 2;
    contain(ball);
    if (puck) { puck.r = baseRadius * .28; contain(puck); }
    particles = [];
  }
  function extent(body: Ball) { return body.r + fontSize(body) * .65; }
  function fontSize(body: Ball) { return Math.min(26, 26 * body.r / baseRadius); }
  function contain(body: Ball) {
    const edge = extent(body);
    body.x = clamp(body.x, edge, Math.max(edge, width - edge));
    body.y = clamp(body.y, edge, Math.max(edge, height - edge));
  }
  function setPaused(value: boolean) { paused = value; callbacks.onPauseChange(paused); }
  function reset() {
    game = null; puck = null; particles = []; drag = null; pinch = null; pointers.clear();
    ball = { x: width / 2, y: height / 2, vx: 0, vy: 0, r: baseRadius, angle: Math.PI, sx: 1, sy: 1 };
    setTheme(0); setPaused(reduceMotion.matches); callbacks.onGameChange(null);
    canvas.style.cursor = "default";
  }
  function startGame() {
    reset(); setPaused(false);
    game = { score: 0, remaining: 15, seconds: 15, ended: false };
    ball.r = baseRadius * .46; ball.y = height * .76;
    puck = { x: width / 2, y: height * .35, vx: 75, vy: 60, r: baseRadius * .28, angle: 0, sx: 1, sy: 1 };
    contain(ball); contain(puck);
    callbacks.onGameChange({ score: 0, seconds: 15 });
  }
  function forGlyphs(body: Ball, visit: (char: string, x: number, y: number, angle: number, scale: number, index: number) => void) {
    const fontScale = fontSize(body) / 26;
    const gap = 19.5 * fontScale;
    const scale = (TAU * body.r - gap) / textWidth;
    let angle = body.angle + gap / body.r / 2;
    glyphs.forEach((glyph, index) => {
      const arc = glyph.width * scale / body.r;
      const mid = angle + arc / 2;
      visit(glyph.char, body.x + Math.cos(mid) * body.r * body.sx, body.y + Math.sin(mid) * body.r * body.sy,
        Math.atan2(Math.cos(mid) * body.sy, -Math.sin(mid) * body.sx), scale / fontScale, index);
      angle += arc;
    });
  }
  function drawRing(body: Ball) {
    ctx.font = `400 ${fontSize(body)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    // Only the big ring carries links; the paddle and puck are too small and busy to tap.
    const linked = body === ball && !game, fontScale = fontSize(body) / 26;
    forGlyphs(body, (char, x, y, angle, scale, index) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, 1);
      ctx.fillText(char, 0, 0);
      if (linked && linkOf(index)) {
        const span = glyphs[index].width * fontScale + 1;
        ctx.fillRect(-span / 2, 4 * fontScale, span, Math.max(1, 1.5 * fontScale));
      }
      ctx.restore();
    });
  }
  function linkAt(x: number, y: number) {
    if (game || particles.length) return null;
    let nearest = Math.max(22, fontSize(ball)), found: string | null = null;
    forGlyphs(ball, (_char, glyphX, glyphY, _angle, _scale, index) => {
      const link = linkOf(index), distance = Math.hypot(glyphX - x, glyphY - y);
      if (link && distance < nearest) { nearest = distance; found = link.href; }
    });
    return found as string | null;
  }
  function burst() {
    if (game || particles.length) return;
    ball.sx = ball.sy = 1;
    forGlyphs(ball, (char, x, y, angle) => {
      particles.push({ char, x, y, vx: (x - ball.x) * (1.6 + Math.random()) + ball.vx * .2,
        vy: (y - ball.y) * (1.6 + Math.random()) - 190, angle, spin: (Math.random() - .5) * 5,
        targetX: 0, targetY: 0, targetAngle: 0 });
    });
    burstTime = 0; returning = false; drag = null; tone(900, 300);
  }
  function restore() {
    if (!particles.length || returning) return;
    returning = true; burstTime = 0; ball.x = width / 2; ball.y = height / 2; ball.vx = ball.vy = 0;
    let index = 0;
    forGlyphs(ball, (_char, x, y, angle) => {
      Object.assign(particles[index++], { targetX: x, targetY: y, targetAngle: angle });
    });
  }
  function wall(body: Ball, dt: number, isPuck = false) {
    const edge = extent(body);
    const goalWidth = Math.max(140, (puck ? extent(puck) : 45) * 3.8);
    const inGoal = isPuck && Math.abs(body.x - width / 2) < goalWidth / 2 - edge;
    body.x += body.vx * dt; body.y += body.vy * dt;
    if (inGoal && body.y < -edge && game) {
      game.score++; goalFlash = .35; tone(900, 600);
      body.x = width / 2; body.y = height * .32; body.vx = (Math.random() - .5) * 180; body.vy = 90;
      callbacks.onGameChange({ score: game.score, seconds: game.seconds });
      return;
    }
    // A bump is any impact into a wall at BUMP speed or more. Each one squashes the ring, sounds,
    // and turns the page color. A slower touch settles against the wall instead of rebounding, so
    // outside the game nothing bounces without registering. In the game only the floor settles,
    // which keeps a slow puck from sticking to the rails.
    let hit = 0;
    const rebound = (speed: number, restitution: number, sx: number, sy: number, settles = !game) => {
      if (speed < BUMP) return settles ? 0 : speed * restitution;
      hit = Math.max(hit, speed); body.sx = sx; body.sy = sy;
      return speed * restitution;
    };
    if (body.x < edge) { body.x = edge; if (body.vx < 0) body.vx = rebound(-body.vx, .92, .82, 1.12); }
    if (body.x > width - edge) { body.x = width - edge; if (body.vx > 0) body.vx = -rebound(body.vx, .92, .82, 1.12); }
    if (body.y < edge && !inGoal) { body.y = edge; if (body.vy < 0) body.vy = rebound(-body.vy, .92, 1.12, .8); }
    if (body.y > height - edge) {
      body.y = height - edge;
      if (body.vy > 0) body.vy = -rebound(body.vy, .87, 1.12, .8, true);
      body.vx *= Math.pow(.97, dt * 60);
    }
    if (hit) { tone(hit); if (!game) setTheme(theme + 1); }
    body.vx *= Math.pow(game ? .992 : .998, dt * 60);
    if (game) body.vy *= Math.pow(.992, dt * 60);
  }
  function step(dt: number) {
    if (particles.length) {
      burstTime += dt;
      if (!returning && burstTime > 3) restore();
      for (const p of particles) {
        if (returning) {
          const ease = 1 - Math.exp(-dt * 10);
          p.x += (p.targetX - p.x) * ease; p.y += (p.targetY - p.y) * ease;
          p.angle += Math.atan2(Math.sin(p.targetAngle - p.angle), Math.cos(p.targetAngle - p.angle)) * ease;
        } else {
          p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.angle += p.spin * dt;
          if (p.y > height - 20) { p.y = height - 20; p.vy *= -.55; p.vx *= .9; }
          if (p.x < 10 || p.x > width - 10) { p.x = clamp(p.x, 10, width - 10); p.vx *= -.7; }
        }
      }
      if (returning && burstTime > .9) particles = [];
      return;
    }
    if (game && !game.ended) {
      game.remaining -= dt;
      const seconds = Math.max(0, Math.ceil(game.remaining));
      if (seconds !== game.seconds) { game.seconds = seconds; callbacks.onGameChange({ score: game.score, seconds }); }
      if (game.remaining <= 0) { game.ended = true; drag = null; callbacks.onRoundEnd(game.score); return; }
    }
    ball.angle += dt * TAU / 60;
    ball.sx += (1 - ball.sx) * Math.min(1, dt * 12); ball.sy += (1 - ball.sy) * Math.min(1, dt * 12);
    if (drag) {
      if (drag.pressure > ball.r * .42 && !game) { burstTime += dt; if (burstTime > .9) burst(); }
      else burstTime = 0;
    } else {
      if (!game) ball.vy += 400 * dt;
      wall(ball, dt);
    }
    if (puck) { puck.angle -= dt * .2; wall(puck, dt, true); strike(); }
  }
  function strike() {
    if (!puck) return;
    const dx = puck.x - ball.x, dy = puck.y - ball.y, distance = Math.hypot(dx, dy) || 1;
    const separation = extent(ball) + extent(puck);
    if (distance >= separation) return;
    const nx = dx / distance, ny = dy / distance;
    puck.x += nx * (separation - distance); puck.y += ny * (separation - distance);
    const speed = (puck.vx - ball.vx) * nx + (puck.vy - ball.vy) * ny;
    if (speed >= 0) return;
    puck.vx = clamp(puck.vx - 1.8 * speed * nx, -2000, 2000);
    puck.vy = clamp(puck.vy - 1.8 * speed * ny, -2000, 2000);
    if (!drag) { ball.vx += speed * nx * .25; ball.vy += speed * ny * .25; }
    tone(Math.abs(speed), 220);
  }
  function draw() {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS[theme][1];
    if (particles.length) {
      ctx.font = '400 26px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textAlign = "center";
      const scale = (TAU * ball.r - 19.5) / textWidth;
      for (const p of particles) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(scale, 1); ctx.fillText(p.char, 0, 0); ctx.restore(); }
    } else { drawRing(ball); if (puck) drawRing(puck); }
    if (game && puck) {
      const goalWidth = Math.max(140, extent(puck) * 3.8);
      ctx.globalAlpha = goalFlash > 0 ? 1 : .65;
      ctx.fillRect(width / 2 - goalWidth / 2, 9, goalWidth, goalFlash > 0 ? 4 : 2);
      ctx.globalAlpha = 1;
    }
  }
  function frame(time: number) {
    if (destroyed) return;
    const elapsed = Math.min((time - (lastTime || time)) / 1000, .05); lastTime = time;
    if (!paused && !obscured && !document.hidden && !game?.ended) {
      let remaining = elapsed;
      while (remaining > 0) { const dt = Math.min(remaining, 1 / 120); step(dt); remaining -= dt; }
      goalFlash = Math.max(0, goalFlash - elapsed);
    }
    draw(); frameId = requestAnimationFrame(frame);
  }
  function down(event: PointerEvent) {
    tappedLink = null;
    if (event.button !== 0 || obscured || game?.ended) return;
    if (particles.length) { restore(); return; }
    if (Math.hypot(event.clientX - ball.x, event.clientY - ball.y) > extent(ball) + 12) return;
    canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && !game) {
      const [a, b] = Array.from(pointers.values()); pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), radius: ball.r };
      lastTap.time = 0; return;
    }
    drag = { id: event.pointerId, dx: event.clientX - ball.x, dy: event.clientY - ball.y,
      startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY,
      started: performance.now(), time: performance.now(), moved: false, pressure: 0 };
    ball.vx = ball.vy = 0; canvas.style.cursor = "grabbing";
  }
  function move(event: PointerEvent) {
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      ball.r = clamp(pinch.radius * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(pinch.distance, 1), baseRadius * .45, Math.min(width, height) * .43);
      contain(ball); if (drag) drag.moved = true; return;
    }
    if (!drag || drag.id !== event.pointerId) {
      canvas.style.cursor = linkAt(event.clientX, event.clientY) ? "pointer"
        : Math.hypot(event.clientX - ball.x, event.clientY - ball.y) <= extent(ball) ? "grab" : "default";
      return;
    }
    const now = performance.now(), dt = Math.max(.008, (now - drag.time) / 1000);
    ball.vx = clamp((event.clientX - drag.lastX) / dt, -2200, 2200);
    ball.vy = clamp((event.clientY - drag.lastY) / dt, -2200, 2200);
    const rawX = event.clientX - drag.dx, rawY = event.clientY - drag.dy;
    // One pointer event can carry the paddle clean past the puck, so walk it there in hops too
    // short to skip the puck and strike at each one.
    const fromX = ball.x, fromY = ball.y, live = !!puck && !paused;
    const hops = live ? Math.max(1, Math.ceil(Math.hypot(rawX - fromX, rawY - fromY) / (ball.r / 2))) : 1;
    for (let hop = 1; hop <= hops; hop++) {
      ball.x = fromX + (rawX - fromX) * hop / hops; ball.y = fromY + (rawY - fromY) * hop / hops;
      contain(ball); if (live) strike();
    }
    const px = Math.abs(rawX - ball.x), py = Math.abs(rawY - ball.y);
    drag.pressure = Math.max(px, py);
    ball.sx = 1 - Math.min(.45, px / ball.r * .6) + Math.min(.2, py / ball.r * .2);
    ball.sy = 1 - Math.min(.45, py / ball.r * .6) + Math.min(.2, px / ball.r * .2);
    drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8;
    drag.lastX = event.clientX; drag.lastY = event.clientY; drag.time = now;
  }
  function up(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (pinch) { if (pointers.size < 2) { pinch = null; drag = null; ball.vx = ball.vy = 0; } return; }
    if (!drag || drag.id !== event.pointerId) return;
    const now = performance.now();
    const tap = !drag.moved && now - drag.started < 270 && event.type !== "pointercancel";
    if (now - drag.time > 90 || paused || event.type === "pointercancel") ball.vx = ball.vy = 0;
    drag = null; burstTime = 0; canvas.style.cursor = "grab";
    // A tap on a linked word opens it from the click that follows, which every browser accepts as
    // a gesture that may open a tab.
    if (tap && (tappedLink = linkAt(event.clientX, event.clientY))) { lastTap.time = 0; return; }
    if (tap) {
      if (now - lastTap.time < 330 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 35) {
        lastTap.time = 0; if (game) reset(); else startGame();
      } else lastTap = { time: now, x: event.clientX, y: event.clientY };
    }
  }
  canvas.addEventListener("pointerdown", down, options);
  canvas.addEventListener("pointermove", move, options);
  canvas.addEventListener("pointerup", up, options);
  canvas.addEventListener("pointercancel", up, options);
  canvas.addEventListener("lostpointercapture", (event) => {
    pointers.delete(event.pointerId); if (drag?.id === event.pointerId) drag = null;
  }, options);
  canvas.addEventListener("click", () => {
    const href = tappedLink; tappedLink = null;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }, options);
  canvas.addEventListener("dblclick", event => event.preventDefault(), options);
  // Sound is on from the start, so the first gesture anywhere on the page wakes the speaker.
  for (const gesture of ["pointerdown", "pointerup", "keydown", "click"])
    window.addEventListener(gesture, () => { if (sound) speaker(); }, { signal: abort.signal, capture: true });
  canvas.addEventListener("keydown", event => {
    if (obscured || game?.ended) return;
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter", "escape", "r", "c", "p"].includes(key)) event.preventDefault();
    if (key === "enter") { if (game) reset(); else startGame(); }
    if (key === "r" || key === "escape") reset();
    if (key === "c") setTheme(theme + 1);
    if (key === "p" || key === " ") setPaused(!paused);
    const dx = key === "arrowleft" ? -1 : key === "arrowright" ? 1 : 0;
    const dy = key === "arrowup" ? -1 : key === "arrowdown" ? 1 : 0;
    if (dx || dy) {
      // A held key repeats about 30 times a second. Outside the game each repeat would be another
      // wall bump and strobe the page color, so there only the press itself kicks.
      if (game || !event.repeat) { ball.vx += dx * 300; ball.vy += dy * 300; }
      if (paused) { ball.x += dx * 18; ball.y += dy * 18; contain(ball); }
    }
  }, options);
  window.addEventListener("resize", resize, options);
  window.addEventListener("blur", () => { drag = null; pinch = null; pointers.clear(); ball.vx = ball.vy = 0; }, options);
  reduceMotion.addEventListener("change", event => setPaused(event.matches), options);
  resize(); setTheme(0); callbacks.onPauseChange(paused); draw(); frameId = requestAnimationFrame(frame);
  return {
    reset, startGame, setPaused,
    setObscured(value) { obscured = value; drag = null; pinch = null; pointers.clear(); },
    setSound(value) { sound = value; if (sound) tone(400, 250); },
    destroy() {
      destroyed = true; abort.abort(); cancelAnimationFrame(frameId); void audio?.close().catch(() => {});
      document.documentElement.style.removeProperty("--page-bg"); document.documentElement.style.removeProperty("--page-fg");
    },
  };
}
