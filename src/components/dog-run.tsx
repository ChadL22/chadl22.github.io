"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
type Mode = "ambient" | "intro" | "playing" | "over";
type Pose = "run" | "air" | "crawl" | "sad" | "stand" | "swim";
type Quarry = "squirrel" | "duck";
type ObKind = "bush" | "hydrant" | "fence" | "tire" | "hole" | "puddle";
type Level = "land" | "water";
type WaterKind = "fish" | "kelp" | "moss";

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
// On narrow screens the stage is laid out at least this wide, then scaled down to fit:
// smaller dogs and obstacles, and more room to see what's coming.
const MIN_STAGE_W = 640;
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
    } else if (pose === "swim") {
      // Doggy paddle: quick, short strokes
      a = Math.sin(phase * 1.4 + offset) * 0.9;
      raise = 2 + Math.cos(phase * 1.4 + offset) * 1.5;
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

  // Navy blue collar with a little gold tag
  ctx.strokeStyle = "#1E2A5A";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(9.4, -24.4);
  ctx.lineTo(16.8, -20.1);
  ctx.stroke();
  ctx.lineCap = "round";
  ellipse(ctx, 13.6, -19.6, 1.1, 1.3, "#E0B23A");

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

/** A bright orange fetch ball with blue seam bands; y is its bottom. */
function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const r = 5;
  ctx.save();
  ctx.translate(x, y - r);
  ellipse(ctx, 0, 0, r, r, "#F47B20");
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.rotate(t * 8);
  // Two thick blue seam bands curving across the ball
  ctx.strokeStyle = "#1F5FAD";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-r * 1.25, 0, r * 0.95, -1.0, 1.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 1.25, 0, r * 0.95, Math.PI - 1.0, Math.PI + 1.0);
  ctx.stroke();
  ctx.restore();
  // Shine
  ellipse(ctx, x - 1.6, y - r - 1.8, 1.4, 1, "rgba(255, 255, 255, 0.45)");
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
    case "puddle": {
      // A puddle in the trail: jump it, or fall in and end up underwater
      const cx = x + o.w / 2;
      ellipse(ctx, cx, gy + 2, o.w / 2, 5.5, "#4F8FC4");
      ellipse(ctx, cx - 4, gy + 1, o.w / 2 - 8, 3, "#79B1DE");
      ellipse(ctx, cx + o.w / 4, gy + 2.5, 4, 1, "rgba(255,255,255,0.7)");
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
    case "puddle":
      return { kind, x, w: 60, h: 0 };
  }
}

// ---------- Underwater level ----------

const SURFACE_Y = 30; // water surface (canvas y)
const FLOOR_PAD = 14; // sand floor height at the bottom
const WATER_STRETCH = 2600; // px swum before the sandbank appears
const STROKE_V = -150; // one paddle stroke (px/s, upward)
const SINK = 300; // px/s² drift down between strokes
const MAX_SINK = 190;

interface WaterOb {
  kind: WaterKind;
  x: number;
  y: number; // fish: center line; kelp/moss: ignored
  w: number;
  h: number;
  speed: number; // fish swim toward the dog on top of the scroll
  wiggle: number;
  color: string;
}

function makeWaterOb(kind: WaterKind, x: number, h: number): WaterOb {
  const floorY = h - FLOOR_PAD;
  if (kind === "fish") {
    const colors = ["#F28C38", "#9FB4C7", "#E8C547", "#D9644A"];
    return {
      kind,
      x,
      y: SURFACE_Y + 22 + Math.random() * (floorY - SURFACE_Y - 38),
      w: 20,
      h: 9,
      speed: 40 + Math.random() * 90,
      wiggle: Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }
  if (kind === "kelp") {
    // Seaweed growing up from the floor
    return { kind, x, y: 0, w: 12, h: 42 + Math.random() * 42, speed: 0, wiggle: Math.random() * 6, color: "#3E8E5A" };
  }
  // Moss hanging down from the surface
  return { kind, x, y: 0, w: 16, h: 30 + Math.random() * 30, speed: 0, wiggle: Math.random() * 6, color: "#5C7A3A" };
}

function drawWaterOb(ctx: CanvasRenderingContext2D, o: WaterOb, h: number, t: number) {
  const floorY = h - FLOOR_PAD;
  if (o.kind === "fish") {
    // Swims left, toward the dog
    const cx = o.x + o.w / 2;
    const tail = Math.sin(t * 14 + o.wiggle) * 2;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w - 4, o.y);
    ctx.lineTo(o.x + o.w + 5, o.y - 5 + tail);
    ctx.lineTo(o.x + o.w + 5, o.y + 5 + tail);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, cx, o.y, o.w / 2, o.h / 2, o.color);
    ellipse(ctx, cx + 1, o.y + 1.5, o.w / 2 - 3, 1.6, "rgba(255,255,255,0.35)");
    ellipse(ctx, o.x + 4, o.y - 1, 1.2, 1.2, "#1A1A1A");
  } else if (o.kind === "kelp") {
    const top = floorY - o.h;
    for (let s = 0; s < 2; s++) {
      const bx = o.x + 3 + s * 6;
      ctx.strokeStyle = s ? "#4FA06A" : o.color;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(bx, floorY);
      for (let y = floorY; y >= top + s * 8; y -= 6) {
        const sway = Math.sin(t * 2 + o.wiggle + y * 0.08 + s) * 3 * ((floorY - y) / o.h);
        ctx.lineTo(bx + sway, y);
      }
      ctx.stroke();
    }
  } else {
    // Moss clump with dangling strands
    ellipse(ctx, o.x + o.w / 2, SURFACE_Y + 3, o.w / 2 + 2, 6, o.color);
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (let s = 0; s < 4; s++) {
      const sx = o.x + 2 + s * 4;
      const len = o.h * (0.6 + 0.4 * ((s * 37) % 10) / 10);
      ctx.beginPath();
      ctx.moveTo(sx, SURFACE_Y + 4);
      ctx.quadraticCurveTo(sx + Math.sin(t * 2 + s + o.wiggle) * 3, SURFACE_Y + len / 2, sx, SURFACE_Y + len);
      ctx.stroke();
    }
  }
}

