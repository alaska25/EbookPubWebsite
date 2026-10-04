// Plain JS pub-sub store (not a React context) so axios.js — which lives
// outside the React tree — can push toasts directly from its interceptors.

let idCounter = 0;
let toasts = [];
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(toasts));
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function pushToast({ type = "success", message }) {
  const id = ++idCounter;
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => dismissToast(id), 3500);
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}