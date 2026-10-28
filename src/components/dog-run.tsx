"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A chocolate lab, a red merle Australian shepherd and a brown roan English
 * springer spaniel chase a squirrel or a duck back and forth along the bottom
 * of the page. The pack keeps overtaking itself, so the dog in front rotates.
 *
 * At the bottom of the page, Space (or a tap) starts a runner game. Whichever
 * dog is in front at that moment does the chasing, alone. Jump the bushes,
 * hydrants and fences, dive through the tire, and crawl under the fence hole.
 * When the chaser fails, it looks sad, the quarry escapes, and the other two
 * dogs run up to play with it.
 */

type Breed = "lab" | "aussie" | "springer";
type Mode = "ambient" | "playing" | "over";
type Pose = "run" | "air" | "crawl" | "sad" | "stand";
type Quarry = "squirrel" | "duck";
type ObKind = "bush" | "hydrant" | "fence" | "tire" | "hole";

const BREEDS: Breed[] = ["lab", "aussie", "springer"];
const SHORT_NAMES: Record<Breed, string> = { lab: "Lab", aussie: "Aussie", springer: "Springer" };
const QUARRY_NAMES: Record<Quarry, string> = { squirrel: "Squirrel", duck: "Duck" };

/** Deterministic 0..1 noise so scenery looks random but never flickers. */
function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Park scenery behind the game: sky, clouds, hills, a tree line and a grassy
 * field. Each layer scrolls at its own rate (parallax) as the dog runs.
 */
function drawScenery(ctx: CanvasRenderingContext2D, w: number, h: number, gy: number, scroll: number) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, gy);
  sky.addColorStop(0, "#CFE4F2");
  sky.addColorStop(1, "#EEF5E8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, gy);

  // Soft sun
  ellipse(ctx, w - 70, 34, 13, 13, "rgba(255, 236, 179, 0.9)");

  // Clouds (very slow)
  const cloudSpan = 260;
  const cOff = (scroll * 0.06) % cloudSpan;
  const cStart = Math.floor((scroll * 0.06) / cloudSpan);
  for (let i = -1; i <= Math.ceil(w / cloudSpan) + 1; i++) {
    const n = cStart + i;
    const cx = i * cloudSpan - cOff + hash(n) * 120;
    const cy = 26 + hash(n + 7) * 26;
    const s = 0.7 + hash(n + 3) * 0.6;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 16 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 10 * s, cy - 4 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 9 * s, cy - 2 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant hills
  const hillShift = scroll * 0.15;
  ctx.fillStyle = "#BCD5AE";
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= w + 8; x += 8) {
    const X = x + hillShift;
    ctx.lineTo(x, gy - 34 - 12 * Math.sin(X / 95) - 7 * Math.sin(X / 41 + 1.3));
  }
  ctx.lineTo(w, gy);
  ctx.closePath();
  ctx.fill();

  // Far meadow and tree line, set back from the trail: smaller and paler for depth
  const horizon = gy - 12;
  ctx.fillStyle = "#A9CC8E";
  ctx.fillRect(0, horizon, w, gy - horizon);
  const treeSpan = 38;
  const tShift = scroll * 0.35;
  const tOff = tShift % treeSpan;
  const tStart = Math.floor(tShift / treeSpan);
  for (let i = -1; i <= Math.ceil(w / treeSpan) + 1; i++) {
    const n = tStart + i;
    if (hash(n + 11) < 0.3) continue; // gaps between trees
    const tx = i * treeSpan - tOff + hash(n) * 18;
    const th = 8 + hash(n + 5) * 10;
    const r = 6 + hash(n + 9) * 5;
    const base = horizon + 2;
    ctx.fillStyle = "#9C8670";
    ctx.fillRect(tx - 1, base - th, 2, th);
    const shade = hash(n + 2) < 0.5 ? "#9DBF86" : "#8EB378";
    ellipse(ctx, tx, base - th - r * 0.6, r, r * 1.1, shade);
    ellipse(ctx, tx - r * 0.35, base - th - r * 0.9, r * 0.45, r * 0.4, "rgba(255,255,255,0.15)");
  }

  // Dirt trail the dogs run along, then the grass in front of it
  ctx.fillStyle = "#D2BE93";
  ctx.fillRect(0, gy - 3, w, 10);
  ctx.fillStyle = "#C4AE80";
  ctx.fillRect(0, gy + 6, w, 1);
  ctx.fillStyle = "#8DBF6A";
  ctx.fillRect(0, gy + 7, w, h - gy - 7);
  // Pebbles on the trail
  const pebSpan = 31;
  const pOff = scroll % pebSpan;
  const pStart = Math.floor(scroll / pebSpan);
  for (let i = -1; i <= Math.ceil(w / pebSpan) + 1; i++) {
    const n = pStart + i + 500;
    ellipse(ctx, i * pebSpan - pOff + hash(n) * 20, gy + 1 + hash(n + 1) * 4, 1.2, 0.8, "#B39C6E");
  }

  // Grass tufts moving at ground speed
  const tuftSpan = 23;
  const gOff = scroll % tuftSpan;
  const gStart = Math.floor(scroll / tuftSpan);
  ctx.strokeStyle = "#6FA24E";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (let i = -1; i <= Math.ceil(w / tuftSpan) + 1; i++) {
    const n = gStart + i;
    const x = i * tuftSpan - gOff + hash(n) * 12;
    const y = gy + 10 + hash(n + 4) * (h - gy - 12);
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 2);
    ctx.lineTo(x - 3, y - 1);
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x, y - 2);
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + 3, y - 1);
    ctx.stroke();
  }
}

