import type { SkillCategory } from "@/content/types";

export type Vec = { x: number; y: number };

export type Frame = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  /** Radius for value 0 and value 100. */
  r0: number;
  r1: number;
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

export function slotsFor(categories: SkillCategory[]): Slot[] {
  const margin = 0.09;
  const gap = 1.1;
  const filled = categories.filter((c) => c.skills.length);
  const leafCount = filled.reduce((n, c) => n + c.skills.length, 0);
  // Steps inside each family, plus one wider gap between families: spans the full half-circle.
  const units = Math.max(1, leafCount - filled.length + gap * (filled.length - 1));
  const step = (Math.PI - margin * 2) / units;

  const slots: Slot[] = [];
  let a = Math.PI - margin;
  filled.forEach((cat, ci) => {
    if (ci > 0) a -= step * gap;
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
 * Size the half-disc so every label (at its ORIGINAL value) fits the box.
 * Layout never depends on live values, so the chart doesn't rescale mid-drag.
 * Each constraint is linear in r1, so each leaf gives a closed-form upper bound.
 */
export function makeFrame(width: number, maxHeight: number | undefined, categories: SkillCategory[]): Frame {
  const fontSize = width < 700 ? 11.5 : 12;
  const half = width / 2 - 6;
  const byKey = new Map(categories.flatMap((c) => c.skills.map((s) => [s.key, s] as const)));
  const leaves = slotsFor(categories)
    .filter((s) => s.kind === "leaf")
    .map((s) => {
      const k = byKey.get(s.id)!;
      return { angle: s.angle, v: k.value / 100, reach: k.label.length * fontSize * CHAR_W + 10 + 24 };
    });
  const k = (v: number) => R0_RATIO + (1 - R0_RATIO) * v; // radius(v) / r1

  let r1 = Math.min(440, half - 4);
  for (const l of leaves) {
    const c = Math.abs(Math.cos(l.angle));
    if (c > 0.05) r1 = Math.min(r1, (half - c * l.reach) / (c * k(l.v)));
  }
  if (maxHeight) {
    r1 = Math.min(r1, maxHeight - BOTTOM - 16);
    for (const l of leaves) {
      const s = Math.sin(l.angle);
      if (s > 0.05) r1 = Math.min(r1, (maxHeight - BOTTOM - 8 - s * l.reach) / (s * k(l.v)));
    }
  }

  const compact = r1 < 170;
  if (compact) r1 = Math.max(110, Math.min(250, half - 8, maxHeight ? maxHeight - BOTTOM - 30 : Infinity));
  const r0 = Math.max(compact ? 44 : 60, r1 * R0_RATIO);

  let top = 22;
  if (!compact) {
    for (const l of leaves) {
      const r = r0 + l.v * (r1 - r0);
      top = Math.max(top, Math.sin(l.angle) * (r + l.reach) - r1 + 8);
    }
  }
  const height = top + r1 + BOTTOM;
  return {
    width,
    height,
    cx: width / 2,
    cy: top + r1,
    r0,
    r1,
    compact,
    fontSize,
    root: compact ? 64 : Math.round(Math.min(104, Math.max(72, r0 * 1.35))),
  };
}

export const radiusFor = (f: Frame, value: number) => f.r0 + (Math.max(0, Math.min(100, value)) / 100) * (f.r1 - f.r0);

export const polar = (f: Frame, angle: number, radius: number): Vec => ({
  x: f.cx + Math.cos(angle) * radius,
  y: f.cy - Math.sin(angle) * radius,
});

/** Clamp a free pointer position into the half-disc between r0 and r1. */
export function clampToChart(f: Frame, p: Vec): { angle: number; radius: number } {
  const dx = p.x - f.cx;
  const dy = f.cy - p.y;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle = angle < -Math.PI / 2 ? Math.PI : 0;
  const radius = Math.max(f.r0, Math.min(f.r1, Math.hypot(dx, dy)));
  return { angle, radius };
}

/** Hubs sit halfway between the centre and the average of their skills. */
export const hubValue = (childValues: number[]) => childValues.reduce((a, b) => a + b, 0) / Math.max(1, childValues.length) / 2;
