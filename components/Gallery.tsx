"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Gallery as GalleryData } from "@/content/types";
import { useI18n } from "./I18n";

const idx = (i: number) => String(i + 1).padStart(2, "0");

export default function Gallery({ gallery }: { gallery: GalleryData }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const photos = gallery.photos;

  const close = useCallback(() => {
    setOpen((i) => {
      if (i != null) requestAnimationFrame(() => thumbs.current[i]?.focus());
      return null;
    });
  }, []);

  if (!photos.length) return null;

  return (
    <section id="photos" aria-labelledby="photos-title" className="scroll-mt-(--header-h) border-b border-line">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="photos-title" className="meta !text-ink">
              {gallery.title ?? t.gallery.title}
              <span className="ml-2 text-ink-3 tabular">[{idx(photos.length - 1)}]</span>
            </h2>
            {gallery.intro && <p className="mt-2 max-w-md text-[14px] text-ink-2">{gallery.intro}</p>}
          </div>
          <p className="font-mono text-[11px] text-ink-3">{t.gallery.hint}</p>
        </div>

        <JustifiedGrid ratios={photos.map((p) => p.width / p.height)}>
          {(i, style) => {
            const p = photos[i];
            const ratio = p.width / p.height;
            return (
              <li key={p.src} className="group/photo" style={style}>
                <button
                  ref={(el) => {
                    thumbs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setOpen(i)}
                  className="block w-full cursor-zoom-in text-left"
                  aria-label={t.gallery.open(idx(i), p.alt)}
                >
                  <span className="relative block overflow-hidden bg-surface" style={{ aspectRatio: ratio }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      placeholder={p.blurDataURL ? "blur" : "empty"}
                      blurDataURL={p.blurDataURL}
                      sizes="(max-width: 640px) 90vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-(--ease-out-soft) group-hover/photo:scale-[1.025]"
                      style={{ objectPosition: p.focus ? `${p.focus.x * 100}% ${p.focus.y * 100}%` : undefined }}
                    />
                  </span>
                </button>
              </li>
            );
          }}
        </JustifiedGrid>
      </div>

      <AnimatePresence>{open != null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} />}</AnimatePresence>
    </section>
  );
}

const GAP = 8;

/**
 * Splits photos (in order) into rows of near-equal total aspect ratio, so every row
 * fills the width at a similar height. Linear partition, fine for a few dozen photos.
 */
function partition(ratios: number[], rows: number): number[][] {
  const n = ratios.length;
  const k = Math.max(1, Math.min(rows, n));
  const pre = [0];
  for (const r of ratios) pre.push(pre[pre.length - 1] + r);
  const sum = (a: number, b: number) => pre[b] - pre[a];
  // cost[j][i] = best max-row-sum splitting first i items into j rows
  const cost = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
  cost[0][0] = 0;
  for (let j = 1; j <= k; j++)
    for (let i = 1; i <= n; i++)
      for (let m = j - 1; m < i; m++) {
        const c = Math.max(cost[j - 1][m], sum(m, i));
        if (c < cost[j][i]) {
          cost[j][i] = c;
          cut[j][i] = m;
        }
      }
  const out: number[][] = [];
  let i = n;
  for (let j = k; j >= 1; j--) {
    const m = cut[j][i];
    out.unshift(Array.from({ length: i - m }, (_, x) => m + x));
    i = m;
  }
  return out;
}

function JustifiedGrid({
  ratios,
  children,
}: {
  ratios: number[];
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = width < 480 ? 170 : 220;
  const total = ratios.reduce((a, b) => a + b, 0);
  const rows = width ? partition(ratios, Math.round((total * target) / width)) : [];

  return (
    <div ref={ref}>
      {width === 0 ? (
        // Before measuring (SSR): a simple wrap so there's no empty gap.
        <ul className="flex flex-wrap gap-2">
          {ratios.map((r, i) => children(i, { flexGrow: r, flexBasis: `${r * 260}px` }))}
        </ul>
      ) : (
        <div className="flex flex-col" style={{ gap: GAP }}>
          {rows.map((row, ri) => {
            const sum = row.reduce((a, i) => a + ratios[i], 0);
            // Cap a lonely last photo so it doesn't blow up to full width.
            const h = Math.min((width - GAP * (row.length - 1) - 1) / sum, target * 1.6);
            return (
              <ul key={ri} className="flex" style={{ gap: GAP }}>
                {row.map((i) => children(i, { width: ratios[i] * h, flex: "none" }))}
              </ul>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: GalleryData["photos"];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const p = photos[index];
  const ratio = p.width / p.height;
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const go = useCallback((d: number) => onIndex((index + d + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const els = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([tabindex='-1'])");
        if (!els?.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.gallery.dialog(index + 1, photos.length)}
      className="fixed inset-0 z-[70] flex flex-col bg-[#0a0a0a] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
      onPointerDown={(e) => (swipe.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipe.current == null) return;
        const dx = e.clientX - swipe.current;
        swipe.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4 font-mono text-[11px] uppercase sm:px-6">
        <span className="text-white/60 tabular">
          {idx(index)} / {idx(photos.length - 1)}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="px-2 py-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          {t.gallery.close}
        </button>
      </div>

      <div className="relative grid min-h-0 flex-1 place-items-center p-4 sm:p-8">
        <button type="button" tabIndex={-1} aria-hidden onClick={onClose} className="absolute inset-0 cursor-zoom-out" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="relative"
            style={{ aspectRatio: ratio, width: `min(100%, calc((100svh - 9rem) * ${ratio}))` }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Image src={p.src} alt={p.alt} fill sizes="92vw" placeholder={p.blurDataURL ? "blur" : "empty"} blurDataURL={p.blurDataURL} className="object-contain" priority />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-t border-white/10 px-4 font-mono text-[11px] sm:px-6">
        <button type="button" onClick={() => go(-1)} className="px-2 py-1 text-white/80 uppercase transition-colors hover:bg-white/10 hover:text-white" aria-label={t.gallery.prevLabel}>
          {t.gallery.prev}
        </button>
        <button type="button" onClick={() => go(1)} className="px-2 py-1 text-white/80 uppercase transition-colors hover:bg-white/10 hover:text-white" aria-label={t.gallery.nextLabel}>
          {t.gallery.next}
        </button>
      </div>
    </motion.div>
  );
}