const AMBIENT_H = 64;
const GAME_H = 172;
const GROUND_PAD = 22; // depth of the grass strip under the running line (game)
const GRAVITY = 1800; // px/s²
const JUMP_V = 560; // px/s → ~87px jump
const START_SPEED = 320; // px/s
const MAX_SPEED = 720;
const LEAD_X = 140;
const BEST_KEY = "dogrun-best";

// Tire geometry (heights above the ground)
const TIRE_STAND_H = 46;
const TIRE_CENTER = 80;
const TIRE_INNER_LO = 56;
const TIRE_INNER_HI = 104;
// Fence-hole geometry: wall from HOLE_GAP up to HOLE_TOP; crawl through the gap
const HOLE_GAP = 22;
const HOLE_TOP = 128;

interface Palette {
  body: string;
  patch: string; // merle/liver patches
  leg: string;
  legFar: string;
  white?: string;
  eye: string;
}

const PAL: Record<Breed, Palette> = {
  lab: { body: "#5C3A21", patch: "#432914", leg: "#5C3A21", legFar: "#3E2614", eye: "#F8F4EC" },
  // Red merle: light red base with liver-red patches, copper points, white trim, blue eye
  aussie: {
    body: "#D4A88C",
    patch: "#8A3B1F",
    leg: "#C77B45",
    legFar: "#9E5B2E",
    white: "#F6F1EA",
    eye: "#5B8DB8",
  },
  // Brown roan: white heavily ticked with brown, liver patches
  springer: {
    body: "#BFA898",
    patch: "#5E3220",
    leg: "#C9B4A4",
    legFar: "#A8917F",
    eye: "#F8F4EC",
  },
};

// Fixed ticking positions for the roan coat
const ROAN_TICKS: [number, number][] = [
  [-12, -15], [-8, -13], [-4, -14], [0, -12], [4, -13], [8, -15], [11, -18],
  [-13, -19], [-9, -17], [6, -19], [9, -21], [2, -16], [-5, -17], [12, -14],
];

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

