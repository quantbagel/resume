"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { createPlayground, type Playground } from "@/lib/ring-playground";

export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const playground = useRef<Playground | null>(null);
  const about = useRef<HTMLDialogElement>(null);
  const result = useRef<HTMLDialogElement>(null);
  const [game, setGame] = useState<{ score: number; seconds: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [sound, setSound] = useState(true);
  const [paused, setPaused] = useState(false);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const instance = createPlayground(canvas.current, {
      onGameChange: setGame,
      onRoundEnd: (points) => {
        setScore(points);
        let record = points;
        try {
          record = Math.max(points, Number(localStorage.getItem("quantbagel-best")) || 0);
          localStorage.setItem("quantbagel-best", String(record));
        } catch { /* Storage is optional. */ }
        setBest(record);
        result.current?.showModal();
      },
      onPauseChange: setPaused,
    });
    playground.current = instance;
    return () => { instance.destroy(); playground.current = null; };
  }, []);

  const closeAbout = () => {
    about.current?.close(); playground.current?.setObscured(false);
    canvas.current?.focus({ preventScroll: true });
  };
  const play = () => {
    about.current?.close(); result.current?.close();
    playground.current?.setObscured(false); playground.current?.startGame();
    canvas.current?.focus({ preventScroll: true });
  };
  const reset = () => {
    result.current?.close(); playground.current?.reset();
    canvas.current?.focus({ preventScroll: true });
  };

  return (
    <main className="playground" data-mode={game ? "game" : "ring"}>
      <h1 className="sr-only">Lucas Miranda — quantbagel</h1>
      <p className="sr-only">Building Abstract — AI and robotics.</p>
      <p id="instructions" className="sr-only">Drag and throw the ring. Arrow keys move it. C changes colors, P pauses, R resets, and Enter starts air hockey. Double tap to play. Push and hold against an edge to scatter the letters. In the ring, the words Abstract and X are links.</p>
      <canvas ref={canvas} className="ring-canvas" tabIndex={0} aria-label="Interactive ring: Lucas Miranda is building Abstract — AI and robotics" aria-describedby="instructions" />
      <p className="gesture-hint" aria-hidden="true">drag, throw, double tap</p>
      {game && <div className="game-hud" aria-label="Air hockey score">
        <span aria-label={`${game.seconds} seconds remaining`}>:{String(game.seconds).padStart(2, "0")}</span>
        <span aria-live="polite" aria-label={`${game.score} goals`}>{game.score}</span>
      </div>}
      <nav className="quiet-controls" aria-label="Site controls">
        {game && <button onClick={reset}>exit game</button>}
        <button onClick={() => { setSound(!sound); playground.current?.setSound(!sound); }} aria-pressed={sound}>sound {sound ? "on" : "off"}</button>
        <button onClick={() => { playground.current?.setObscured(true); about.current?.showModal(); }}>info</button>
      </nav>
      <dialog ref={about} onCancel={(e) => { e.preventDefault(); closeAbout(); }} onClick={(e) => { if (e.target === about.current) closeAbout(); }}>
        <div className="dialog-content">
          <p className="eyebrow">@quantbagel</p>
          <h2>Lucas Miranda</h2>
          <p className="bio">Building Abstract —<br />AI and robotics.</p>
          <nav className="profile-links" aria-label="Find Lucas">
            <a href="https://abstract.inc" target="_blank" rel="noreferrer">Abstract ↗</a>
            <a href="https://x.com/quantbagel" target="_blank" rel="noreferrer">X ↗</a>
            <a href="https://github.com/quantbagel" target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
          <div className="play-instructions">
            <p>Drag it. Throw it. Squeeze it against an edge.</p>
            <p>Double tap for a little air hockey.</p>
            <p>Tap abstract or x in the ring to visit.</p>
            <p className="keyboard-hint">Arrows to move · C for color · P to pause · R to reset</p>
          </div>
          <div className="dialog-actions">
            <button className="pill" onClick={play}>play a round</button>
            <button className="text-button" onClick={() => playground.current?.setPaused(!paused)}>{paused ? "resume motion" : "pause motion"}</button>
          </div>
          <button className="text-button close-dialog" onClick={closeAbout}>back</button>
        </div>
      </dialog>
      <dialog ref={result} onCancel={(e) => { e.preventDefault(); reset(); }}>
        <div className="dialog-content result-content">
          <h2><span className="final-score">{score}</span><span className="score-label">{score === 1 ? "goal" : "goals"}</span></h2>
          <p className="result-subtitle">in 15 seconds</p>
          <p className="personal-best">your best on this device <span>{best}</span></p>
          <button className="pill" onClick={play}>play again</button>
          <button className="text-button close-dialog" onClick={reset}>done</button>
        </div>
      </dialog>
    </main>
  );
}
