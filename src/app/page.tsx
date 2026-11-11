"use client";
import { useLayoutEffect, useRef } from "react";
import { createPlayground } from "@/lib/ring-playground";

export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const instance = createPlayground(canvas.current);
    return () => instance.destroy();
  }, []);

  return (
    <main className="playground">
      <h1 className="sr-only">Lucas Miranda — quantbagel</h1>
      <p className="sr-only">Building <a href="https://abstract.inc/inference">Abstract</a> — compute and physical AI. Say hello on <a href="https://x.com/quantbagel">X</a>.</p>
      <p id="instructions" className="sr-only">Drag and throw the ring. Arrow keys move it. C changes colors, P pauses, and R resets. Push and hold against an edge to scatter the letters. In the ring, the words Abstract and X are links.</p>
      <canvas ref={canvas} className="ring-canvas" tabIndex={0} aria-label="Interactive ring: I&apos;m building Abstract — compute and physical AI" aria-describedby="instructions" />
      <p className="gesture-hint" aria-hidden="true">drag, throw</p>
    </main>
  );
}
