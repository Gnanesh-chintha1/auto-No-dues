import React, { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../utils/animation';

interface AnimatedRupeeAmountProps {
  amount: number;
  className?: string;
}

export const AnimatedRupeeAmount: React.FC<AnimatedRupeeAmountProps> = ({ amount, className = '' }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevAmountRef = useRef<number>(0);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `₹${amount.toLocaleString('en-IN')}`;
      prevAmountRef.current = amount;
      return;
    }

    const startVal = prevAmountRef.current;
    const endVal = amount;
    const obj = { val: startVal };

    gsap.to(obj, {
      val: endVal,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) {
          el.textContent = `₹${Math.round(obj.val).toLocaleString('en-IN')}`;
        }
      },
      onComplete: () => {
        prevAmountRef.current = endVal;
      },
    });
  }, [amount]);

  return (
    <span ref={spanRef} className={`font-mono font-bold ${className}`}>
      ₹{amount.toLocaleString('en-IN')}
    </span>
  );
};
