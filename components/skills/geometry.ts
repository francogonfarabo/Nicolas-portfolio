import type { SkillCategory } from "@/content/types";

export type Vec = { x: number; y: number };

export type Frame = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  /** The portrait's orbit (inner guide, and the closest a dragged node can get). */
  r0: number;
  /** R_leaf: every skill sits on this circle (the outer guide). */
  r1: number;
  /** R_hub: every family hub sits on this circle. */
  rHub: number;
  /** Which way the half-disc opens: 0 = up (the fan rises from the portrait), -π/2 = sideways (opens to the right). */
  turn: number;
  compact: boolean;
  fontSize: number;
  /** Diameter of the portrait at the root. */
  root: number;
};

export type Slot = {
  id: string;
  kind: "hub" | "leaf";
  categoryId: string;
  color: string;
  label: string;
  /** Resting angle in radians: π = left horizon, π/2 = straight up, 0 = right horizon. */
  angle: number;
  /** Leaves only: the parent hub id. */
  hub?: string;
};

export const HUB_PREFIX = "hub:";
export const CHAR_W = 0.55; // average glyph width relative to font size (Geist)

/*
 * The layout is deliberately neutral: it shows which skills Nico has touched, not how much.
 * Every skill sits on one circle (R_leaf) and every family hub on another (R_hub), whatever
 * the content says. R_leaf is fitted to the box (makeFrame); everything else follows from it.
 */
/** Empty angle left at each end of the half-circle, in radians. */
export const ARC_MARGIN = 0.09;
/** Angle between two families, in leaf steps (1 would be no gap). The same between every pair. */
export const CATEGORY_GAP = 1.6;
/** R_hub as a fraction of R_leaf. */
export const HUB_RATIO = 0.7;
/** Phones: label size of the sideways chart. */
export const SIDEWAYS_FONT = 11;

/**
 * The angle between neighbouring skills: the half-circle (minus the margins and the
 * family gaps) shared out evenly, so adding or removing a skill re-spaces everything.
 */
export function leafStep(categories: SkillCategory[]): number {
  const filled = categories.filter((c) => c.skills.length);
  const leafCount = filled.reduce((n, c) => n + c.skills.length, 0);
  const units = Math.max(1, leafCount - filled.length + CATEGORY_GAP * (filled.length - 1));
  return (Math.PI - ARC_MARGIN * 2) / units;
}

/** Every node's resting angle, straight from the data: skills in content order, hubs at their skills' mean angle. */
export function slotsFor(categories: SkillCategory[]): Slot[] {
  const filled = categories.filter((c) => c.skills.length);
  const step = leafStep(categories);

  const slots: Slot[] = [];
  let a = Math.PI - ARC_MARGIN;
  filled.forEach((cat, ci) => {
    if (ci > 0) a -= step * CATEGORY_GAP;
    const leafSlots: Slot[] = cat.skills.map((s, i) => ({
      id: s.key,
      kind: "leaf",
      categoryId: cat.id,
      color: cat.color,
      label: s.label,
      angle: a - i * step,
      hub: HUB_PREFIX + cat.id,
    }));
    a -= step * (cat.skills.length - 1);
    const mid = leafSlots.reduce((n, s) => n + s.angle, 0) / leafSlots.length;
    slots.push({ id: HUB_PREFIX + cat.id, kind: "hub", categoryId: cat.id, color: cat.color, label: cat.label, angle: mid });
    slots.push(...leafSlots);
  });
  return slots;
}

const R0_RATIO = 0.2;
/** Room under the baseline for the lower half of the portrait. */
const BOTTOM = 64;

/**
 * Size the half-disc so every label fits the box: R_leaf (r1) is the largest radius at which
 * each skill's label, running outward from the outer circle, stays inside.
 * Each constraint is linear in r1, so each leaf gives a closed-form upper bound.
 */
