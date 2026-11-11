const TAU = Math.PI * 2;
const COPY = "i'm building abstract — compute and physical ai. on the internet as quantbagel. say hello on x.";
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
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
// Glyph sprites are drawn at this multiple of the screen's resolution, so a sprite turned to any
// angle is scaled down, which keeps its edges as clean as freshly drawn text.
const SUPERSAMPLE = 2;
type Ball = { x: number; y: number; vx: number; vy: number; r: number; angle: number; sx: number; sy: number };
type Particle = { index: number; x: number; y: number; vx: number; vy: number; angle: number; spin: number; targetX: number; targetY: number; targetAngle: number };
export type Playground = { destroy: () => void };

export function createPlayground(canvas: HTMLCanvasElement): Playground {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const ctx = context;
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduceMotion.matches, destroyed = false;
  let width = 0, height = 0, ratio = 1, baseRadius = 180;
  let theme = 0;
  let lastSound = 0, lastTime = 0, frameId = 0;
  let ball: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 180, angle: Math.PI, sx: 1, sy: 1 };
  let drag: { id: number; dx: number; dy: number; startX: number; startY: number; lastX: number; lastY: number; time: number; started: number; moved: boolean; pressure: number } | null = null;
  let tappedLink: string | null = null;
  let pinch: { distance: number; radius: number } | null = null;
  const pointers = new Map<number, { x: number; y: number }>();
  let particles: Particle[] = [], burstTime = 0, returning = false;
  // The glyph advances are measured once, not on every animation frame.
  ctx.font = `400 26px ${FONT}`;
  const glyphs = Array.from(COPY).map((char, index) => ({ char, width: ctx.measureText(char).width, linked: !!linkOf(index), sprite: 0, plain: 0 }));
  const textWidth = glyphs.reduce((sum, glyph) => sum + glyph.width, 0);

  // Turned text is the one costly thing on this page. The browser rasterises a glyph afresh for
  // every new angle, and on a turning ring that is every glyph on every frame. So each distinct
  // glyph is drawn once, upright, into this atlas, and a frame only copies sprites out of it.
  const atlas = document.createElement("canvas"), atlasContext = atlas.getContext("2d");
  if (!atlasContext) throw new Error("Canvas is unavailable");
  const atlasCtx = atlasContext;
  const sprites: { char: string; width: number; linked: boolean; x: number; y: number; w: number }[] = [];
  const spriteFor = (glyph: { char: string; width: number }, linked: boolean) => {
    const found = sprites.findIndex(other => other.char === glyph.char && other.linked === linked);
    return found < 0 ? sprites.push({ char: glyph.char, width: glyph.width, linked, x: 0, y: 0, w: 0 }) - 1 : found;
  };
  // A linked glyph carries its underline in the ring and loses it when the letters scatter.
  for (const glyph of glyphs) { glyph.plain = spriteFor(glyph, false); glyph.sprite = spriteFor(glyph, glyph.linked); }
  // What the atlas was last drawn for. Sizes are in CSS pixels; `scale` converts them to atlas pixels.
  let drawn = { px: 0, stretch: 0, scale: 0, color: "", ascent: 0, height: 0 };
  function prepareSprites() {
    const px = fontSize(ball), fontScale = px / 26, color = COLORS[theme][1], scale = ratio * SUPERSAMPLE;
    const stretch = (TAU * ball.r - 19.5 * fontScale) / textWidth / fontScale;
    if (px === drawn.px && stretch === drawn.stretch && scale === drawn.scale && color === drawn.color) return;
    // Each sprite gets a margin so overhanging strokes and soft edges are never clipped.
    const margin = Math.ceil(px * .3) + 2, ascent = Math.ceil(px) + 1, height = ascent + Math.ceil(px * .32) + 2;
    let x = 0, y = 0, widest = 0;
    for (const sprite of sprites) {
      sprite.w = Math.ceil(sprite.width * fontScale * stretch) + margin * 2;
      if (x && (x + sprite.w) * scale > 2048) { x = 0; y += height; }
      sprite.x = x; sprite.y = y; x += sprite.w; widest = Math.max(widest, x);
    }
    atlas.width = Math.ceil(widest * scale); atlas.height = Math.ceil((y + height) * scale);
    atlasCtx.font = `400 ${px}px ${FONT}`; atlasCtx.textAlign = "center"; atlasCtx.textBaseline = "alphabetic";
    atlasCtx.fillStyle = color;
    for (const sprite of sprites) {
      atlasCtx.setTransform(scale * stretch, 0, 0, scale, (sprite.x + sprite.w / 2) * scale, (sprite.y + ascent) * scale);
      atlasCtx.fillText(sprite.char, 0, 0);
      if (sprite.linked) {
        const span = sprite.width * fontScale + 1;
        atlasCtx.fillRect(-span / 2, 4 * fontScale, span, Math.max(1, 1.5 * fontScale));
      }
    }
    drawn = { px, stretch, scale, color, ascent, height };
  }
  function drawSprite(sprite: (typeof sprites)[number], x: number, y: number, angle: number) {
    const scale = drawn.scale;
    const cos = Math.cos(angle) * ratio, sin = Math.sin(angle) * ratio;
    ctx.setTransform(cos, sin, -sin, cos, x * ratio, y * ratio);
    ctx.drawImage(atlas, sprite.x * scale, sprite.y * scale, sprite.w * scale, drawn.height * scale,
      -sprite.w / 2, -drawn.ascent, sprite.w, drawn.height);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  function setTheme(index: number) {
    theme = index % COLORS.length;
    document.documentElement.style.setProperty("--page-bg", COLORS[theme][0]);
    document.documentElement.style.setProperty("--page-fg", COLORS[theme][1]);
    themeColor?.setAttribute("content", COLORS[theme][0]);
  }
  // The audio context is built now, before the first frame. Building one takes a few
  // milliseconds, and up to a tenth of a second when the browser has to start its audio service,
  // and built on demand that pause landed on the ring's first bounce. Browsers keep the context
  // suspended until a gesture. Until then nothing is played: notes scheduled on a suspended
  // context would all sound at once when it starts.
  const audio = typeof AudioContext === "function" ? new AudioContext() : null;
  function wakeAudio() {
    // A browser may decline to start audio for a gesture it does not count. The next gesture asks again.
    if (audio && audio.state !== "running") void audio.resume().catch(() => {});
  }
  function tone(force: number, frequency = 160) {
    if (!audio || audio.state !== "running" || performance.now() - lastSound < 35) return;
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
  }
  function resize() {
    const oldWidth = width, oldHeight = height;
    width = canvas.clientWidth; height = canvas.clientHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const size = Math.min(height * .550469, width - 12, height - 12);
    baseRadius = Math.max(42, Math.min(size * (width <= 700 ? .3125 : .425), (width - 36) / 2, (height - 36) / 2));
    ball.r = baseRadius;
    ball.x = oldWidth ? ball.x / oldWidth * width : width / 2;
    ball.y = oldHeight ? ball.y / oldHeight * height : height / 2;
    contain(ball);
    particles = [];
  }
  function extent(body: Ball) { return body.r + fontSize(body) * .65; }
  function fontSize(body: Ball) { return Math.min(26, 26 * body.r / baseRadius); }
  function contain(body: Ball) {
    const edge = extent(body);
    body.x = clamp(body.x, edge, Math.max(edge, width - edge));
    body.y = clamp(body.y, edge, Math.max(edge, height - edge));
  }
  function reset() {
    particles = []; drag = null; pinch = null; pointers.clear();
    ball = { x: width / 2, y: height / 2, vx: 0, vy: 0, r: baseRadius, angle: Math.PI, sx: 1, sy: 1 };
    setTheme(0); paused = reduceMotion.matches;
    canvas.style.cursor = "default";
  }
  function forGlyphs(body: Ball, visit: (index: number, x: number, y: number, angle: number) => void) {
    const fontScale = fontSize(body) / 26;
    const gap = 19.5 * fontScale;
    const scale = (TAU * body.r - gap) / textWidth;
    let angle = body.angle + gap / body.r / 2;
    for (let index = 0; index < glyphs.length; index++) {
      const arc = glyphs[index].width * scale / body.r;
      const mid = angle + arc / 2;
      visit(index, body.x + Math.cos(mid) * body.r * body.sx, body.y + Math.sin(mid) * body.r * body.sy,
        Math.atan2(Math.cos(mid) * body.sy, -Math.sin(mid) * body.sx));
      angle += arc;
    }
  }
  function linkAt(x: number, y: number) {
    if (particles.length) return null;
    let nearest = Math.max(22, fontSize(ball)), found: string | null = null;
    forGlyphs(ball, (index, glyphX, glyphY) => {
      const link = linkOf(index), distance = Math.hypot(glyphX - x, glyphY - y);
      if (link && distance < nearest) { nearest = distance; found = link.href; }
    });
    return found as string | null;
  }
  function burst() {
    if (particles.length) return;
    ball.sx = ball.sy = 1;
    forGlyphs(ball, (index, x, y, angle) => {
      particles.push({ index, x, y, vx: (x - ball.x) * (1.6 + Math.random()) + ball.vx * .2,
        vy: (y - ball.y) * (1.6 + Math.random()) - 190, angle, spin: (Math.random() - .5) * 5,
        targetX: 0, targetY: 0, targetAngle: 0 });
    });
    burstTime = 0; returning = false; drag = null; tone(900, 300);
  }
  function restore() {
    if (!particles.length || returning) return;
    returning = true; burstTime = 0; ball.x = width / 2; ball.y = height / 2; ball.vx = ball.vy = 0;
    let index = 0;
    forGlyphs(ball, (_glyph, x, y, angle) => {
      Object.assign(particles[index++], { targetX: x, targetY: y, targetAngle: angle });
    });
  }
  function wall(body: Ball, dt: number) {
    const edge = extent(body);
    body.x += body.vx * dt; body.y += body.vy * dt;
    // A bump is any impact into a wall at BUMP speed or more. Each one squashes the ring, sounds,
    // and turns the page color. A slower touch settles against the wall instead of rebounding, so
    // nothing bounces without registering.
    let hit = 0;
    const rebound = (speed: number, restitution: number, sx: number, sy: number) => {
      if (speed < BUMP) return 0;
      hit = Math.max(hit, speed); body.sx = sx; body.sy = sy;
      return speed * restitution;
    };
    if (body.x < edge) { body.x = edge; if (body.vx < 0) body.vx = rebound(-body.vx, .85, .82, 1.12); }
    if (body.x > width - edge) { body.x = width - edge; if (body.vx > 0) body.vx = -rebound(body.vx, .85, .82, 1.12); }
    if (body.y < edge) { body.y = edge; if (body.vy < 0) body.vy = rebound(-body.vy, .85, 1.12, .8); }
    if (body.y > height - edge) {
      body.y = height - edge;
      if (body.vy > 0) body.vy = -rebound(body.vy, .8, 1.12, .8);
      body.vx *= Math.pow(.97, dt * 60);
    }
    if (hit) { tone(hit); setTheme(theme + 1); }
    body.vx *= Math.pow(.998, dt * 60);
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
    ball.angle += dt * TAU / 40; // one turn every 40 seconds
    ball.sx += (1 - ball.sx) * Math.min(1, dt * 12); ball.sy += (1 - ball.sy) * Math.min(1, dt * 12);
    if (drag) {
      if (drag.pressure > ball.r * .42) { burstTime += dt; if (burstTime > .9) burst(); }
      else burstTime = 0;
    } else {
      ball.vy += 400 * dt;
      wall(ball, dt);
    }
  }
  function draw() {
    prepareSprites();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (particles.length) for (const p of particles) drawSprite(sprites[glyphs[p.index].plain], p.x, p.y, p.angle);
    else forGlyphs(ball, (index, x, y, angle) => drawSprite(sprites[glyphs[index].sprite], x, y, angle));
  }
  function frame(time: number) {
    if (destroyed) return;
    const elapsed = Math.min((time - (lastTime || time)) / 1000, .05); lastTime = time;
    if (!paused && !document.hidden) {
      let remaining = elapsed;
      while (remaining > 0) { const dt = Math.min(remaining, 1 / 120); step(dt); remaining -= dt; }
    }
    draw(); frameId = requestAnimationFrame(frame);
  }
  function down(event: PointerEvent) {
    tappedLink = null;
    if (event.button !== 0) return;
    if (particles.length) { restore(); return; }
    if (Math.hypot(event.clientX - ball.x, event.clientY - ball.y) > extent(ball) + 12) return;
    canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values()); pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), radius: ball.r };
      return;
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
    ball.x = rawX; ball.y = rawY; contain(ball);
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
    if (tap) tappedLink = linkAt(event.clientX, event.clientY);
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
  // Sound is always on, so the first gesture anywhere on the page wakes the speaker.
  for (const gesture of ["pointerdown", "pointerup", "keydown", "click"])
    window.addEventListener(gesture, wakeAudio, { signal: abort.signal, capture: true });
  canvas.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "escape", "r", "c", "p"].includes(key)) event.preventDefault();
    if (key === "r" || key === "escape") reset();
    if (key === "c") setTheme(theme + 1);
    if (key === "p" || key === " ") paused = !paused;
    const dx = key === "arrowleft" ? -1 : key === "arrowright" ? 1 : 0;
    const dy = key === "arrowup" ? -1 : key === "arrowdown" ? 1 : 0;
    if (dx || dy) {
      // A held key repeats about 30 times a second. Each repeat would be another wall bump and
      // strobe the page color, so only the press itself kicks.
      if (!event.repeat) { ball.vx += dx * 300; ball.vy += dy * 300; }
      if (paused) { ball.x += dx * 18; ball.y += dy * 18; contain(ball); }
    }
  }, options);
  window.addEventListener("resize", resize, options);
  window.addEventListener("blur", () => { drag = null; pinch = null; pointers.clear(); ball.vx = ball.vy = 0; }, options);
  reduceMotion.addEventListener("change", event => { paused = event.matches; }, options);
  resize(); setTheme(0); draw(); frameId = requestAnimationFrame(frame);
  return {
    destroy() {
      destroyed = true; abort.abort(); cancelAnimationFrame(frameId); void audio?.close().catch(() => {});
      atlas.width = atlas.height = 0;
      document.documentElement.style.removeProperty("--page-bg"); document.documentElement.style.removeProperty("--page-fg");
    },
  };
}
