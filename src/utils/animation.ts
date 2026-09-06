import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Animate a numeric element smoothly from start to end with rupee formatting
 */
export const animateAmountCounter = (
  element: HTMLElement | null,
  start: number,
  end: number,
  duration = 0.5
) => {
  if (!element) return;
  if (prefersReducedMotion()) {
    element.textContent = `₹${end.toLocaleString('en-IN')}`;
    return;
  }
  const obj = { val: start };
  gsap.to(obj, {
    val: end,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      if (element) {
        element.textContent = `₹${Math.round(obj.val).toLocaleString('en-IN')}`;
      }
    },
  });
};

/**
 * Flash highlight on a ledger row (green for cleared, amber/red for flagged)
 */
export const flashLedgerRow = (
  element: HTMLElement | null,
  type: 'cleared' | 'flagged' = 'cleared'
) => {
  if (!element) return;
  if (prefersReducedMotion()) return;
  const highlightColor = type === 'cleared' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
  gsap.fromTo(
    element,
    { backgroundColor: highlightColor, scale: 1.01 },
    { backgroundColor: 'transparent', scale: 1, duration: 1.0, ease: 'power2.out' }
  );
};

export { gsap, useGSAP };
