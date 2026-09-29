"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { SkillCategory, Skills } from "@/content/types";
import {
  CHAR_W,
  type Frame,
  type Slot,
  type Vec,
  clampToChart,
  hubValue,
  levelName,
  makeFrame,
  polar,
  radiusFor,
  slotsFor,
} from "./geometry";
import { useI18n } from "../I18n";

type Props = {
  categories: SkillCategory[];
  rings: Skills["rings"];
  /** First time someone grabs a node. */
  onFirstTouch: () => void;
  /** Skill keys to emphasise (e.g. the project under the pointer). */
  highlight: Set<string> | null;
  /** Reports the leaf under the pointer / being dragged / focused. */
  onActive?: (key: string | null) => void;
  pulse: { id: string; key: number } | null;
  /** Fit inside the parent's height. */
  fitHeight: boolean;
  /** Fade the chart (the portrait easter egg is showing). */
  dimmed: boolean;
  renderRoot: (f: Frame) => ReactNode;
  renderOverlay?: (f: Frame) => ReactNode;
  labelledBy: string;
  describedBy: string;
};

type Body = { p: Vec; v: Vec; k: number; c: number };
type Drag = { id: string; kind: "hub" | "leaf"; pointerId: number; pos: Vec };

const INK = "#0a0a0a";
const INK_2 = "#525252";
const INK_3 = "#737373";
const LINE = "#e5e5e5";
const LINE_2 = "#d4d4d4";

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Nico's skills as a radial tree. The values are fixed: distance from the centre is
 * the skill level. Nodes can be grabbed and pulled around for fun, and always spring
 * back to their place on release.
 */
