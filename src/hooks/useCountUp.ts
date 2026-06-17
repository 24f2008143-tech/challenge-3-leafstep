import { useState, useEffect, useRef } from "react";

export function useCountUp(endValue: number, duration: number = 1200): number {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const isMounted = useRef(false);

  useEffect(() => {
    // If it's the first mount, we count up from 0 to endValue.
    // Otherwise, we count up from the previous value.
    const startValue = isMounted.current ? previousValueRef.current : 0;
    previousValueRef.current = endValue;
    isMounted.current = true;

    const startTime = performance.now();
    let animationFrameId: number;

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOut cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + (endValue - startValue) * easeOut);
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [endValue, duration]);

  return displayValue;
}
