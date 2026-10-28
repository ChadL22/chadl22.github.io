"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A chocolate lab, an Australian shepherd and an English springer spaniel
 * chasing each other back and forth along the bottom of the page. The pack
 * keeps overtaking itself, so the dog in front rotates.
 *
 * At the bottom of the page, Space (or a tap on touch screens) starts a
 * runner game in the spirit of Chrome's T-rex game: Space jumps, Esc exits.
 * The lead dog rotates each round; the other two follow and jump on their own.
 */

type Breed = "lab" | "aussie" | "springer";
type Mode = "ambient" | "playing" | "over";

const BREEDS: Breed[] = ["lab", "aussie", "springer"];
const BREED_NAMES: Record<Breed, string> = {
  lab: "Chocolate Lab",
  aussie: "Australian Shepherd",
  springer: "English Springer Spaniel",
};

const AMBIENT_H = 64;
const GAME_H = 150;
const GRAVITY = 1800; // px/s²
const JUMP_V = 560; // px/s
const START_SPEED = 330; // px/s
const MAX_SPEED = 760;
const BEST_KEY = "dogrun-best";

interface Palette {
  body: string;
  dark: string;
  leg: string;
  legFar: string;
  outline?: string;
}

const PAL: Record<Breed, Palette> = {
  lab: { body: "#5C3A21", dark: "#432914", leg: "#5C3A21", legFar: "#3E2614" },
  aussie: { body: "#8E949C", dark: "#2B2B2E", leg: "#B4652E", legFar: "#8C4C22" },
  springer: {
    body: "#F1EBE1",
    dark: "#6B3A22",
    leg: "#E7DFD2",
    legFar: "#CFC5B6",
    outline: "#C9BBA8",
  },
};

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  rot = 0
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Draws one dog facing right (or left when facing = -1) with its feet on groundY. */
function drawDog(
  ctx: CanvasRenderingContext2D,
  breed: Breed,
  x: number,
  groundY: number,
  facing: 1 | -1,
  phase: number,
  lift: number,
  airborne: boolean
) {
  const p = PAL[breed];
  ctx.save();
  ctx.translate(x, groundY - lift);
  ctx.scale(facing, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const leg = (hipX: number, offset: number, color: string) => {
    const a = airborne ? (hipX > 0 ? 0.9 : -0.9) : Math.sin(phase + offset);
    const raise = airborne ? 3 : Math.max(0, Math.cos(phase + offset)) * 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(hipX, -14);
    ctx.quadraticCurveTo(hipX + a * 3, -8, hipX + a * 7, -1 - raise);
    ctx.stroke();
  };

  // Far legs (behind the body)
  leg(-9, 0.6, p.legFar);
  leg(9, Math.PI + 0.6, p.legFar);

  // Tail
  const wag = Math.sin(phase * 0.8) * 2;
  ctx.beginPath();
  if (breed === "lab") {
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 4;
    ctx.moveTo(-14, -20);
    ctx.quadraticCurveTo(-21, -22 + wag, -25, -17 + wag);
  } else if (breed === "springer") {
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 3;
    ctx.moveTo(-14, -21);
    ctx.quadraticCurveTo(-20, -26 + wag, -24, -24 + wag);
  } else {
    // Aussie bobtail
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 4;
    ctx.moveTo(-14, -21);
    ctx.lineTo(-17, -23);
  }
  ctx.stroke();

  // Body, neck, head, snout
  ctx.fillStyle = p.body;
  ctx.beginPath();
  ctx.ellipse(0, -18, 15, 7, 0, 0, Math.PI * 2);
  ctx.moveTo(9, -22);
  ctx.lineTo(14, -31);
  ctx.lineTo(20, -26);
  ctx.lineTo(13, -14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, -28, 6, 0, Math.PI * 2);
  ctx.fill();
  ellipse(ctx, 23, -26, 5, 3, p.body);

  if (p.outline) {
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -18, 15, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Breed markings and ears
  if (breed === "lab") {
    ellipse(ctx, 14, -26, 2.6, 4.6, p.dark, 0.3);
  } else if (breed === "aussie") {
    // Blue merle patches, white chest and blaze, copper cheek, folded ear
    ellipse(ctx, -6, -21, 4, 2.5, p.dark);
    ellipse(ctx, 3, -16, 3, 2, p.dark);
    ellipse(ctx, -11, -17, 2.5, 2, p.dark);
    ellipse(ctx, 15, -31, 2.5, 2, p.dark);
    ellipse(ctx, 12, -15, 4, 5, "#F4F1EC");
    ellipse(ctx, 23, -25, 4, 2, "#F4F1EC");
    ellipse(ctx, 19, -25, 2, 1.5, "#B4652E");
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.moveTo(13, -32);
    ctx.lineTo(16, -37);
    ctx.lineTo(18, -32);
    ctx.closePath();
    ctx.fill();
  } else {
    // Springer: liver saddle and head, long feathered ear
    ellipse(ctx, -3, -21, 10, 5, p.dark);
    ellipse(ctx, 16, -30, 5, 4, p.dark);
    ellipse(ctx, 13, -24, 3, 6.5, p.dark, 0.2);
  }

  // Near legs
  leg(-9, 0, p.leg);
  leg(9, Math.PI, p.leg);

  // Eye and nose
  ellipse(ctx, 19, -29, 1.1, 1.1, breed === "aussie" ? "#111" : "#F8F4EC");
  ellipse(ctx, 27.5, -26.5, 1.6, 1.6, "#1A1A1A");

  ctx.restore();
}

interface Obstacle {
  x: number;
  w: number;
  h: number;
  kind: "hydrant" | "log";
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, groundY: number) {
  const top = groundY - o.h;
  if (o.kind === "hydrant") {
    const count = Math.round(o.w / 12);
    for (let i = 0; i < count; i++) {
      const x = o.x + i * 14;
      ctx.fillStyle = "#C0392B";
      ctx.fillRect(x + 2, top + 4, 8, o.h - 4);
      ctx.fillRect(x, top + 9, 12, 3);
      ctx.beginPath();
      ctx.arc(x + 6, top + 4, 4, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + 1, groundY - 3, 10, 3);
    }
  } else {
    ctx.fillStyle = "#8B5A2B";
    ctx.beginPath();
    ctx.roundRect(o.x, top, o.w, o.h, 4);
    ctx.fill();
    ellipse(ctx, o.x + o.w - 3, top + o.h / 2, 3, o.h / 2 - 1, "#C49A6C");
  }
}

interface RunnerDog {
  breed: Breed;
  x: number;
  lift: number;
  vy: number;
}

interface Game {
  mode: Mode;
  lead: number;
  speed: number;
  score: number;
  best: number;
  obstacles: Obstacle[];
  dogs: RunnerDog[];
  hintUntil: number;
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(v: number) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* storage unavailable: best score just won't persist */
  }
}

function atBottomOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24
  );
}

