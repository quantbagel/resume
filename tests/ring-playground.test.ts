import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { createPlayground, type Playground } from "../src/lib/ring-playground";

let instance: Playground | undefined;
let cleanup = () => {};
afterEach(() => { instance?.destroy(); instance = undefined; cleanup(); });

function setup(reducedMotion = false) {
  const saved = new Map<string, PropertyDescriptor | undefined>();
  const globals = (name: string, value: unknown) => {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  };
  let now = 1000, nextFrame: FrameRequestCallback | undefined;
  let frames = 0, invalidDraws = 0, colorChanges = 0;
  let glyphs: number[][] = [];
  const colors = new Map();
  const media = Object.assign(new EventTarget(), { matches: reducedMotion });
  const opened: string[] = [];
  const win = Object.assign(new EventTarget(), { open: (href: string) => { opened.push(href); } });
  const context = new Proxy({}, { get: (_target, key) => key === "measureText" ? () => ({ width: 12 }) : (...args: unknown[]) => {
    if (args.some(value => typeof value === "number" && !Number.isFinite(value))) invalidDraws++;
    if (key === "clearRect") glyphs = [];
    if (key === "translate") glyphs.push(args as number[]);
  } });
  const canvas = Object.assign(new EventTarget(), {
    clientWidth: 1280, clientHeight: 800, width: 0, height: 0, style: { cursor: "default" },
    getContext: () => context, focus: () => {}, setPointerCapture: () => {},
    hasPointerCapture: () => false, releasePointerCapture: () => {},
  });
  globals("window", win);
  globals("document", { hidden: false, documentElement: { style: {
    setProperty: (key: string, value: string) => { colors.set(key, value); if (key === "--page-bg") colorChanges++; }, removeProperty: (key: string) => colors.delete(key),
  } }, querySelector: () => null });
  globals("matchMedia", () => media);
  globals("devicePixelRatio", 2);
  globals("performance", { now: () => now });
  globals("requestAnimationFrame", (callback: FrameRequestCallback) => { nextFrame = callback; return ++frames; });
  globals("cancelAnimationFrame", () => { nextFrame = undefined; });
  const rounds: number[] = [], games: ({ score: number; seconds: number } | null)[] = [], pauses: boolean[] = [];
  instance = createPlayground(canvas as unknown as HTMLCanvasElement, {
    onGameChange: value => games.push(value), onRoundEnd: value => rounds.push(value), onPauseChange: value => pauses.push(value),
  });
  cleanup = () => { for (const [key, descriptor] of Array.from(saved)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  } };
  const advance = (seconds: number) => {
    for (let i = 0; i < Math.ceil(seconds * 120); i++) { now += 1000 / 120; const callback = nextFrame; nextFrame = undefined; callback?.(now); }
  };
  const send = (type: string, properties: Record<string, unknown>) => canvas.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), properties));
  const pointer = (type: string, x: number, y: number) => send(type, { clientX: x, clientY: y, button: 0, pointerId: 1 });
  const key = (key: string, repeat = false) => send("keydown", { key, repeat });
  // Watches the ring as a visitor would. Its centre is read back from the drawn glyphs, and a bounce
  // is an axis reversing within two frames: a wall does that, the top of an arc takes about ten.
  const watch = (seconds: number) => {
    const centre = () => [0, 1].map(axis => (Math.min(...glyphs.map(g => g[axis])) + Math.max(...glyphs.map(g => g[axis]))) / 2);
    const heading = [{ sign: 0, age: 9 }, { sign: 0, age: 9 }], before = colorChanges;
    let last = centre(), bounces = 0;
    for (let i = 0; i < seconds * 120; i++) {
      advance(1 / 120);
      const next = centre();
      heading.forEach((axis, index) => {
        const moved = next[index] - last[index];
        axis.age++;
        if (Math.abs(moved) <= .15) return;
        if (axis.sign && Math.sign(moved) !== axis.sign && axis.age <= 2) bounces++;
        axis.sign = Math.sign(moved); axis.age = 0;
      });
      last = next;
    }
    return { bounces, colorChanges: colorChanges - before };
  };
  const tap = (index: number) => { const [x, y] = glyphs[index]; pointer("pointerdown", x, y); pointer("pointerup", x, y); send("click", {}); };
  return { canvas, win, games, rounds, pauses, colors, opened, globals, advance, pointer, key, watch, tap, glyph: (index: number) => glyphs[index], get invalidDraws() { return invalidDraws; }, get framePending() { return !!nextFrame; } };
}

test("a double tap starts a 15-second round, produces one result, and resets", () => {
  const env = setup();
  env.pointer("pointerdown", 640, 400); env.pointer("pointerup", 640, 400);
  env.advance(.1);
  env.pointer("pointerdown", 640, 400); env.pointer("pointerup", 640, 400);
  assert.deepEqual(env.games.at(-1), { score: 0, seconds: 15 });
  env.advance(16);
  assert.deepEqual(env.rounds, [0]);
  env.advance(2);
  assert.equal(env.rounds.length, 1);
  instance!.reset();
  assert.equal(env.games.at(-1), null);
});

test("dragging or cancelling is not counted as a double tap", () => {
  const env = setup();
  env.pointer("pointerdown", 640, 400); env.pointer("pointermove", 760, 400); env.pointer("pointerup", 760, 400);
  env.pointer("pointerdown", 760, 400); env.pointer("pointercancel", 760, 400);
  assert.equal(env.games.length, 0);
});

