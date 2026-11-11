import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { createPlayground, type Playground } from "../src/lib/ring-playground";

let instance: Playground | undefined;
let cleanup = () => {};
afterEach(() => { instance?.destroy(); instance = undefined; cleanup(); });

function setup(reducedMotion = false, prepare?: (globals: (name: string, value: unknown) => void) => void) {
  const saved = new Map<string, PropertyDescriptor | undefined>();
  const globals = (name: string, value: unknown) => {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  };
  let now = 1000, nextFrame: FrameRequestCallback | undefined;
  let frames = 0, invalidDraws = 0, colorChanges = 0;
  let glyphs: number[][] = [], transform: number[] = [];
  const atlasDraws: string[] = [];
  const colors = new Map();
  const media = Object.assign(new EventTarget(), { matches: reducedMotion });
  const opened: string[] = [];
  const win = Object.assign(new EventTarget(), { open: (href: string) => { opened.push(href); } });
  // Each glyph is a sprite copied out of the atlas, placed by the transform set just before it.
  const context = new Proxy({}, { get: (_target, key) => key === "measureText" ? () => ({ width: 12 }) : (...args: unknown[]) => {
    if (args.some(value => typeof value === "number" && !Number.isFinite(value))) invalidDraws++;
    if (key === "clearRect") glyphs = [];
    if (key === "setTransform") transform = args as number[];
    if (key === "drawImage") glyphs.push([transform[4] / 2, transform[5] / 2]);
  } });
  const atlasContext = new Proxy({}, { get: (_target, key) => (...args: unknown[]) => { if (key === "fillText") atlasDraws.push(args[0] as string); } });
  const canvas = Object.assign(new EventTarget(), {
    clientWidth: 1280, clientHeight: 800, width: 0, height: 0, style: { cursor: "default" },
    getContext: () => context, focus: () => {}, setPointerCapture: () => {},
    hasPointerCapture: () => false, releasePointerCapture: () => {},
  });
  globals("window", win);
  globals("document", { hidden: false, documentElement: { style: {
    setProperty: (key: string, value: string) => { colors.set(key, value); if (key === "--page-bg") colorChanges++; }, removeProperty: (key: string) => colors.delete(key),
  } }, querySelector: () => null, createElement: () => ({ width: 0, height: 0, getContext: () => atlasContext }) });
  globals("matchMedia", () => media);
  globals("devicePixelRatio", 2);
  globals("performance", { now: () => now });
  globals("requestAnimationFrame", (callback: FrameRequestCallback) => { nextFrame = callback; return ++frames; });
  globals("cancelAnimationFrame", () => { nextFrame = undefined; });
  prepare?.(globals);
  instance = createPlayground(canvas as unknown as HTMLCanvasElement);
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
  return { canvas, win, colors, opened, atlasDraws, advance, pointer, key, watch, tap, glyph: (index: number) => glyphs[index], get invalidDraws() { return invalidDraws; }, get framePending() { return !!nextFrame; } };
}

test("a double tap no longer starts anything", () => {
  const env = setup(true);
  env.pointer("pointerdown", 640, 400); env.pointer("pointerup", 640, 400);
  env.advance(.1);
  env.pointer("pointerdown", 640, 400); env.pointer("pointerup", 640, 400);
  env.key("Enter");
  const before = env.glyph(0);
  env.advance(1);
  assert.deepEqual(env.glyph(0), before);
  assert.equal(env.colors.get("--page-bg"), "#000000");
});

test("reduced motion, keyboard controls, and listener cleanup work", () => {
  const env = setup(true);
  assert.deepEqual(env.watch(1), { bounces: 0, colorChanges: 0 });
  env.key("c"); assert.equal(env.colors.get("--page-bg"), "#163cff");
  env.key("p"); assert.ok(env.watch(3).bounces >= 1);
  env.key("Escape"); assert.equal(env.colors.get("--page-bg"), "#000000");
  assert.deepEqual(env.watch(1), { bounces: 0, colorChanges: 0 });
  instance!.destroy(); instance = undefined;
  assert.equal(env.framePending, false);
  env.key("c"); assert.equal(env.colors.has("--page-bg"), false);
});

