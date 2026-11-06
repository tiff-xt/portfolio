"use client";
import { type ElementType, type ComponentPropsWithoutRef, Fragment, useEffect, useRef } from "react";

type Props<T extends ElementType> = {
  as?: T;
  /** Stagger index; multiplied by --stagger. */
  index?: number;
  /** Fraction of the element that must be visible. */
  threshold?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * Scroll-reveal primitive. All motion lives in CSS ([data-reveal] in
 * globals.css) so it is compositor-only and disappears under reduced motion;
 * JS only flips one attribute, once.
 */
export function Reveal<T extends ElementType = "div">({ as, index = 0, threshold = 0.2, style, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return <Tag ref={ref} data-reveal="" style={{ "--i": index, ...style }} {...rest} />;
}

/** Headline that rises word by word. Text stays a single readable string for AT. */
export function SplitText({ text, className, as = "span" }: { text: string; className?: string; as?: ElementType }) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.setAttribute("data-in", "");
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i, all) => (
        <Fragment key={i}>
          <span aria-hidden className="split-word" style={{ "--i": i } as React.CSSProperties}>
            <span>{w}</span>
          </span>
          {i < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
