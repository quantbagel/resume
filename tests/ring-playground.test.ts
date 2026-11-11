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
  let frames = 0, invalidDraws = 0;
  const colors = new Map();
  const media = Object.assign(new EventTarget(), { matches: reducedMotion });
  const win = new EventTarget();
  const context = new Proxy({}, { get: (_target, key) => key === "measureText" ? () => ({ width: 12 }) : (...args: unknown[]) => { if (args.some(value => typeof value === "number" && !Number.isFinite(value))) invalidDraws++; } });
  const canvas = Object.assign(new EventTarget(), {
    clientWidth: 1280, clientHeight: 800, width: 0, height: 0, style: { cursor: "default" },
    getContext: () => context, focus: () => {}, setPointerCapture: () => {},
    hasPointerCapture: () => false, releasePointerCapture: () => {},
  });
  globals("window", win);
  globals("document", { hidden: false, documentElement: { style: {
    setProperty: (key: string, value: string) => colors.set(key, value), removeProperty: (key: string) => colors.delete(key),
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
  cleanup = () => { for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  } };
  const advance = (seconds: number) => {
    for (let i = 0; i < Math.ceil(seconds * 120); i++) { now += 1000 / 120; const callback = nextFrame; nextFrame = undefined; callback?.(now); }
  };
  const send = (type: string, properties: Record<string, unknown>) => canvas.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), properties));
  const pointer = (type: string, x: number, y: number) => send(type, { clientX: x, clientY: y, button: 0, pointerId: 1 });
  const key = (key: string) => send("keydown", { key });
  return { canvas, win, games, rounds, pauses, colors, advance, pointer, key, get invalidDraws() { return invalidDraws; }, get framePending() { return !!nextFrame; } };
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