test("mobile resize and long simulation keep drawing finite coordinates", () => {
  const env = setup();
  env.canvas.clientWidth = 320; env.canvas.clientHeight = 568;
  env.win.dispatchEvent(new Event("resize"));
  assert.equal(env.canvas.width, 640); assert.equal(env.canvas.height, 1136);
  env.advance(60);
  assert.equal(env.framePending, true);
  assert.equal(env.invalidDraws, 0);
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

const COPY = "i'm building abstract — compute and physical ai. on the internet as quantbagel. say hello on x.";

test("tapping abstract or x in the ring opens its link, and other letters do not", () => {
  const env = setup(true);
  env.tap(COPY.indexOf("abstract") + 3);
  env.tap(COPY.length - 2);
  assert.deepEqual(env.opened, ["https://abstract.inc/inference", "https://x.com/quantbagel"]);
  env.tap(COPY.indexOf("building"));
  env.tap(COPY.indexOf("quantbagel") + 4);
  assert.equal(env.opened.length, 2);
});

test("dragging from a linked word moves the ring instead of opening the link", () => {
  const env = setup(true);
  const [x, y] = env.glyph(COPY.indexOf("abstract"));
  env.pointer("pointerdown", x, y); env.pointer("pointermove", x + 60, y); env.pointer("pointerup", x + 60, y);
  env.canvas.dispatchEvent(new Event("click"));
  assert.deepEqual(env.opened, []);
});

test("sound is on from the start but stays silent until the browser allows audio", () => {
  let notes = 0, state = "suspended";
  const node = { connect() {}, disconnect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
  const env = setup(false, globals => globals("AudioContext", class {
    currentTime = 0; destination = {};
    get state() { return state; }
    resume() { return Promise.resolve(); } close() { return Promise.resolve(); }
    createOscillator() { notes++; return { ...node, type: "" }; } createGain() { return node; }
  }));
  env.advance(1.2);
  assert.equal(notes, 0);
  state = "running";
  env.advance(2);
  assert.ok(notes >= 1);
});

test("glyphs are rasterised once into the atlas, then again only when their color or size changes", () => {
  const env = setup();
  // One sprite for each distinct character, and one more, underlined, for each distinct character in a link.
  const linked = (index: number) => index >= COPY.indexOf("abstract") && index < COPY.indexOf("abstract") + 8 || index === COPY.length - 2;
  const distinct = new Set(Array.from(COPY).flatMap((char, index) => linked(index) ? [char, char + " underlined"] : [char]));
  assert.equal(env.atlasDraws.length, distinct.size);
  env.advance(.5); // still falling: every frame turns the ring, and none of them rasterises text
  assert.equal(env.atlasDraws.length, distinct.size);
  env.key("c"); env.advance(.05); // blue keeps white text
  assert.equal(env.atlasDraws.length, distinct.size);
  env.key("c"); env.key("c"); env.advance(.05); // lime needs dark text
  assert.equal(env.atlasDraws.length, distinct.size * 2);
});

test("letters pressed hard against an edge scatter, fall, and fly back into a ring", () => {
  const env = setup();
  const spread = () => { const xs = Array.from(COPY, (_char, index) => env.glyph(index)[0]); return Math.max(...xs) - Math.min(...xs); };
  const ringWidth = spread();
  const [x, y] = env.glyph(0);
  env.pointer("pointerdown", x, y); env.pointer("pointermove", x, y + 900); // pressed hard into the floor
  env.advance(2.5);
  assert.ok(spread() > ringWidth * 1.5); // the letters have flown apart
  env.pointer("pointerup", x, y + 900);
  env.advance(4.5);
  assert.ok(Math.abs(spread() - ringWidth) < 30); // a ring again
  assert.equal(env.invalidDraws, 0);
});