/** Collision box of a water hazard (slightly forgiving). */
function waterObBox(o: WaterOb, h: number) {
  const floorY = h - FLOOR_PAD;
  if (o.kind === "fish") return { l: o.x + 2, r: o.x + o.w + 2, t: o.y - o.h / 2 + 1, b: o.y + o.h / 2 - 1 };
  if (o.kind === "kelp") return { l: o.x + 2, r: o.x + o.w - 1, t: floorY - o.h + 4, b: floorY };
  return { l: o.x + 1, r: o.x + o.w - 1, t: SURFACE_Y, b: SURFACE_Y + o.h * 0.85 };
}

/** Underwater scenery: water, light rays, rocks, bubbles and a sandy floor. */
function drawUnderwater(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number, t: number) {
  const floorY = h - FLOOR_PAD;
  // Sky above the surface
  ctx.fillStyle = "#D6E9F5";
  ctx.fillRect(0, 0, w, SURFACE_Y);
  // Water
  const water = ctx.createLinearGradient(0, SURFACE_Y, 0, h);
  water.addColorStop(0, "#7CC0E4");
  water.addColorStop(1, "#2C6E9B");
  ctx.fillStyle = water;
  ctx.fillRect(0, SURFACE_Y, w, h - SURFACE_Y);

  // Light rays
  ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
  const raySpan = 140;
  const rOff = (scroll * 0.15) % raySpan;
  for (let i = -1; i <= Math.ceil(w / raySpan) + 1; i++) {
    const x = i * raySpan - rOff;
    ctx.beginPath();
    ctx.moveTo(x, SURFACE_Y);
    ctx.lineTo(x + 26, SURFACE_Y);
    ctx.lineTo(x + 70, floorY);
    ctx.lineTo(x + 34, floorY);
    ctx.closePath();
    ctx.fill();
  }

  // Distant rocks
  const rockShift = scroll * 0.3;
  ctx.fillStyle = "#3F7DA6";
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  for (let x = 0; x <= w + 8; x += 8) {
    const X = x + rockShift;
    ctx.lineTo(x, floorY - 10 - 8 * Math.abs(Math.sin(X / 47)) - 5 * Math.sin(X / 19));
  }
  ctx.lineTo(w, floorY);
  ctx.closePath();
  ctx.fill();

  // Sand floor with pebbles
  ctx.fillStyle = "#D9C38F";
  ctx.fillRect(0, floorY, w, h - floorY);
  const pebSpan = 27;
  const pOff = scroll % pebSpan;
  const pStart = Math.floor(scroll / pebSpan);
  for (let i = -1; i <= Math.ceil(w / pebSpan) + 1; i++) {
    const n = pStart + i + 900;
    ellipse(ctx, i * pebSpan - pOff + hash(n) * 16, floorY + 3 + hash(n + 1) * (FLOOR_PAD - 5), 1.4, 0.9, "#BFA673");
  }

  // Rising bubbles
  for (let i = 0; i < 14; i++) {
    const bx = ((hash(i + 40) * w * 1.3 - scroll * 0.4) % (w + 40) + w + 40) % (w + 40) - 20;
    const span = floorY - SURFACE_Y;
    const by = floorY - ((t * (18 + hash(i) * 22) + hash(i + 3) * span) % span);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(bx + Math.sin(t * 2 + i) * 2, by, 1.2 + hash(i + 9) * 1.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Rippling surface line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 6) {
    const y = SURFACE_Y + Math.sin((x + scroll * 0.6) / 14 + t * 2) * 1.5;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/** The sandbank the dog climbs out on: rises from the floor up past the surface. */
function drawSandbank(ctx: CanvasRenderingContext2D, x: number, w: number, h: number) {
  const floorY = h - FLOOR_PAD;
  ctx.fillStyle = "#E3CF9F";
  ctx.beginPath();
  ctx.moveTo(x, floorY);
  ctx.quadraticCurveTo(x + 70, floorY - 20, x + 120, SURFACE_Y - 8);
  ctx.lineTo(Math.max(w, x + 200), SURFACE_Y - 8);
  ctx.lineTo(Math.max(w, x + 200), h);
  ctx.lineTo(x, h);
  ctx.closePath();
  ctx.fill();
  // Grass tufts on top of the bank
  ctx.strokeStyle = "#6FA24E";
  ctx.lineWidth = 1.4;
  for (let gx = x + 128; gx < Math.max(w, x + 200); gx += 14) {
    ctx.beginPath();
    ctx.moveTo(gx, SURFACE_Y - 8);
    ctx.lineTo(gx - 2, SURFACE_Y - 13);
    ctx.moveTo(gx + 2, SURFACE_Y - 8);
    ctx.lineTo(gx + 3, SURFACE_Y - 13);
    ctx.stroke();
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
  // Where the pack is in the idle chase (used to start the intro from the right spot)
  ambientDogs: { breed: Breed; i: number; x: number }[];
  ambientDir: 1 | -1;
  ambientBallX: number;
  intro: Intro | null;
  leadX: number; // where the chaser runs during play
  // Underwater level
  level: Level;
  swimY: number; // chaser's feet line while swimming (canvas y)
  swimVy: number;
  waterObs: WaterOb[];
  waterDist: number;
  bankX: number | null; // the sandbank's left edge once it appears
  trans: { kind: "toWater" | "toLand"; start: number; switched: boolean } | null;
}

/** The partition breaks and the dogs slide down into the game. */
interface Intro {
  start: number;
  crackX: number;
  quarry: Quarry; // found in the park
  quarryX: number;
  leadX: number; // where the chaser settles (near where it lands)
  lead: number;
  dir: 1 | -1;
  dogs: { breed: Breed; x0: number }[]; // chaser first
}

const LINE_Y = AMBIENT_H - 8; // the partition line the idle dogs run on
const PARTITION_COLOR = "#E5E5E5";
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - (1 - v) * (1 - v);
const easeInOut = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

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

/** Space only starts the game when the dogs are fully on screen. */
function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.bottom <= window.innerHeight;
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
    ambientDogs: [],
    ambientDir: 1,
    ambientBallX: 0,
    intro: null,
    leadX: LEAD_X,
    level: "land",
    swimY: 0,
    swimVy: 0,
    waterObs: [],
    waterDist: 0,
    bankX: null,
    trans: null,
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
    let vs = 1; // stage scale (below 1 on narrow screens)
    let viewW = Math.max(canvas.clientWidth, MIN_STAGE_W); // stage width in game units

    const setGameMode = (m: Mode) => {
      g.mode = m;
      setMode(m);
    };

    const startGame = (leadIndex: number, quarry?: Quarry, quarryX?: number, leadX?: number) => {
      g.lead = leadIndex;
      g.leadX = leadX ?? LEAD_X;
      g.speed = START_SPEED;
      g.score = 0;
      g.obstacles = [];
      g.lift = 0;
      g.vy = 0;
      g.crawlHeld = false;
      g.crawlUntil = 0;
      g.crashed = false;
      g.followers = [];
      g.quarry = quarry ?? (Math.random() < 0.5 ? "squirrel" : "duck");
      g.quarryX = quarryX ?? viewW + 30; // otherwise runs in from the right
      g.hintUntil = clock + 2.6;
      g.scroll = 0;
      g.intro = null;
      g.level = "land";
      g.waterObs = [];
      g.waterDist = 0;
      g.bankX = null;
      g.trans = null;
      setGameMode("playing");
    };

    const scrollGameIntoView = () =>
      requestAnimationFrame(() =>
        canvas.scrollIntoView({ behavior: "smooth", block: "center" })
      );

    // From the idle chase: crack the partition, slide the dogs down, open the park
    const startIntro = () => {
      if (reduceMotion || g.ambientDogs.length === 0) {
        startGame(g.ambientFront);
        scrollGameIntoView();
        return;
      }
      const ordered = [...g.ambientDogs].reverse(); // front dog first
      g.intro = {
        start: clock,
        crackX: g.ambientBallX, // the ball's bounce cracks the line
        quarry: Math.random() < 0.5 ? "squirrel" : "duck",
        quarryX: 0,
        // Settle near the landing spot, leaving room ahead for the chase
        leadX: Math.max(100, Math.min(g.ambientBallX, viewW - 300)),
        lead: ordered[0].i,
        dir: g.ambientDir,
        dogs: ordered.map((d) => ({ breed: d.breed, x0: d.x })),
      };
      setGameMode("intro");
      scrollGameIntoView();
    };

    const jump = () => {
      if (g.mode !== "playing" || g.crashed || g.trans) return;
      if (g.level === "water") {
        g.swimVy = STROKE_V; // one paddle stroke up
        return;
      }
      if (g.lift === 0) g.vy = JUMP_V;
    };

    // Mario-style switch between levels: the view closes to a circle, then reopens
    const startTrans = (kind: "toWater" | "toLand") => {
      g.trans = { kind, start: clock, switched: false };
    };

    const updateTrans = (h: number) => {
      const tr = g.trans;
      if (!tr) return;
      const T = clock - tr.start;
      if (!tr.switched && T >= 0.45) {
        tr.switched = true;
        g.obstacles = [];
        if (tr.kind === "toWater") {
          g.level = "water";
          g.waterObs = [];
          g.waterDist = 0;
          g.bankX = null;
          g.swimY = (SURFACE_Y + (h - FLOOR_PAD)) / 2 + 10;
          g.swimVy = 0;
          g.hintUntil = clock + 2.8;
        } else {
          g.level = "land";
          g.lift = 0;
          g.vy = 0;
          g.bankX = null;
          g.waterObs = [];
        }
      }
      if (T >= 0.9) g.trans = null;
    };

    const isCrawling = () => g.lift === 0 && (g.crawlHeld || clock < g.crawlUntil);

    const crash = () => {
      g.crashed = true;
      const final = Math.floor(g.score);
      if (final > g.best) {
        g.best = final;
        writeBest(final);
      }
      // The other two run (or swim) up from behind to play with the sad chaser
      g.followers = [1, 2].map((i) => ({
        breed: BREEDS[(g.lead + i) % 3],
        // They come back from where they wandered off (behind) and stop beside their friend
        x: -40 - i * 50,
        targetX: g.leadX - 46 * i,
        phase: i * 1.7,
      }));
      setGameMode("over");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      if (e.code === "Escape" && g.mode !== "ambient") {
        g.intro = null;
        setGameMode("ambient");
        return;
      }
      if (g.mode === "intro") {
        if (e.code === "Space") e.preventDefault();
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
        if (!onScreen(canvas)) return; // only when the dogs are in view
        e.preventDefault();
        startIntro();
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

    // Touch / click: right half jumps (swims up); hold the left half to crouch (dive)
    let crouchPointer: number | null = null;
    const onPointerDown = (e: PointerEvent) => {
      if (g.mode === "ambient") return startIntro();
      if (g.mode === "over") return startGame((g.lead + 1) % 3);
      if (g.mode !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (e.clientX - rect.left < rect.width / 2) {
        crouchPointer = e.pointerId;
        g.crawlHeld = true;
        if (g.lift > 0) g.vy = Math.min(g.vy, -420); // drop faster
      } else {
        jump();
      }
    };
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId === crouchPointer) {
        crouchPointer = null;
        g.crawlHeld = false;
      }
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
    canvas.addEventListener("pointerleave", onPointerEnd);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      vs = Math.min(1, cssW / MIN_STAGE_W);
      const w = cssW / vs; // stage width in game units
      viewW = w;
      const h = g.mode === "ambient" ? AMBIENT_H : GAME_H;
      const cssH = Math.round(h * vs);
      if (canvas.style.height !== `${cssH}px`) canvas.style.height = `${cssH}px`;
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      ctx.setTransform(dpr * vs, 0, 0, dpr * vs, 0, 0);
      return { w, h };
    };

    // Text keeps a readable on-screen size even when the stage is scaled down
    const font = (px: number, family = "ui-sans-serif, system-ui, sans-serif", weight = "") =>
      `${weight ? weight + " " : ""}${px / vs}px ${family}`;

    const ground = (w: number, gy: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, gy + 0.5);
      ctx.lineTo(w, gy + 0.5);
      ctx.stroke();
    };

    const drawAmbient = (w: number, h: number) => {
      void h;
      const gy = LINE_Y;
      ground(w, gy, PARTITION_COLOR); // the page partition doubles as the dogs' ground

      const t = clock;
      const margin = 60;
      const travel = Math.max(60, w - margin * 2);
      const u = t * 70;
      const pack = bounce(u, travel);

      // The fetch ball bounces 80px ahead along the same back-and-forth path, so
      // it turns first and the pack follows it around.
      const ball = bounce(u + 80, travel);
      const ballX = margin + ball.pos;
      const ballLift = 16 * Math.abs(Math.sin(t * 7));
      drawBall(ctx, ballX, gy - ballLift, t);
      g.ambientBallX = ballX;

      const dogs = BREEDS.map((breed, i) => ({
        i,
        breed,
        x: margin + pack.pos + 38 * Math.sin(0.55 * t + (i * Math.PI * 2) / 3),
        phase: t * 13 + i * 1.7,
      }));
      dogs.sort((a, b) => pack.dir * a.x - pack.dir * b.x); // front dog draws last
      g.ambientFront = dogs[dogs.length - 1].i;
      g.ambientDogs = dogs.map((d) => ({ breed: d.breed, i: d.i, x: d.x }));
      g.ambientDir = pack.dir;
      for (const d of dogs) {
        const lift = 2 * Math.abs(Math.sin(d.phase));
        drawDog(ctx, d.breed, d.x, gy, pack.dir, d.phase, lift, "run");
      }
    };

    const pickKind = (): ObKind => {
      const pool: ObKind[] = ["bush", "hydrant", "fence", "bush", "hydrant", "fence"];
      if (g.score > 50) pool.push("hole", "hole");
      if (g.score > 100) pool.push("tire", "tire");
      if (g.score > 40) pool.push("puddle");
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const updateWater = (dt: number, w: number, h: number) => {
      const floorY = h - FLOOR_PAD;

      if (g.crashed) {
        // The sad chaser drifts down; the others swim in
        g.swimY = Math.min(floorY - 2, g.swimY + 25 * dt);
        g.quarryX += 200 * dt;
        for (const f of g.followers) {
          if (f.x < f.targetX) f.x = Math.min(f.targetX, f.x + 200 * dt);
        }
        return;
      }

      // Swim physics: sink slowly between strokes; ↓ dives faster
      const diving = g.crawlHeld || clock < g.crawlUntil;
      g.swimVy = Math.min(diving ? MAX_SINK * 1.8 : MAX_SINK, g.swimVy + SINK * (diving ? 2.6 : 1) * dt);
      g.swimY += g.swimVy * dt;
      if (g.swimY < SURFACE_Y + 30) {
        g.swimY = SURFACE_Y + 30;
        g.swimVy = Math.max(0, g.swimVy);
      }
      if (g.swimY > floorY - 2) {
        g.swimY = floorY - 2;
        g.swimVy = Math.min(0, g.swimVy);
      }

      const ws = g.speed * 0.7; // slower underwater
      g.speed = Math.min(MAX_SPEED, g.speed + 4 * dt);
      g.score += (ws * dt) / 10;
      g.scroll += ws * dt;
      g.waterDist += ws * dt;
      const qTarget = g.leadX + 130 + 8 * Math.sin(clock * 1.3);
      g.quarryX += (qTarget - g.quarryX) * Math.min(1, dt * 2.5);

      for (const o of g.waterObs) {
        o.x -= (ws + o.speed) * dt;
      }
      g.waterObs = g.waterObs.filter((o) => o.x + o.w > -30);

      if (g.waterDist < WATER_STRETCH) {
        const lastOb = g.waterObs[g.waterObs.length - 1];
        const gap = ws * (0.55 + Math.random() * 0.6);
        if (!lastOb || lastOb.x < w - gap) {
          const r = Math.random();
          const kind: WaterKind = r < 0.5 ? "fish" : r < 0.75 ? "kelp" : "moss";
          g.waterObs.push(makeWaterOb(kind, w + 10, h));
        }
      } else if (g.bankX === null) {
        g.bankX = w + 20; // land ahead!
      }

      if (g.bankX !== null) {
        g.bankX -= ws * dt;
        if (g.bankX <= g.leadX - 30 && !g.trans) {
          startTrans("toLand");
          return;
        }
      }

      // Collision: the swimming dog against fish, kelp and moss
      const l = g.leadX - 14;
      const r = g.leadX + 22;
      const t = g.swimY - 24;
      const b = g.swimY - 4;
      for (const o of g.waterObs) {
        const box = waterObBox(o, h);
        if (r > box.l && l < box.r && b > box.t && t < box.b) return crash();
      }
    };

    const updateGame = (dt: number, w: number, h: number) => {
      if (g.trans) {
        updateTrans(h);
        return;
      }
      if (g.level === "water") {
        updateWater(dt, w, h);
        return;
      }
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
          if (f.x < f.targetX) f.x = Math.min(f.targetX, f.x + 320 * dt);
        }
        return;
      }

      g.speed = Math.min(MAX_SPEED, g.speed + 8 * dt);
      g.score += (g.speed * dt) / 10;
      g.scroll += g.speed * dt;
      // Quarry runs in from the right, then keeps just ahead of the chaser
      const qTarget = g.leadX + 110 + 8 * Math.sin(clock * 1.3);
      g.quarryX += (qTarget - g.quarryX) * Math.min(1, dt * 2.5);

      const dogCenter = g.leadX + 4;
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
      const left = g.leadX - 16;
      const right = g.leadX + 24;
      const bottom = g.lift;
      const top = g.lift + height;
      for (const o of g.obstacles) {
        const ol = o.x + 3;
        const or = o.x + o.w - 3;
        if (right <= ol || left >= or) continue;
        if (o.kind === "puddle") {
          // Running (not jumping) through the middle of a puddle: splash, down we go
          if (g.lift === 0 && dogCenter > o.x + 12 && dogCenter < o.x + o.w - 12) {
            startTrans("toWater");
            return;
          }
          continue;
        }
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

    const drawWater = (w: number, h: number) => {
      const breed = BREEDS[g.lead];
      drawUnderwater(ctx, w, h, g.scroll, clock);
      for (const o of g.waterObs) drawWaterOb(ctx, o, h, clock);
      if (g.bankX !== null) drawSandbank(ctx, g.bankX, w, h);

      // The quarry stays up top: the duck paddles along the surface,
      // the squirrel rides a floating log
      if (g.quarryX < w + 40) {
        if (g.quarry === "duck") {
          drawQuarry(ctx, "duck", g.quarryX, SURFACE_Y + 5, 1, clock, 0);
        } else {
          ellipse(ctx, g.quarryX, SURFACE_Y + 1, 14, 3.5, "#8B5A2B");
          ellipse(ctx, g.quarryX + 12, SURFACE_Y + 1, 2.5, 3, "#C49A6C");
          drawQuarry(ctx, "squirrel", g.quarryX, SURFACE_Y - 2, 1, clock, 0);
        }
      }

      // Friends swim up after a miss
      g.followers.forEach((f, i) => {
        const arrived = f.x >= f.targetX;
        drawDog(ctx, f.breed, f.x, g.swimY + (i % 2 ? -6 : 6), 1, clock * (arrived ? 5 : 10) + f.phase, 0, "swim");
      });

      // The chaser, tilting with its stroke
      ctx.save();
      ctx.translate(g.leadX, g.swimY);
      ctx.rotate(g.crashed ? 0 : Math.max(-0.35, Math.min(0.35, g.swimVy * 0.0018)));
      drawDog(ctx, breed, 0, 0, 1, clock * 10, 0, g.crashed ? "sad" : "swim");
      ctx.restore();
    };

    /** Iris close/open over the scene while switching levels, plus a splash. */
    const drawTransOverlay = (w: number, h: number) => {
      const tr = g.trans;
      if (!tr) return;
      const T = clock - tr.start;
      const gy = h - GROUND_PAD;
      const maxR = Math.hypot(w, h);
      const cx = g.leadX + 4;
      const onLand = g.level === "land";
      const cy = onLand ? gy - 15 : g.swimY - 12;
      const r =
        T < 0.45
          ? lerp(maxR, 0, easeInOut(clamp01(T / 0.45)))
          : lerp(0, maxR, easeInOut(clamp01((T - 0.45) / 0.45)));

      if (tr.kind === "toWater" && T < 0.45) {
        // Splash
        for (let i = 0; i < 7; i++) {
          const a = Math.PI + (i / 6) * Math.PI;
          const d = 6 + T * 90;
          ellipse(ctx, cx + Math.cos(a) * d, gy - 2 + Math.sin(a) * d * 0.8 + T * T * 120, 2, 2.6, "#79B1DE");
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.fillStyle = "#0E1B2B";
      ctx.fill("evenodd");
      ctx.restore();
    };

    const drawGame = (w: number, h: number) => {
      const gy = h - GROUND_PAD;
      const breed = BREEDS[g.lead];
      if (g.level === "water") {
        drawWater(w, h);
      } else {
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
      let pose: Pose = "run";
      if (g.crashed) pose = g.lift > 0 ? "air" : "sad";
      else if (g.lift > 0) pose = "air";
      else if (isCrawling()) pose = "crawl";
      const phase = clock * (g.speed / 26);
      drawDog(ctx, breed, g.leadX, gy, 1, phase, g.lift, pose);
      }
      if (g.trans) drawTransOverlay(w, h);

      // HUD
      ctx.font = font(12, "ui-monospace, SFMono-Regular, Menlo, monospace");
      ctx.fillStyle = "#3F3F46";
      ctx.textAlign = "right";
      const pad = (n: number) => String(n).padStart(5, "0");
      ctx.fillText(`HI ${pad(g.best)}  ${pad(Math.floor(g.score))}`, w - 12 / vs, 16 / vs);
      ctx.textAlign = "left";
      ctx.font = font(12);
      ctx.fillText(`${SHORT_NAMES[breed]} & ${QUARRY_NAMES[g.quarry]}`, 12 / vs, 16 / vs);

      ctx.textAlign = "center";
      ctx.font = font(12);
      if (g.mode === "over") {
        ctx.fillStyle = "#27272A";
        ctx.font = font(13);
        ctx.fillText(`The ${g.quarry} got away!`, w / 2, 40 / vs);
        ctx.fillStyle = "#52525B";
        ctx.font = font(12);
        ctx.fillText(
          isTouchRef.current
            ? "Tap to give the next dog a turn"
            : "Space to give the next dog a turn · Esc to exit",
          w / 2,
          58 / vs
        );
      } else if (clock < g.hintUntil) {
        ctx.fillStyle = "#52525B";
        const water = g.level === "water";
        ctx.fillStyle = water ? "#1E3A52" : "#52525B";
        ctx.fillText(
          water
            ? isTouchRef.current
              ? "Underwater! Tap right to swim up · hold left to dive"
              : "Underwater! Space or ↑ to swim up · ↓ to dive"
            : isTouchRef.current
              ? "Tap right to jump · hold left to crouch"
              : "Space or ↑ to jump · ↓ to crawl · Esc to exit",
          w / 2,
          (water ? 48 : 40) / vs
        );
      }
    };

    /**
     * Intro, about 2.3 seconds:
     *   the ball's last bounce cracks the partition; it breaks open; the ball
     *   drops down the hole; the dogs dive after it; the park opens out from
     *   the hole; the ball rolls off and a squirrel or duck pops up and bolts.
     *
     *   0.00–0.45  the partition cracks under the ball and shakes
     *   0.45–0.75  it breaks open into two trapdoor flaps
     *   0.55–1.40  the dogs slide down through the gap, chaser first
     *   0.75–1.50  the park opens out from the hole (iris wipe)
     *   1.30–2.30  the quarry pops up and bolts; the chaser trots to its spot,
     *              the others dash off, and play begins
     */
    const drawIntro = (w: number, h: number) => {
      const it = g.intro;
      if (!it) return;
      const T = clock - it.start;
      const gy = h - GROUND_PAD;
      const half = 70;
      const hingeL = it.crackX - half;
      const hingeR = it.crackX + half;

      // Partition: intact edges, plus a cracked middle that opens like trapdoors
      const shake = T < 0.45 ? Math.sin(T * 90) * 0.8 : 0;
      const ly = LINE_Y + 0.5 + shake;
      ctx.strokeStyle = PARTITION_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(hingeL, ly);
      ctx.moveTo(hingeR, ly);
      ctx.lineTo(w, ly);
      ctx.stroke();

      const open = easeOut(clamp01((T - 0.45) / 0.3));
      if (open === 0) {
        ctx.beginPath();
        ctx.moveTo(hingeL, ly);
        ctx.lineTo(hingeR, ly);
        ctx.stroke();
        // The crack spreads out from under the dog
        const spread = 6 + clamp01(T / 0.4) * 22;
        const steps = Math.max(2, Math.round((spread * 2) / 4));
        ctx.strokeStyle = "#71717A";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let j = 0; j <= steps; j++) {
          const cx = it.crackX - spread + (j * spread * 2) / steps;
          const cy = ly + (j % 2 === 0 ? -2.5 : 2.5);
          if (j === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      } else {
        const a = open * 1.05;
        ctx.strokeStyle = "#D4D4D8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hingeL, ly);
        ctx.lineTo(hingeL + half * Math.cos(a), ly + half * Math.sin(a));
        ctx.moveTo(hingeR, ly);
        ctx.lineTo(hingeR - half * Math.cos(a), ly + half * Math.sin(a));
        ctx.stroke();
      }

      // The park opens out from the hole
      const iris = easeInOut(clamp01((T - 0.75) / 0.75)) * Math.hypot(w, h);
      if (iris > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(it.crackX, LINE_Y, iris, 0, Math.PI * 2);
        ctx.clip();
        drawScenery(ctx, w, h, gy, 0);
        ctx.restore();
      }

      // The ball: a last few bounces, then down the hole, then it rolls away
      const fallStart = 0.45;
      const fallDrop = gy - 4 - (LINE_Y - 4);
      const fallTime = Math.sqrt((2 * fallDrop) / 1400);
      let bx = it.crackX;
      let by: number;
      if (T < fallStart) {
        by = LINE_Y - 4 - 12 * Math.abs(Math.sin(T * 9)) * (1 - T / fallStart);
      } else if (T < fallStart + fallTime) {
        const tf = T - fallStart;
        by = LINE_Y - 4 + 0.5 * 1400 * tf * tf;
      } else {
        // Bounces and rolls ahead to where the quarry is hiding
        const tr = T - fallStart - fallTime;
        bx = lerp(it.crackX, it.leadX + 100, easeOut(clamp01(tr / 0.5)));
        by = gy - 4 - 22 * Math.abs(Math.sin(tr * 8)) * Math.exp(-tr * 3);
      }
      // Forgotten once the quarry shows up: fade it out before play starts
      ctx.save();
      ctx.globalAlpha = 1 - clamp01((T - 1.8) / 0.4);
      drawBall(ctx, bx, by + 4, clock);
      ctx.restore();

      // The squirrel or duck pops up where the ball rolled, then bolts
      const revealAt = 1.3;
      const qx0 = it.leadX + 100;
      let qx = qx0;
      if (T > revealAt) {
        const k = clamp01((T - revealAt) / 0.3);
        const pop = Math.sin(Math.PI * k) * 18;
        qx = qx0 + Math.max(0, T - revealAt - 0.3) * 160;
        const air = it.quarry === "duck" ? 26 * clamp01((T - revealAt - 0.2) / 0.4) : 0;
        drawQuarry(ctx, it.quarry, qx, gy, 1, clock, pop + air);
      }
      it.quarryX = qx;

      // Dogs slide down the flap into the hole, one after another
      it.dogs.forEach((d, i) => {
        const t0 = 0.55 + i * 0.14;
        const s = clamp01((T - t0) / 0.55);
        const phase = clock * 13 + i * 1.7;
        let x = d.x0;
        let y = LINE_Y;
        let pose: Pose = "stand";
        let facing: 1 | -1 = it.dir;
        if (s > 0 && s < 0.45) {
          const k = s / 0.45;
          x = lerp(d.x0, it.crackX, k);
          y = LINE_Y + k * k * 22;
          pose = "run";
          facing = it.crackX >= d.x0 ? 1 : -1;
        } else if (s >= 0.45 && s < 1) {
          const k = (s - 0.45) / 0.55;
          x = it.crackX + (i - 1) * 8;
          y = lerp(LINE_Y + 22, gy, k * k);
          pose = "air";
        } else if (s >= 1) {
          // Landed: the chaser trots to its spot; the others run off for now
          const k = clamp01((T - t0 - 0.55) / 0.4);
          y = gy;
          pose = "run";
          if (i === 0) {
            // The chaser settles facing the quarry
            x = lerp(it.crackX - 8, it.leadX, easeInOut(k));
            facing = 1;
            if (k >= 1) pose = "stand";
          } else {
            // The other two wander off behind (they'll be back if the chaser misses)
            x = lerp(it.crackX + (i - 1) * 8, -80, k);
            facing = -1;
          }
        }
        drawDog(ctx, d.breed, x, y, facing, phase, 0, pose);

        // The chaser spots the quarry
        if (i === 0 && T > revealAt && T < revealAt + 0.6) {
          ctx.fillStyle = "#B45309";
          ctx.font = font(14, undefined, "bold");
          ctx.textAlign = "center";
          ctx.fillText("!", x + facing * 16, y - 42);
        }
      });

      if (T > 2.3) startGame(it.lead, it.quarry, it.quarryX, it.leadX);
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
        } else if (g.mode === "intro") {
          drawIntro(w, h);
        } else {
          updateGame(dt, w, h);
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
      canvas.removeEventListener("pointerup", onPointerEnd);
      canvas.removeEventListener("pointercancel", onPointerEnd);
      canvas.removeEventListener("pointerleave", onPointerEnd);
      io.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className={`block w-full select-none ${mode === "ambient" ? "touch-manipulation" : "touch-none"}`}
        // Initial height only; the animation loop sizes it (scaled down on narrow screens)
        style={{ height: AMBIENT_H }}
        role="img"
        aria-label="A chocolate lab, a red merle Australian shepherd and a brown roan English springer spaniel chasing a squirrel or a duck. Press Space at the bottom of the page to play a chasing game."
      />
      {isTouch && mode === "playing" && (
        // Visual cues only: the whole left/right half of the game responds to touch
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-zinc-700 shadow-sm ring-1 ring-black/5">
            <ChevronDown size={22} aria-hidden="true" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-zinc-700 shadow-sm ring-1 ring-black/5">
            <ChevronUp size={22} aria-hidden="true" />
          </span>
        </div>
      )}
      {mode === "ambient" && (
        <p className="text-center text-[11px] tracking-wider uppercase text-zinc-400 pt-2">
          {isTouch ? "Tap the dogs to play" : "Press Space to play"}
        </p>
      )}
    </div>
  );
}