/** One dog, facing right (facing = -1 mirrors it), feet on groundY. */
function drawDog(
  ctx: CanvasRenderingContext2D,
  breed: Breed,
  x: number,
  groundY: number,
  facing: 1 | -1,
  phase: number,
  lift: number,
  pose: Pose = "run"
) {
  const p = PAL[breed];
  ctx.save();
  ctx.translate(x, groundY - lift);
  ctx.scale(facing, 1);
  if (pose === "crawl") ctx.scale(1.1, 0.55);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const still = pose === "sad" || pose === "stand";
  const leg = (hipX: number, offset: number, color: string) => {
    let a: number;
    let raise: number;
    if (pose === "air") {
      a = hipX > 0 ? 0.95 : -0.95;
      raise = 3;
    } else if (still) {
      a = offset > 0.3 ? 0.2 : -0.1;
      raise = 0;
    } else {
      a = Math.sin(phase + offset);
      raise = Math.max(0, Math.cos(phase + offset)) * 4;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(hipX, -14);
    ctx.quadraticCurveTo(hipX + a * 3, -8, hipX + a * 7, -1 - raise);
    ctx.stroke();
  };

  // Far legs
  leg(-9, 0.6, p.legFar);
  leg(9, Math.PI + 0.6, p.legFar);

  // Tail
  const wag = pose === "stand" ? Math.sin(phase * 3) * 4 : Math.sin(phase * 0.8) * 2;
  const droop = pose === "sad";
  ctx.beginPath();
  if (breed === "aussie") {
    ctx.strokeStyle = p.patch;
    ctx.lineWidth = 4;
    ctx.moveTo(-14, -21);
    ctx.lineTo(-17, droop ? -18 : -23);
  } else {
    ctx.strokeStyle = breed === "springer" ? p.patch : p.body;
    ctx.lineWidth = breed === "lab" ? 4 : 3;
    ctx.moveTo(-14, -20);
    if (droop) ctx.quadraticCurveTo(-20, -16, -21, -9);
    else if (breed === "lab") ctx.quadraticCurveTo(-21, -22 + wag, -25, -17 + wag);
    else ctx.quadraticCurveTo(-20, -26 + wag, -24, -24 + wag);
  }
  ctx.stroke();

  // Body
  ellipse(ctx, 0, -18, 15, 7, p.body);

  // Body markings
  if (breed === "aussie") {
    ellipse(ctx, -6, -21, 4.5, 2.6, p.patch);
    ellipse(ctx, 3, -16, 3, 2, p.patch);
    ellipse(ctx, -11, -17, 2.6, 2, p.patch);
    ellipse(ctx, 12, -15, 4, 5, p.white!);
  } else if (breed === "springer") {
    for (const [tx, ty] of ROAN_TICKS) ellipse(ctx, tx, ty, 0.9, 0.9, "#7A4A30");
    ellipse(ctx, -3, -21, 10, 4.6, p.patch);
  }

  // Head group (neck, head, snout, ear, face) — tilts down when sad
  ctx.save();
  if (droop) {
    ctx.translate(11, -20);
    ctx.rotate(0.85); // head hangs low
    ctx.translate(-11, 20);
  }
  ctx.fillStyle = p.body;
  ctx.beginPath();
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

  if (breed === "lab") {
    ellipse(ctx, 14, -26, 2.6, 4.6, p.patch, droop ? 0 : 0.3);
  } else if (breed === "aussie") {
    ellipse(ctx, 16, -31, 3, 2.2, p.patch);
    ellipse(ctx, 23, -25, 4, 2, p.white!);
    ellipse(ctx, 19, -25, 2, 1.5, "#C77B45");
    ctx.fillStyle = p.patch;
    ctx.beginPath();
    if (droop) {
      ctx.moveTo(13, -31);
      ctx.lineTo(11, -26);
      ctx.lineTo(16, -30);
    } else {
      ctx.moveTo(13, -32);
      ctx.lineTo(16, -37);
      ctx.lineTo(18, -32);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ellipse(ctx, 16, -30, 5, 4, p.patch);
    ellipse(ctx, 13, -24, 3, 6.5, p.patch, 0.2);
  }

  // Eye: closed and teary when sad
  if (droop) {
    // Closed eye (light on dark faces so it shows) and a tear
    ctx.strokeStyle = breed === "aussie" ? "#1A1A1A" : "#F8F4EC";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(19, -29.5, 1.6, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ellipse(ctx, 20.5, -25.8, 1, 1.6, "#7FB3D5");
  } else {
    ellipse(ctx, 19, -29, 1.15, 1.15, p.eye);
  }
  ellipse(ctx, 27.5, -26.5, 1.6, 1.6, "#1A1A1A");
  ctx.restore();

  // Near legs
  leg(-9, 0, p.leg);
  leg(9, Math.PI, p.leg);

  ctx.restore();
}

/** A fleeing squirrel or duck, facing its direction of travel. */
function drawQuarry(
  ctx: CanvasRenderingContext2D,
  kind: Quarry,
  x: number,
  groundY: number,
  facing: 1 | -1,
  t: number,
  lift: number
) {
  ctx.save();
  ctx.translate(x, groundY - lift);
  ctx.scale(facing, 1);
  ctx.lineCap = "round";
  if (kind === "squirrel") {
    // Bushy tail
    ctx.strokeStyle = "#A07C5C";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-5, -7);
    ctx.quadraticCurveTo(-15, -14, -9, -22 + Math.sin(t * 12) * 1.5);
    ctx.stroke();
    ellipse(ctx, 0, -7, 7, 4.5, "#8C6A4F");
    ellipse(ctx, 7, -11, 3.6, 3.2, "#8C6A4F");
    ellipse(ctx, 6.5, -15, 1.2, 2, "#8C6A4F");
    ellipse(ctx, 2, -6, 3, 2.4, "#D8C2A8");
    ellipse(ctx, 8.2, -11.8, 0.8, 0.8, "#111");
    ctx.strokeStyle = "#6E513B";
    ctx.lineWidth = 2;
    const s = Math.sin(t * 18);
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(-5 - s * 2, -0.5);
    ctx.moveTo(4, -4);
    ctx.lineTo(5 + s * 2, -0.5);
    ctx.stroke();
  } else {
    // Mallard
    const flap = Math.sin(t * 16);
    ellipse(ctx, 0, -9, 9, 5.5, "#8B6B4A");
    ellipse(ctx, -6, -11, 4, 2.5, "#F4F1EC");
    ellipse(ctx, 8, -15, 3.8, 3.4, "#2E7D4F");
    ctx.strokeStyle = "#F4F1EC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, -15, 3.9, 1.6, 2.6);
    ctx.stroke();
    ellipse(ctx, 12.5, -14.5, 2.6, 1.3, "#E8B33A");
    ellipse(ctx, 9, -16, 0.7, 0.7, "#111");
    ellipse(ctx, -1, -11 - flap * 3, 6, 2.6, "#6E5640", flap * 0.5);
    ellipse(ctx, 1, -10.5 - flap * 3, 2, 1, "#3D5BA9", flap * 0.5);
    if (lift < 2) {
      ctx.strokeStyle = "#E8902F";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1, -4);
      ctx.lineTo(-1 + flap * 2, 0);
      ctx.moveTo(2, -4);
      ctx.lineTo(2 - flap * 2, 0);
      ctx.stroke();
    }
  }
  ctx.restore();
}

interface Obstacle {
  kind: ObKind;
  x: number; // left edge
  w: number;
  h: number; // collision height for jump-over obstacles
  passed?: boolean;
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, gy: number) {
  const x = o.x;
  switch (o.kind) {
    case "bush": {
      ellipse(ctx, x + 9, gy - 8, 9, 8, "#5E8C4A");
      ellipse(ctx, x + 21, gy - 9, 9, 9, "#5E8C4A");
      ellipse(ctx, x + 15, gy - 15, 9, 7, "#6F9E58");
      ellipse(ctx, x + 12, gy - 16, 3, 2, "#8DB873");
      break;
    }
    case "hydrant": {
      ctx.fillStyle = "#C0392B";
      ctx.fillRect(x + 2, gy - o.h + 4, 8, o.h - 4);
      ctx.fillRect(x, gy - o.h + 9, 12, 3);
      ctx.beginPath();
      ctx.arc(x + 6, gy - o.h + 4, 4, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + 1, gy - 3, 10, 3);
      break;
    }
    case "fence": {
      // White picket fence
      ctx.fillStyle = "#E9E2D3";
      ctx.fillRect(x, gy - o.h + 8, o.w, 3);
      ctx.fillRect(x, gy - 9, o.w, 3);
      ctx.strokeStyle = "#A8977A";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        const px = x + 2 + i * 10;
        ctx.beginPath();
        ctx.moveTo(px, gy);
        ctx.lineTo(px, gy - o.h + 4);
        ctx.lineTo(px + 3, gy - o.h);
        ctx.lineTo(px + 6, gy - o.h + 4);
        ctx.lineTo(px + 6, gy);
        ctx.closePath();
        ctx.fillStyle = "#FBF8F1";
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "tire": {
      const cx = x + o.w / 2;
      // Stand
      ctx.fillStyle = "#3B82C4";
      ctx.fillRect(cx - 7, gy - TIRE_STAND_H, 14, TIRE_STAND_H);
      ctx.fillStyle = "#E8EEF5";
      ctx.fillRect(cx - 7, gy - TIRE_STAND_H + 12, 14, 4);
      ctx.fillRect(cx - 7, gy - TIRE_STAND_H + 28, 14, 4);
      // Tire ring (seen edge-on as a tall ellipse with a hole)
      const cy = gy - TIRE_CENTER;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 9, (TIRE_INNER_HI - TIRE_INNER_LO) / 2 + 6, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy, 4.5, (TIRE_INNER_HI - TIRE_INNER_LO) / 2, 0, 0, Math.PI * 2, true);
      ctx.fillStyle = "#2B2B2E";
      ctx.fill("evenodd");
      break;
    }
    case "hole": {
      // Tall fence with a hole at the bottom
      ctx.fillStyle = "#B08A5E";
      ctx.fillRect(x, gy - HOLE_TOP, o.w, HOLE_TOP - HOLE_GAP);
      ctx.fillStyle = "#9A764D";
      for (let i = 1; i < 3; i++) ctx.fillRect(x + (o.w / 3) * i - 0.5, gy - HOLE_TOP, 1, HOLE_TOP - HOLE_GAP);
      // Ragged hole edge
      ctx.beginPath();
      ctx.moveTo(x, gy - HOLE_GAP);
      for (let i = 0; i <= 6; i++) ctx.lineTo(x + (o.w / 6) * i, gy - HOLE_GAP + (i % 2 ? 3 : 0));
      ctx.lineTo(x + o.w, gy - HOLE_GAP - 1);
      ctx.lineTo(x, gy - HOLE_GAP - 1);
      ctx.fill();
      // Posts at the ends
      ctx.fillStyle = "#8C6A44";
      ctx.fillRect(x - 2, gy - HOLE_TOP - 4, 4, HOLE_TOP + 4);
      ctx.fillRect(x + o.w - 2, gy - HOLE_TOP - 4, 4, HOLE_TOP + 4);
      break;
    }
  }
}

function makeObstacle(kind: ObKind, x: number): Obstacle {
  switch (kind) {
    case "bush":
      return { kind, x, w: 30, h: 20 };
    case "hydrant":
      return { kind, x, w: 12, h: 22 };
    case "fence":
      return { kind, x, w: 30, h: 26 };
    case "tire":
      return { kind, x, w: 18, h: TIRE_STAND_H };
    case "hole":
      return { kind, x, w: 30, h: HOLE_TOP };
  }
}

interface Follower {
  breed: Breed;
  x: number;
  targetX: number;
  phase: number;
}

interface Game {
  mode: Mode;
  lead: number; // index into BREEDS
  ambientFront: number;
  speed: number;
  score: number;
  best: number;
  obstacles: Obstacle[];
  lift: number;
  vy: number;
  crawlHeld: boolean;
  crawlUntil: number;
  crashed: boolean;
  followers: Follower[];
  quarry: Quarry;
  quarryX: number;
  hintUntil: number;
  scroll: number; // distance run, drives the parallax scenery
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
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
}

/** Triangle wave: position along a back-and-forth path of length `travel`, and direction. */
function bounce(u: number, travel: number): { pos: number; dir: 1 | -1 } {
  const m = ((u % (travel * 2)) + travel * 2) % (travel * 2);
  return m < travel ? { pos: m, dir: 1 } : { pos: travel * 2 - m, dir: -1 };
}

export function DogRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("ambient");
  const [isTouch, setIsTouch] = useState(false);
  const isTouchRef = useRef(false);
  const game = useRef<Game>({
    mode: "ambient",
    lead: 0,
    ambientFront: 0,
    speed: START_SPEED,
    score: 0,
    best: 0,
    obstacles: [],
    lift: 0,
    vy: 0,
    crawlHeld: false,
    crawlUntil: 0,
    crashed: false,
    followers: [],
    quarry: "squirrel",
    quarryX: 0,
    hintUntil: 0,
    scroll: 0,
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

    const setGameMode = (m: Mode) => {
      g.mode = m;
      setMode(m);
    };

    const startGame = (leadIndex: number) => {
      g.lead = leadIndex;
      g.speed = START_SPEED;
      g.score = 0;
      g.obstacles = [];
      g.lift = 0;
      g.vy = 0;
      g.crawlHeld = false;
      g.crawlUntil = 0;
      g.crashed = false;
      g.followers = [];
      g.quarry = Math.random() < 0.5 ? "squirrel" : "duck";
      g.quarryX = LEAD_X + 110;
      g.hintUntil = clock + 2.6;
      g.scroll = 0;
      setGameMode("playing");
      requestAnimationFrame(() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
      );
    };

    const jump = () => {
      if (g.mode === "playing" && !g.crashed && g.lift === 0) g.vy = JUMP_V;
    };

    const isCrawling = () => g.lift === 0 && (g.crawlHeld || clock < g.crawlUntil);

    const crash = () => {
      g.crashed = true;
      const final = Math.floor(g.score);
      if (final > g.best) {
        g.best = final;
        writeBest(final);
      }
      // The other two run up from behind to play with the sad chaser
      g.followers = [1, 2].map((i) => ({
        breed: BREEDS[(g.lead + i) % 3],
        x: -40 - i * 50,
        targetX: LEAD_X - 46 * i,
        phase: i * 1.7,
      }));
      setGameMode("over");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      if (e.code === "Escape" && g.mode !== "ambient") {
        setGameMode("ambient");
        return;
      }
      if (g.mode === "playing" && (e.code === "ArrowDown" || e.code === "KeyS")) {
        e.preventDefault();
        g.crawlHeld = true;
        if (g.lift > 0) g.vy = Math.min(g.vy, -420); // drop faster
        return;
      }
      const isJump = e.code === "Space" || (g.mode === "playing" && e.code === "ArrowUp");
      if (!isJump) return;
      if (g.mode === "ambient") {
        if (!atBottomOfPage()) return; // only from the bottom of the page
        e.preventDefault();
        startGame(g.ambientFront);
      } else if (g.mode === "playing") {
        e.preventDefault();
        jump();
      } else {
        e.preventDefault();
        startGame((g.lead + 1) % 3); // the next dog gets a turn
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") g.crawlHeld = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Touch: tap to jump, swipe down to crawl
    let downY: number | null = null;
    const onPointerDown = (e: PointerEvent) => {
      downY = e.clientY;
      if (g.mode === "ambient") startGame(g.ambientFront);
      else if (g.mode === "over") startGame((g.lead + 1) % 3);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (downY === null || g.mode !== "playing") return;
      const dy = e.clientY - downY;
      downY = null;
      if (dy > 25) {
        g.crawlUntil = clock + 0.8;
        if (g.lift > 0) g.vy = Math.min(g.vy, -420);
      } else {
        jump();
      }
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);

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

    const ground = (w: number, gy: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, gy + 0.5);
      ctx.lineTo(w, gy + 0.5);
      ctx.stroke();
    };

    const drawAmbient = (w: number, h: number) => {
      const gy = h - 8;
      ground(w, gy, "#E4E4E7");

      const t = reduceMotion ? 3 : clock;
      const margin = 60;
      const travel = Math.max(60, w - margin * 2);
      const u = t * 70;
      const pack = bounce(u, travel);

      // The quarry runs 100px ahead along the same back-and-forth path, so it
      // turns first and the pack follows it around.
      const lead = 100;
      const q = bounce(u + lead, travel);
      const quarry: Quarry = Math.floor((u + lead) / travel) % 2 === 0 ? "squirrel" : "duck";
      const qLift =
        quarry === "squirrel" ? 6 * Math.abs(Math.sin(t * 9)) : 10 + 3 * Math.sin(t * 6);
      drawQuarry(ctx, quarry, margin + q.pos, gy, q.dir, t, reduceMotion ? 0 : qLift);

      const dogs = BREEDS.map((breed, i) => ({
        i,
        breed,
        x: margin + pack.pos + 38 * Math.sin(0.55 * t + (i * Math.PI * 2) / 3),
        phase: t * 13 + i * 1.7,
      }));
      dogs.sort((a, b) => pack.dir * a.x - pack.dir * b.x); // front dog draws last
      g.ambientFront = dogs[dogs.length - 1].i;
      for (const d of dogs) {
        const lift = reduceMotion ? 0 : 2 * Math.abs(Math.sin(d.phase));
        drawDog(ctx, d.breed, d.x, gy, pack.dir, d.phase, lift, reduceMotion ? "stand" : "run");
      }
    };

    const pickKind = (): ObKind => {
      const pool: ObKind[] = ["bush", "hydrant", "fence", "bush", "hydrant", "fence"];
      if (g.score > 50) pool.push("hole", "hole");
      if (g.score > 100) pool.push("tire", "tire");
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const updateGame = (dt: number, w: number) => {
      // Physics for the chaser (also lets it fall after a mid-air crash)
      if (g.lift > 0 || g.vy > 0) {
        g.vy -= GRAVITY * dt;
        g.lift += g.vy * dt;
        if (g.lift <= 0) {
          g.lift = 0;
          g.vy = 0;
        }
      }

      if (g.crashed) {
        // Quarry escapes; friends run up
        g.quarryX += 300 * dt;
        for (const f of g.followers) {
          if (f.x < f.targetX) f.x = Math.min(f.targetX, f.x + 240 * dt);
        }
        return;
      }

      g.speed = Math.min(MAX_SPEED, g.speed + 8 * dt);
      g.score += (g.speed * dt) / 10;
      g.scroll += g.speed * dt;
      g.quarryX = LEAD_X + 110 + 8 * Math.sin(clock * 1.3);

      const dogCenter = LEAD_X + 4;
      for (const o of g.obstacles) {
        const prevCenter = o.x + o.w / 2;
        o.x -= g.speed * dt;
        const center = o.x + o.w / 2;
        if (!o.passed && prevCenter > dogCenter && center <= dogCenter) {
          o.passed = true;
          // Tire: the dog's middle has to go through the hole
          if (o.kind === "tire") {
            const mid = g.lift + 13;
            if (mid < TIRE_INNER_LO || mid > TIRE_INNER_HI) {
              crash();
              return;
            }
          }
        }
      }
      g.obstacles = g.obstacles.filter((o) => o.x + o.w > -30);

      const lastOb = g.obstacles[g.obstacles.length - 1];
      const gap = g.speed * (0.85 + Math.random() * 0.9);
      if (lastOb ? lastOb.x < w - gap : g.score > 20) {
        g.obstacles.push(makeObstacle(pickKind(), w + 10));
      }

      // Collision with the chaser
      const crawling = isCrawling();
      const height = crawling ? 20 : g.lift > 0 ? 26 : 30;
      const left = LEAD_X - 16;
      const right = LEAD_X + 24;
      const bottom = g.lift;
      const top = g.lift + height;
      for (const o of g.obstacles) {
        const ol = o.x + 3;
        const or = o.x + o.w - 3;
        if (right <= ol || left >= or) continue;
        if (o.kind === "hole") {
          // Must crawl through the gap under the fence
          if (top > HOLE_GAP + 1 && bottom < HOLE_TOP) return crash();
        } else if (o.kind === "tire") {
          // The stand blocks a dog that stays low
          const sl = o.x + o.w / 2 - 7;
          const sr = o.x + o.w / 2 + 7;
          if (right > sl && left < sr && bottom < TIRE_STAND_H - 2) return crash();
        } else if (bottom < o.h - 3) {
          return crash();
        }
      }
    };

    const drawGame = (w: number, h: number) => {
      const gy = h - GROUND_PAD;
      drawScenery(ctx, w, h, gy, g.scroll);

      for (const o of g.obstacles) drawObstacle(ctx, o, gy);

      // Quarry
      if (g.quarryX < w + 40) {
        const qLift =
          g.quarry === "squirrel"
            ? 9 * Math.abs(Math.sin(clock * 10))
            : 30 + 8 * Math.sin(clock * 5);
        drawQuarry(ctx, g.quarry, g.quarryX, gy, 1, clock, qLift);
      }

      // Friends who ran up after the miss
      for (const f of g.followers) {
        const arrived = f.x >= f.targetX;
        drawDog(ctx, f.breed, f.x, gy, 1, clock * 13 + f.phase, arrived ? 0 : 2 * Math.abs(Math.sin(clock * 13 + f.phase)), arrived ? "stand" : "run");
      }

      // The chaser
      const breed = BREEDS[g.lead];
      let pose: Pose = "run";
      if (g.crashed) pose = g.lift > 0 ? "air" : "sad";
      else if (g.lift > 0) pose = "air";
      else if (isCrawling()) pose = "crawl";
      const phase = clock * (g.speed / 26);
      drawDog(ctx, breed, LEAD_X, gy, 1, phase, g.lift, pose);

      // HUD
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#3F3F46";
      ctx.textAlign = "right";
      const pad = (n: number) => String(n).padStart(5, "0");
      ctx.fillText(`HI ${pad(g.best)}  ${pad(Math.floor(g.score))}`, w - 12, 16);
      ctx.textAlign = "left";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(`${SHORT_NAMES[breed]} & ${QUARRY_NAMES[g.quarry]}`, 12, 16);

      ctx.textAlign = "center";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      if (g.mode === "over") {
        ctx.fillStyle = "#27272A";
        ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(`The ${g.quarry} got away!`, w / 2, 40);
        ctx.fillStyle = "#52525B";
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(
          isTouchRef.current
            ? "Tap to give the next dog a turn"
            : "Space to give the next dog a turn · Esc to exit",
          w / 2,
          58
        );
      } else if (clock < g.hintUntil) {
        ctx.fillStyle = "#52525B";
        ctx.fillText(
          isTouchRef.current
            ? "Tap to jump · swipe down to crawl"
            : "Space or ↑ to jump · ↓ to crawl · Esc to exit",
          w / 2,
          40
        );
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
          updateGame(dt, w);
          drawGame(w, h);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      io.disconnect();
    };
  }, []);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className={`block w-full select-none ${mode === "ambient" ? "touch-manipulation" : "touch-none rounded-xl"}`}
        style={{ height: mode === "ambient" ? AMBIENT_H : GAME_H }}
        role="img"
        aria-label="A chocolate lab, a red merle Australian shepherd and a brown roan English springer spaniel chasing a squirrel or a duck. Press Space at the bottom of the page to play a chasing game."
      />
      {mode === "ambient" && (
        <p className="text-center text-[11px] tracking-wider uppercase text-zinc-400 mt-1">
          {isTouch ? "Tap the dogs to play" : "Press Space to play"}
        </p>
      )}
    </div>
  );
}