test("the game timer pauses while info is open", () => {
  const env = setup();
  instance!.startGame();
  env.advance(1);
  instance!.setObscured(true);
  const seconds = env.games.at(-1)!.seconds;
  env.advance(20);
  assert.equal(env.games.at(-1)!.seconds, seconds);
  assert.equal(env.rounds.length, 0);
  instance!.setObscured(false);
  env.advance(16);
  assert.equal(env.rounds.length, 1);
  assert.equal(env.invalidDraws, 0);
});

test("reduced motion, keyboard controls, and listener cleanup work", () => {
  const env = setup(true);
  assert.equal(env.pauses.at(-1), true);
  env.key("c"); assert.equal(env.colors.get("--page-bg"), "#163cff");
  env.key("p"); assert.equal(env.pauses.at(-1), false);
  env.key("Enter"); assert.equal(env.games.at(-1)?.seconds, 15);
  env.key("Escape"); assert.equal(env.games.at(-1), null);
  assert.equal(env.pauses.at(-1), true);
  instance!.destroy(); instance = undefined;
  assert.equal(env.framePending, false);
  env.key("Enter"); assert.equal(env.games.at(-1), null);
});

test("mobile resize and long simulation keep drawing finite coordinates", () => {
  const env = setup();
  env.canvas.clientWidth = 320; env.canvas.clientHeight = 568;
  env.win.dispatchEvent(new Event("resize"));
  assert.equal(env.canvas.width, 640); assert.equal(env.canvas.height, 1136);
  env.advance(60);
  assert.equal(env.framePending, true);
  instance!.startGame(); env.advance(16);
  assert.equal(env.rounds.length, 1);
  assert.equal(env.invalidDraws, 0);
});

test("a hit through the goal increments the score", () => {
  const env = setup();
  instance!.startGame();
  env.pointer("pointerdown", 640, 608);
  env.pointer("pointermove", 640, 400);
  env.advance(.05);
  env.pointer("pointerup", 640, 400);
  env.advance(1);
  assert.ok(env.games.at(-1)!.score >= 1);
});

test("every bounce off the floor changes the color until the ring settles", () => {
  const env = setup();
  const seen = env.watch(16);
  assert.ok(seen.bounces >= 10);
  assert.equal(seen.colorChanges, seen.bounces);
  assert.deepEqual(env.watch(2), { bounces: 0, colorChanges: 0 });
});

test("side walls and the ceiling change the color on every bump too", () => {
  const env = setup();
  for (const key of ["ArrowLeft", "ArrowLeft", "ArrowUp", "ArrowUp", "ArrowUp"]) env.key(key);
  const seen = env.watch(5);
  assert.ok(seen.bounces >= 5);
  assert.equal(seen.colorChanges, seen.bounces);
});

test("a held arrow key kicks the ring once instead of bumping on every key repeat", () => {
  const env = setup();
  env.key("ArrowDown");
  let colorChanges = 0;
  for (let i = 0; i < 60; i++) { env.key("ArrowDown", true); colorChanges += env.watch(1 / 30).colorChanges; }
  assert.ok(colorChanges >= 1 && colorChanges <= 4);
});

test("a swipe that carries the paddle past the puck in one move still strikes it", () => {
  const env = setup();
  instance!.startGame();
  env.pointer("pointerdown", 640, 608);
  env.pointer("pointermove", 640, 120);
  env.pointer("pointerup", 640, 120);
  env.advance(1);
  assert.ok(env.games.at(-1)!.score >= 1);
});

const COPY = "lucas miranda is building abstract — ai and robotics. on the internet as quantbagel. say hello on x.";

test("tapping abstract or x in the ring opens its link, and other letters do not", () => {
  const env = setup(true);
  env.tap(COPY.indexOf("abstract") + 3);
  env.tap(COPY.length - 2);
  assert.deepEqual(env.opened, ["https://abstract.inc/inference", "https://x.com/quantbagel"]);
  env.tap(COPY.indexOf("miranda"));
  env.tap(COPY.indexOf("quantbagel") + 4);
  assert.equal(env.opened.length, 2);
  assert.equal(env.games.length, 0);
});

test("dragging from a linked word moves the ring instead of opening the link", () => {
  const env = setup(true);
  const [x, y] = env.glyph(COPY.indexOf("abstract"));
  env.pointer("pointerdown", x, y); env.pointer("pointermove", x + 60, y); env.pointer("pointerup", x + 60, y);
  env.canvas.dispatchEvent(new Event("click"));
  assert.deepEqual(env.opened, []);
});

test("sound is on from the start but stays silent until the browser allows audio", () => {
  const env = setup();
  let notes = 0, state = "suspended";
  const node = { connect() {}, disconnect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
  env.globals("AudioContext", class {
    currentTime = 0; destination = {};
    get state() { return state; }
    resume() { return Promise.resolve(); } close() { return Promise.resolve(); }
    createOscillator() { notes++; return { ...node, type: "" }; } createGain() { return node; }
  });
  env.advance(1.2);
  assert.equal(notes, 0);
  state = "running";
  env.advance(2);
  assert.ok(notes >= 1);
});
