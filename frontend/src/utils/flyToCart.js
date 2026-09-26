// Fly-to-cart animation. No dependencies: uses the Web Animations API.
//
// Usage:
//   flyToCart(imgElement)            // imgElement = the book cover <img>
//
// The target is any element with a `data-cart-target` attribute (put it on
// your Cart link/icon in the navbar). If several exist (desktop + mobile
// nav), the first visible one is used.

function findCartTarget() {
  const candidates = document.querySelectorAll("[data-cart-target]");
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function bump(target) {
  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
      { transform: "scale(0.95)" },
      { transform: "scale(1)" },
    ],
    { duration: 350, easing: "ease-out" }
  );
}

export function flyToCart(sourceImg, { duration = 750 } = {}) {
  const target = findCartTarget();

  if (!sourceImg) {
    console.warn("[flyToCart] No source image element was passed in.");
    return;
  }
  if (!target) {
    console.warn(
      "[flyToCart] No visible element with data-cart-target found. Add it to the Cart link in Navbar.jsx."
    );
    return;
  }

  // Respect reduced-motion: skip the flight, keep the small bump.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    console.info("[flyToCart] 'Reduce motion' is on in your OS, so only the bump plays.");
    bump(target);
    return;
  }

  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  // Size the flying cover relative to the card so it looks right on small
  // phone grids (narrow cards) and on desktop. Book-cover proportions (2:3).
  const thumbW = Math.round(Math.min(72, Math.max(44, from.width * 0.5)));
  const thumbH = Math.round(thumbW * 1.5);

  const startX = from.left + from.width / 2 - thumbW / 2;
  const startY = from.top + from.height / 2 - thumbH / 2;
  const endX = to.left + to.width / 2 - thumbW / 2;
  const endY = to.top + to.height / 2 - thumbH / 2;

  // Curved (quadratic Bezier) path. The arc height scales with the distance
  // so it never swings off the top of a short phone screen.
  const lift = Math.min(140, Math.max(60, Math.abs(startY - endY) * 0.4));
  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - lift;

  const ghost = sourceImg.cloneNode(false);
  ghost.removeAttribute("class");
  ghost.removeAttribute("id");
  ghost.removeAttribute("srcset");
  ghost.removeAttribute("loading");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${thumbW}px`,
    height: `${thumbH}px`,
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    pointerEvents: "none",
    zIndex: "9999",
    willChange: "transform, opacity",
  });
  document.body.appendChild(ghost);

  // Build keyframes along the curve.
  const steps = 18;
  const frames = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
    const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;
    const scale = 1 - 0.65 * t;
    const rotate = 20 * t;
    frames.push({
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: t > 0.85 ? 1 - ((t - 0.85) / 0.15) * 0.6 : 1,
    });
  }

  const anim = ghost.animate(frames, {
    duration,
    easing: "cubic-bezier(0.45, 0, 0.55, 1)",
    fill: "forwards",
  });

  anim.onfinish = () => {
    ghost.remove();
    bump(target);
  };
  anim.oncancel = () => ghost.remove();
}