export function makeFrame(width: number, maxHeight: number | undefined, categories: SkillCategory[]): Frame {
  const fontSize = width < 700 ? 11.5 : 12;
  const half = width / 2 - 6;
  const leaves = slotsFor(categories)
    .filter((s) => s.kind === "leaf")
    .map((s) => ({ angle: s.angle, reach: s.label.length * fontSize * CHAR_W + 10 + 24 }));

  let r1 = Math.min(440, half - 4);
  for (const l of leaves) {
    const c = Math.abs(Math.cos(l.angle));
    if (c > 0.05) r1 = Math.min(r1, (half - c * l.reach) / c);
  }
  if (maxHeight) {
    r1 = Math.min(r1, maxHeight - BOTTOM - 16);
    for (const l of leaves) {
      const s = Math.sin(l.angle);
      if (s > 0.05) r1 = Math.min(r1, (maxHeight - BOTTOM - 8 - s * l.reach) / s);
    }
  }

  const compact = r1 < 170;
  if (compact) r1 = Math.max(110, Math.min(250, half - 8, maxHeight ? maxHeight - BOTTOM - 30 : Infinity));
  const r0 = Math.max(compact ? 44 : 60, r1 * R0_RATIO);

  let top = 22;
  if (!compact) {
    for (const l of leaves) top = Math.max(top, Math.sin(l.angle) * (r1 + l.reach) - r1 + 8);
  }
  const height = top + r1 + BOTTOM;
  return {
    width,
    height,
    cx: width / 2,
    cy: top + r1,
    r0,
    r1,
    rHub: r1 * HUB_RATIO,
    turn: 0,
    compact,
    fontSize,
    root: compact ? 64 : Math.round(Math.min(104, Math.max(72, r0 * 1.35))),
  };
}

/**
 * Phones: the same tree turned a quarter, so it opens to the right of the portrait and the
 * labels run across the screen instead of up it. Sized by width alone (it isn't pinned on
 * phones), so every label shows: R_leaf is the largest radius at which each label fits.
 */
export function makeSidewaysFrame(width: number, categories: SkillCategory[]): Frame {
  const fontSize = SIDEWAYS_FONT;
  const r0 = 60;
  const root = Math.round(Math.min(104, Math.max(72, r0 * 1.35)));
  const cx = root / 2 + 6;
  const leaves = slotsFor(categories)
    .filter((s) => s.kind === "leaf")
    .map((s) => ({ t: s.angle - Math.PI / 2, reach: s.label.length * fontSize * CHAR_W + 10 + 24 }));

  let r1 = 440;
  for (const l of leaves) {
    const c = Math.cos(l.t);
    if (c > 0.05) r1 = Math.min(r1, (width - 6 - cx - c * l.reach) / c);
  }
  // Room above and below the portrait: the outer guide, or the furthest label, whichever reaches further.
  const up = Math.max(r1 + 10, ...leaves.map((l) => Math.sin(l.t) * (r1 + l.reach))) + 8;
  const down = Math.max(r1 + 10, ...leaves.map((l) => -Math.sin(l.t) * (r1 + l.reach))) + 8;
  return { width, height: up + down, cx, cy: up, r0, r1, rHub: r1 * HUB_RATIO, turn: -Math.PI / 2, compact: false, fontSize, root };
}

export const polar = (f: Frame, angle: number, radius: number): Vec => ({
  x: f.cx + Math.cos(angle + f.turn) * radius,
  y: f.cy - Math.sin(angle + f.turn) * radius,
});

/** Clamp a free pointer position into the half-disc between r0 and r1. */
export function clampToChart(f: Frame, p: Vec): { angle: number; radius: number } {
  const dx = p.x - f.cx;
  const dy = f.cy - p.y;
  let angle = Math.atan2(dy, dx) - f.turn;
  if (angle > Math.PI) angle -= 2 * Math.PI;
  if (angle < 0) angle = angle < -Math.PI / 2 ? Math.PI : 0;
  const radius = Math.max(f.r0, Math.min(f.r1, Math.hypot(dx, dy)));
  return { angle, radius };
}

/** Where a node rests: its angle from slotsFor, on the hub circle or the skill circle. */
export const restPosition = (f: Frame, s: Slot): Vec => polar(f, s.angle, s.kind === "hub" ? f.rHub : f.r1);
