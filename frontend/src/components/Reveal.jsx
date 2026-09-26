import { useEffect, useRef, useState } from "react";

// Reusable scroll-reveal hook: returns a ref to attach and whether the
// element has entered the viewport. Fires once, then disconnects.
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Wait one frame so the browser paints the initial hidden
          // state before we flip to visible — otherwise, if the
          // element is already near the viewport on load, the
          // transition can fire before the first paint and just
          // "pop in" with no visible animation.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setInView(true));
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView];
}

// Wrapper that applies the fade/slide-up transition based on inView state.
// Transitions are skipped for users who prefer reduced motion.
export default function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}