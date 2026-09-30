"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import type { Profile } from "@/content/types";
import { useI18n } from "../I18n";

/** How much the portrait grows while the childhood photo shows. */
export const SCALE = 1.6;
/** Zoom into the childhood photo around its focal point (Sanity hotspot). */
const KID_ZOOM = 1.9;
/** Reveal radius, as a multiple of the portrait size. √2 reaches the far corner from any entry point. */
const REVEAL = 1.5;

/**
 * The chart's root node. Hover (or tap / Enter) reveals Nico as a kid:
 * a circle grows from the pointer and uncovers the childhood photo.
 */
export default function Portrait({
  profile,
  size,
  revealed,
  onHover,
  onToggle,
}: {
  profile: Profile;
  size: number;
  revealed: boolean;
  onHover: (on: boolean) => void;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const ref = useRef<HTMLButtonElement>(null);
  const r = useMotionValue(0);
  const cx = useMotionValue(size / 2);
  const cy = useMotionValue(size / 2);
  const clip = useMotionTemplate`circle(${r}px at ${cx}px ${cy}px)`;
  const kid = profile.childhood;

  useEffect(() => {
    const target = revealed ? size * REVEAL : 0;
    const c = reduce
      ? animate(r, target, { duration: 0 })
      : animate(r, target, revealed ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] } : { duration: 0.3, ease: [0.4, 0, 1, 1] });
    return () => c.stop();
  }, [revealed, reduce, r, size]);

  // Pointer position → coordinates inside the (unscaled) photo circle.
  const origin = (x: number, y: number) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return;
    const fx = Math.min(1, Math.max(0, (x - b.left) / b.width));
    const fy = Math.min(1, Math.max(0, (y - b.top) / b.height));
    cx.set(fx * size);
    cy.set(fy * size);
  };

  const pos = (f?: { x: number; y: number }) => (f ? `${f.x * 100}% ${f.y * 100}%` : "50% 50%");

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-expanded={revealed}
      aria-controls="childhood-note"
      aria-label={revealed ? t.portrait.hide : t.portrait.show(profile.shortName)}
      disabled={!kid}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        origin(e.clientX, e.clientY);
        onHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        origin(e.clientX, e.clientY);
        onHover(false);
      }}
      onClick={(e) => {
        if (e.detail === 0) {
          cx.set(size / 2);
          cy.set(size / 2);
        } else if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType !== "mouse") {
          origin(e.clientX, e.clientY);
        }
        onToggle();
      }}
      className="absolute block -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white p-[3px] ring-1 ring-line-2 disabled:cursor-default"
      style={{ width: size + 6, height: size + 6 }}
      // Grow upward: the bottom edge stays put, so nothing below the chart gets covered.
      animate={{ scale: revealed ? SCALE : 1, y: revealed ? -((SCALE - 1) * (size + 6)) / 2 : 0 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 22 }}
    >
      <span className="relative block size-full overflow-hidden rounded-full bg-surface">
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          fill
          loading="eager"
          fetchPriority="high"
          placeholder={profile.portrait.blurDataURL ? "blur" : "empty"}
          blurDataURL={profile.portrait.blurDataURL}
          sizes={`${Math.round(size * SCALE)}px`}
          className="object-cover"
          style={{ objectPosition: pos(profile.portrait.focus) }}
        />
        {kid && (
          <motion.span className="absolute inset-0 block overflow-hidden" style={{ clipPath: clip }} aria-hidden={!revealed}>
            <Image
              src={kid.src}
              alt={kid.alt}
              fill
              loading="eager"
              placeholder={kid.blurDataURL ? "blur" : "empty"}
              blurDataURL={kid.blurDataURL}
              // Load enough pixels for the zoom, or it goes soft.
              sizes={`${Math.round(size * SCALE * KID_ZOOM)}px`}
              className="object-cover"
              style={{
                objectPosition: pos(kid.focus),
                transform: `scale(${KID_ZOOM})`,
                transformOrigin: pos(kid.focus),
              }}
            />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

/** The quote that appears with the childhood photo. */
export function ChildhoodNote({
  profile,
  compact = false,
  className = "",
}: {
  profile: Profile;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (!profile.childhoodQuote) return null;
  return (
    <motion.blockquote
      id="childhood-note"
      className={`text-center ${className}`}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        className={`mx-auto max-w-[34rem] text-balance text-ink ${compact ? "text-[12.5px] leading-[1.5]" : "text-[15px] leading-relaxed sm:text-base"}`}
      >
        <span aria-hidden className="text-ink-3">“</span>
        {profile.childhoodQuote}
        <span aria-hidden className="text-ink-3">”</span>
      </p>
    </motion.blockquote>
  );
}