export function DogRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("ambient");
  const [isTouch, setIsTouch] = useState(false);
  // Same flag, readable inside the animation loop
  const isTouchRef = useRef(false);
  const game = useRef<Game>({
    mode: "ambient",
    lead: 2, // first round advances to the lab
    speed: START_SPEED,
    score: 0,
    best: 0,
    obstacles: [],
    dogs: [],
    hintUntil: 0,
  });

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    isTouchRef.current = touch;
    setIsTouch(touch);
    game.current.best = readBest();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    const g = game.current;
    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const setMode2 = (m: Mode) => {
      g.mode = m;
      setMode(m);
    };

    const startGame = () => {
      g.lead = (g.lead + 1) % 3;
      g.speed = START_SPEED;
      g.score = 0;
      g.obstacles = [];
      g.dogs = [0, 1, 2].map((i) => ({
        breed: BREEDS[(g.lead + i) % 3],
        x: 130 - i * 42,
        lift: 0,
        vy: 0,
      }));
      g.hintUntil = clock + 2.2;
      setMode2("playing");
      requestAnimationFrame(() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
      );
    };

    const jump = (d: RunnerDog) => {
      if (d.lift === 0) d.vy = JUMP_V;
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      if (e.code === "Escape" && g.mode !== "ambient") {
        setMode2("ambient");
        return;
      }
      if (e.code !== "Space") return;
      if (g.mode === "ambient") {
        if (!atBottomOfPage()) return; // only from the bottom of the page
        e.preventDefault();
        startGame();
      } else if (g.mode === "playing") {
        e.preventDefault();
        jump(g.dogs[0]);
      } else {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener("keydown", onKey);

    const onPointer = (e: PointerEvent) => {
      if (g.mode === "playing") {
        e.preventDefault();
        jump(g.dogs[0]);
      } else {
        startGame();
      }
    };
    canvas.addEventListener("pointerdown", onPointer);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = g.mode === "ambient" ? AMBIENT_H : GAME_H;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    const drawAmbient = (w: number, h: number) => {
      const groundY = h - 8;
      ctx.strokeStyle = "#E4E4E7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 0.5);
      ctx.lineTo(w, groundY + 0.5);
      ctx.stroke();

      const t = reduceMotion ? 3 : clock;
      const margin = 60;
      const travel = Math.max(40, w - margin * 2);
      const u = (t * 70) % (travel * 2);
      const dir: 1 | -1 = u < travel ? 1 : -1;
      const pos = margin + (u < travel ? u : travel * 2 - u);

      // Each dog drifts ahead of / behind the pack on its own cycle, so the leader rotates.
      const dogs = BREEDS.map((breed, i) => ({
        breed,
        x: pos + 38 * Math.sin(0.55 * t + (i * Math.PI * 2) / 3),
        phase: t * 13 + i * 1.7,
      }));
      dogs.sort((a, b) => dir * a.x - dir * b.x); // dog in front draws last
      for (const d of dogs) {
        const lift = reduceMotion ? 0 : 2 * Math.abs(Math.sin(d.phase));
        drawDog(ctx, d.breed, d.x, groundY, dir, d.phase, lift, false);
      }
    };

    const updateGame = (dt: number, w: number) => {
      g.speed = Math.min(MAX_SPEED, g.speed + 9 * dt);
      g.score += (g.speed * dt) / 10;

      // Obstacles
      for (const o of g.obstacles) o.x -= g.speed * dt;
      g.obstacles = g.obstacles.filter((o) => o.x + o.w > -20);
      const lastOb = g.obstacles[g.obstacles.length - 1];
      const gap = g.speed * (0.8 + Math.random() * 0.9);
      if (!lastOb ? g.score > 25 : lastOb.x < w - gap) {
        const double = g.speed > 480 && Math.random() < 0.3;
        g.obstacles.push(
          Math.random() < 0.55
            ? { x: w + 10, w: double ? 26 : 12, h: 22, kind: "hydrant" }
            : { x: w + 10, w: 26, h: 14, kind: "log" }
        );
      }

      // Followers jump on their own
      for (let i = 1; i < g.dogs.length; i++) {
        const d = g.dogs[i];
        const ahead = g.obstacles.find((o) => o.x + o.w > d.x - 16);
        if (ahead) {
          const dist = ahead.x - (d.x + 24);
          if (dist > 0 && dist < g.speed * 0.16) jump(d);
        }
      }

      // Physics
      for (const d of g.dogs) {
        if (d.lift > 0 || d.vy > 0) {
          d.vy -= GRAVITY * dt;
          d.lift += d.vy * dt;
          if (d.lift <= 0) {
            d.lift = 0;
            d.vy = 0;
          }
        }
      }

      // Collision: lead dog only
      const lead = g.dogs[0];
      const groundY = GAME_H - 12;
      const dl = lead.x - 16;
      const dr = lead.x + 24;
      const dBottom = groundY - lead.lift;
      const dTop = dBottom - 30;
      for (const o of g.obstacles) {
        const ol = o.x + 3;
        const or = o.x + o.w - 3;
        const oTop = groundY - o.h + 3;
        if (dr > ol && dl < or && dBottom > oTop && dTop < groundY) {
          const final = Math.floor(g.score);
          if (final > g.best) {
            g.best = final;
            writeBest(final);
          }
          setMode2("over");
          break;
        }
      }
    };

    const drawGame = (w: number, h: number) => {
      const groundY = h - 12;
      ctx.strokeStyle = "#D4D4D8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 0.5);
      ctx.lineTo(w, groundY + 0.5);
      ctx.stroke();

      for (const o of g.obstacles) drawObstacle(ctx, o, groundY);

      for (let i = g.dogs.length - 1; i >= 0; i--) {
        const d = g.dogs[i];
        const phase = clock * (g.speed / 26) + i * 1.7;
        drawDog(ctx, d.breed, d.x, groundY, 1, phase, d.lift, d.lift > 0);
      }

      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#71717A";
      ctx.textAlign = "right";
      const pad = (n: number) => String(n).padStart(5, "0");
      ctx.fillText(`HI ${pad(g.best)}  ${pad(Math.floor(g.score))}`, w - 12, 18);

      ctx.textAlign = "left";
      ctx.fillText(`Lead: ${BREED_NAMES[g.dogs[0].breed]}`, 12, 18);

      ctx.textAlign = "center";
      if (g.mode === "over") {
        ctx.fillStyle = "#3F3F46";
        ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Game over", w / 2, 52);
        ctx.fillStyle = "#71717A";
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(
          isTouchRef.current ? "Tap to play again" : "Space to play again · Esc to exit",
          w / 2,
          70
        );
      } else if (clock < g.hintUntil) {
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(isTouchRef.current ? "Tap to jump" : "Space to jump · Esc to exit", w / 2, 52);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

      if (visible || g.mode !== "ambient") {
        const { w, h } = resize();
        ctx.clearRect(0, 0, w, h);
        if (g.mode === "ambient") {
          drawAmbient(w, h);
        } else {
          if (g.mode === "playing") updateGame(dt, w);
          drawGame(w, h);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
      io.disconnect();
    };
  }, []);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="block w-full touch-manipulation select-none"
        style={{ height: mode === "ambient" ? AMBIENT_H : GAME_H }}
        role="img"
        aria-label="A chocolate lab, an Australian shepherd and an English springer spaniel chasing each other. Press Space at the bottom of the page to play a jumping game."
      />
      {mode === "ambient" && (
        <p className="text-center text-[11px] tracking-wider uppercase text-zinc-400 mt-1">
          {isTouch ? "Tap the dogs to play" : "Press Space to play"}
        </p>
      )}
    </div>
  );
}