export default function RadialChart({
  categories,
  rings,
  onFirstTouch,
  highlight,
  onActive,
  pulse,
  fitHeight,
  dimmed,
  renderRoot,
  renderOverlay,
  labelledBy,
  describedBy,
}: Props) {
  const reduce = !!useReducedMotion();
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [bloomed, setBloomed] = useState(false);
  const [, setTick] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [rovingId, setRovingId] = useState<string>("");
  const [dragId, setDragId] = useState<string | null>(null);

  const frame = useMemo<Frame | null>(
    () => (box.w ? makeFrame(box.w, fitHeight && box.h ? box.h : undefined, categories) : null),
    [box.w, box.h, fitHeight, categories],
  );
  const slots = useMemo(() => slotsFor(categories), [categories]);
  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const children = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) if (s.hub) m.set(s.hub, [...(m.get(s.hub) ?? []), s]);
    return m;
  }, [slots]);

  /** The fixed values, straight from the content. */
  const values = useMemo(
    () => Object.fromEntries(categories.flatMap((c) => c.skills.map((s) => [s.key, s.value]))) as Record<string, number>,
    [categories],
  );
  const meanOf = useCallback(
    (hubId: string) => {
      const v = (children.get(hubId) ?? []).map((c) => values[c.id] ?? 0);
      return Math.round(v.reduce((a, b) => a + b, 0) / Math.max(1, v.length));
    },
    [children, values],
  );

  const drag = useRef<Drag | null>(null);
  const bodies = useRef(new Map<string, Body>());
  const raf = useRef<number | null>(null);

  // --- measure ---------------------------------------------------------
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- bloom when scrolled into view ------------------------------------
  useEffect(() => {
    if (reduce) {
      setBloomed(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setBloomed(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // --- where everything belongs -------------------------------------------
  const restPos = useCallback(
    (f: Frame, s: Slot): Vec =>
      s.kind === "hub"
        ? polar(f, s.angle, radiusFor(f, hubValue((children.get(s.id) ?? []).map((c) => values[c.id] ?? 0))))
        : polar(f, s.angle, radiusFor(f, values[s.id] ?? 0)),
    [children, values],
  );

  const targetFor = useCallback(
    (f: Frame, s: Slot): Vec => {
      const d = drag.current;
      if (!bloomed) return { x: f.cx, y: f.cy };
      if (d && d.id === s.id) return d.pos;
      const rest = restPos(f, s);
      if (d && d.kind === "hub" && s.hub === d.id) {
        // A pulled hub drags its family along, elastically.
        const hubRest = restPos(f, slotById.get(d.id)!);
        return { x: rest.x + (d.pos.x - hubRest.x) * 0.85, y: rest.y + (d.pos.y - hubRest.y) * 0.85 };
      }
      if (d && d.kind === "leaf" && s.kind === "hub" && slotById.get(d.id)?.hub === s.id) {
        // …and a pulled skill tugs its hub a little.
        const leafRest = restPos(f, slotById.get(d.id)!);
        return { x: rest.x + (d.pos.x - leafRest.x) * 0.15, y: rest.y + (d.pos.y - leafRest.y) * 0.15 };
      }
      return rest;
    },
    [bloomed, restPos, slotById],
  );

  // --- physics loop -----------------------------------------------------
  const last = useRef(0);
  const step = useCallback(
    (now: number) => {
      raf.current = null;
      const f = frame;
      if (!f) return;
      const dt = Math.min(1 / 30, last.current ? (now - last.current) / 1000 : 1 / 60);
      last.current = now;
      let moving = false;
      for (const s of slots) {
        const t = targetFor(f, s);
        let b = bodies.current.get(s.id);
        if (!b) {
          const h = hash(s.id) % 100;
          b = {
            p: { x: f.cx, y: f.cy },
            v: { x: 0, y: 0 },
            k: (s.kind === "hub" ? 200 : 140) * (0.85 + h / 330),
            c: s.kind === "hub" ? 20 : 15,
          };
          bodies.current.set(s.id, b);
        }
        if (reduce || drag.current?.id === s.id) {
          b.p = { ...t };
          b.v = { x: 0, y: 0 };
          continue;
        }
        b.v.x += (b.k * (t.x - b.p.x) - b.c * b.v.x) * dt;
        b.v.y += (b.k * (t.y - b.p.y) - b.c * b.v.y) * dt;
        b.p.x += b.v.x * dt;
        b.p.y += b.v.y * dt;
        if (Math.abs(b.v.x) + Math.abs(b.v.y) > 0.6 || Math.abs(t.x - b.p.x) + Math.abs(t.y - b.p.y) > 0.4) moving = true;
        else b.p = { ...t };
      }
      setTick((n) => (n + 1) % 1e6);
      if (moving || drag.current) raf.current = requestAnimationFrame((t) => stepRef.current(t));
      else last.current = 0;
    },
    [frame, slots, targetFor, reduce],
  );
  // The loop always calls the latest step, so it never runs on stale props.
  const stepRef = useRef(step);
  stepRef.current = step;

  const kick = useCallback(() => {
    if (raf.current == null) raf.current = requestAnimationFrame((t) => stepRef.current(t));
  }, []);

  useEffect(() => {
    kick();
  }, [frame, bloomed, kick]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    },
    [],
  );

  // Snap (don't spring) on resize, so the chart doesn't swim when the window changes.
  const prevSize = useRef("");
  useEffect(() => {
    if (!frame || !bloomed) return;
    const key = `${frame.width}x${frame.height}`;
    if (prevSize.current && prevSize.current !== key) {
      for (const s of slots) {
        const b = bodies.current.get(s.id);
        if (b) {
          b.p = targetFor(frame, s);
          b.v = { x: 0, y: 0 };
        }
      }
    }
    prevSize.current = key;
  }, [frame, bloomed, slots, targetFor]);

  // --- dragging (play only; nothing is saved) ----------------------------------
  const local = (e: React.PointerEvent): Vec => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !frame) return;
    const { angle, radius } = clampToChart(frame, local(e));
    d.pos = polar(frame, angle, radius);
    kick();
  };

  const onNodeDown = (e: React.PointerEvent, s: Slot) => {
    if (!frame || e.button > 0 || dimmed) return;
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    const { angle, radius } = clampToChart(frame, local(e));
    drag.current = { id: s.id, kind: s.kind, pointerId: e.pointerId, pos: polar(frame, angle, radius) };
    setDragId(s.id);
    setRovingId(s.id);
    onFirstTouch();
    kick();
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    // Let go: everything springs back to where Nico's skills put it.
    drag.current = null;
    setDragId(null);
    kick();
  };

  // --- keyboard: arrows move focus between nodes; focus reads the value --------
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const order = slots.map((s) => s.id);
  const tabbable = rovingId || order[0];

  const onKey = (e: React.KeyboardEvent, s: Slot) => {
    const i = order.indexOf(s.id);
    let to: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = i - 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = order.length - 1;
    if (to == null) return;
    e.preventDefault();
    const id = order[(to + order.length) % order.length];
    setRovingId(id);
    nodeRefs.current.get(id)?.focus();
  };

  // --- pulse from tags elsewhere on the page --------------------------------
  const [pulsing, setPulsing] = useState<{ id: string; key: number } | null>(null);
  useEffect(() => {
    if (!pulse) return;
    setPulsing(pulse);
    const t = window.setTimeout(() => setPulsing(null), 2400);
    return () => window.clearTimeout(t);
  }, [pulse]);

  // --- what's lit ------------------------------------------------------------
  const activeId = dragId ?? hoverId ?? focusId ?? pulsing?.id ?? null;
  const activeSlot = activeId ? slotById.get(activeId) : undefined;

  const activeLeaf = activeSlot?.kind === "leaf" ? activeSlot.id : null;
  useEffect(() => {
    onActive?.(activeLeaf);
  }, [activeLeaf, onActive]);

  const lit = (s: Slot): "on" | "off" | "neutral" => {
    if (activeSlot) {
      if (activeSlot.kind === "hub") return s.categoryId === activeSlot.categoryId ? "on" : "off";
      if (s.id === activeSlot.id || s.id === activeSlot.hub) return "on";
      return s.categoryId === activeSlot.categoryId ? "neutral" : "off";
    }
    if (highlight) {
      if (s.kind === "leaf") return highlight.has(s.id) ? "on" : "off";
      return (children.get(s.id) ?? []).some((c) => highlight.has(c.id)) ? "neutral" : "off";
    }
    return "neutral";
  };

  const pos = (id: string) => bodies.current.get(id)?.p ?? (frame ? { x: frame.cx, y: frame.cy } : { x: 0, y: 0 });
  const valueOf = (s: Slot) => (s.kind === "leaf" ? values[s.id] : meanOf(s.id));
  const describe = (s: Slot) => {
    const v = valueOf(s);
    const level = levelName(v, rings);
    return s.kind === "hub"
      ? t.chart.familyAvg(s.label, children.get(s.id)?.length ?? 0, v)
      : `${s.label}: ${t.chart.outOf(v)}${level ? `, ${level}` : ""}`;
  };

  return (
    <div ref={wrapRef} className={`relative w-full select-none ${fitHeight ? "h-full" : ""}`}>
      {frame && (
        <div
          className={fitHeight ? "absolute bottom-0 left-1/2 -translate-x-1/2" : "relative mx-auto"}
          style={{ width: frame.width, height: frame.height }}
        >
          <svg
            ref={svgRef}
            width={frame.width}
            height={frame.height}
            viewBox={`0 0 ${frame.width} ${frame.height}`}
            role="group"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            className="block overflow-visible transition-opacity duration-500"
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ fontSize: frame.fontSize, opacity: dimmed ? 0.07 : 1 }}
          >
            <Rings frame={frame} rings={rings} />

            {/* links */}
            <g fill="none" strokeLinecap="round">
              {slots.map((s) => {
                const state = lit(s);
                const p = pos(s.id);
                const op = state === "off" ? 0.1 : state === "on" ? 0.95 : 0.5;
                if (s.kind === "hub") {
                  return (
                    <line
                      key={"l" + s.id}
                      x1={frame.cx}
                      y1={frame.cy}
                      x2={p.x}
                      y2={p.y}
                      stroke={s.color}
                      strokeOpacity={op}
                      strokeWidth={1.4}
                      style={{ transition: "stroke-opacity .3s" }}
                    />
                  );
                }
                const h = pos(s.hub!);
                const dx = p.x - frame.cx;
                const dy = p.y - frame.cy;
                const len = Math.hypot(dx, dy) || 1;
                const hr = Math.hypot(h.x - frame.cx, h.y - frame.cy);
                const c = { x: frame.cx + (dx / len) * hr * 1.08, y: frame.cy + (dy / len) * hr * 1.08 };
                return (
                  <path
                    key={"l" + s.id}
                    d={`M${h.x},${h.y} Q${c.x},${c.y} ${p.x},${p.y}`}
                    stroke={s.color}
                    strokeOpacity={op}
                    strokeWidth={state === "on" ? 1.6 : 1.1}
                    style={{ transition: "stroke-opacity .3s" }}
                  />
                );
              })}
            </g>

            {/* nodes */}
            {slots.map((s) => {
              const p = pos(s.id);
              const state = lit(s);
              const isActive = activeId === s.id;
              const emphasised = state === "on";
              const v = valueOf(s);
              const theta = Math.atan2(frame.cy - p.y, p.x - frame.cx);
              const deg = (theta * 180) / Math.PI;
              const right = theta < Math.PI / 2;
              const ux = Math.cos(theta);
              const uy = -Math.sin(theta);
              // Hub labels run inward toward the portrait; skip when they'd slide under it (legend still names them).
              const hubRoom = Math.hypot(p.x - frame.cx, p.y - frame.cy) - 12 - frame.root / 2 - 4;
              const showLabel =
                !frame.compact &&
                (s.kind === "leaf" || isActive || hubRoom > s.label.length * (frame.fontSize - 1) * CHAR_W * 1.08);
              const dotR = s.kind === "hub" ? 5.5 : emphasised ? 5.5 : 4.2;
              const lx = p.x + ux * (dotR + 7);
              const ly = p.y + uy * (dotR + 7);
              return (
                <g
                  key={s.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(s.id, el);
                    else nodeRefs.current.delete(s.id);
                  }}
                  role="img"
                  aria-label={describe(s)}
                  tabIndex={tabbable === s.id ? 0 : -1}
                  onFocus={() => {
                    setFocusId(s.id);
                    setRovingId(s.id);
                  }}
                  onBlur={() => setFocusId((f) => (f === s.id ? null : f))}
                  onKeyDown={(e) => onKey(e, s)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHoverId(s.id)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setHoverId((h) => (h === s.id ? null : h))}
                  onPointerDown={(e) => onNodeDown(e, s)}
                  style={{
                    cursor: dragId === s.id ? "grabbing" : "grab",
                    opacity: state === "off" ? 0.22 : 1,
                    transition: "opacity .3s",
                  }}
                >
                  <circle cx={p.x} cy={p.y} r={frame.compact ? 18 : 14} fill="transparent" style={{ touchAction: "none" }} />
                  {pulsing?.id === s.id && (
                    <circle key={pulsing.key} cx={p.x} cy={p.y} r={8} fill="none" stroke={s.color} strokeWidth={1.5} className="chart-ping" />
                  )}
                  {focusId === s.id && <circle cx={p.x} cy={p.y} r={dotR + 5} fill="none" stroke={INK} strokeWidth={1.5} />}
                  {s.kind === "hub" ? (
                    <circle cx={p.x} cy={p.y} r={dotR} fill="#fff" stroke={s.color} strokeWidth={2} />
                  ) : (
                    <circle cx={p.x} cy={p.y} r={dotR} fill={s.color} stroke="#fff" strokeWidth={1.5} />
                  )}

                  {showLabel && s.kind === "leaf" && (
                    <text
                      x={lx}
                      y={ly}
                      transform={`rotate(${right ? -deg : 180 - deg} ${lx} ${ly})`}
                      textAnchor={right ? "start" : "end"}
                      dominantBaseline="central"
                      fill={emphasised ? INK : INK_2}
                      fontWeight={emphasised ? 550 : 400}
                      className="pointer-events-none"
                    >
                      {right ? (
                        <>
                          {s.label}
                          {(isActive || emphasised) && (
                            <tspan className="font-mono" fill={INK_3} dx={6} style={{ fontSize: frame.fontSize - 1 }}>
                              {v}
                            </tspan>
                          )}
                        </>
                      ) : (
                        <>
                          {(isActive || emphasised) && (
                            <tspan className="font-mono" fill={INK_3} style={{ fontSize: frame.fontSize - 1 }}>
                              {v}
                            </tspan>
                          )}
                          <tspan dx={isActive || emphasised ? 6 : 0}>{s.label}</tspan>
                        </>
                      )}
                    </text>
                  )}
                  {showLabel && s.kind === "hub" && (
                    <text
                      x={p.x - ux * 12}
                      y={p.y - uy * 12}
                      transform={`rotate(${right ? -deg : 180 - deg} ${p.x - ux * 12} ${p.y - uy * 12})`}
                      textAnchor={right ? "end" : "start"}
                      dominantBaseline="central"
                      fill={INK}
                      stroke="#fff"
                      strokeWidth={4}
                      paintOrder="stroke"
                      strokeLinejoin="round"
                      className="pointer-events-none font-mono uppercase"
                      style={{ fontSize: frame.fontSize - 2, letterSpacing: "0.06em" }}
                    >
                      {s.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {renderOverlay?.(frame)}

          <div className="absolute" style={{ left: frame.cx, top: frame.cy }}>
            {renderRoot(frame)}
          </div>

          {frame.compact && (
            <div
              className="pointer-events-none absolute top-0 left-0 font-mono text-[11px] transition-opacity"
              style={{ opacity: dimmed ? 0 : 1 }}
              aria-hidden
            >
              {activeSlot ? (
                <span className="inline-flex items-center gap-2 border border-line bg-white px-2 py-1 text-ink">
                  <span className="size-2" style={{ background: activeSlot.color }} />
                  {activeSlot.label}
                  <span className="text-ink-3 tabular">{valueOf(activeSlot)}</span>
                </span>
              ) : (
                <span className="text-ink-3">{t.chart.touch}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Rings({ frame: f, rings }: { frame: Frame; rings: Skills["rings"] }) {
  const tight = (f.r1 - f.r0) / Math.max(1, rings.length) < 70;
  return (
    <g aria-hidden>
      {/* r0 guide: the portrait's orbit */}
      <path d={`M${f.cx - f.r0},${f.cy} A${f.r0},${f.r0} 0 0 1 ${f.cx + f.r0},${f.cy}`} fill="none" stroke={LINE} />
      {rings.map((ring, i) => {
        const r = radiusFor(f, ring.value);
        const outer = i === rings.length - 1;
        const dy = tight && i % 2 ? 30 : 18;
        return (
          <g key={ring.value}>
            <path
              d={`M${f.cx - r},${f.cy} A${r},${r} 0 0 1 ${f.cx + r},${f.cy}`}
              fill="none"
              stroke={outer ? LINE_2 : LINE}
              strokeDasharray={outer ? undefined : "2 4"}
            />
            <line x1={f.cx + r} x2={f.cx + r} y1={f.cy} y2={f.cy + 5} stroke={LINE_2} />
            <line x1={f.cx - r} x2={f.cx - r} y1={f.cy} y2={f.cy + 5} stroke={LINE_2} />
            {!f.compact && ring.label && (
              <text x={f.cx + r} y={f.cy + dy} textAnchor="middle" fill={INK_3} className="font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: "0.06em" }}>
                {ring.label}
              </text>
            )}
            <text x={f.cx - r} y={f.cy + 18} textAnchor="middle" fill={INK_3} className="font-mono tabular" style={{ fontSize: 9.5 }}>
              {ring.value}
            </text>
          </g>
        );
      })}
      <line x1={f.cx - f.r1 - 10} x2={f.cx + f.r1 + 10} y1={f.cy} y2={f.cy} stroke={LINE_2} />
    </g>
  );
}
