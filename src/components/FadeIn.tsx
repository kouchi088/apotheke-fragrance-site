"use client";

import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  className = "", 
  direction = 'up' 
}) => {
  const [progress, setProgress] = useState(0);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setProgress(0);
            return;
          }

          // Amplify low intersection ratios so large blocks still reach full visibility.
          const normalized = Math.min(1, entry.intersectionRatio * 2.4);
          setProgress(normalized);
        });
      },
      {
        threshold: thresholds,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, []);

  const getTransform = (value: number) => {
    const distance = (1 - value) * 28;
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(${-distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(${-distance}px)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 ease-out will-change-transform ${className}`}
      style={{
        opacity: Math.max(0, Math.min(1, progress)),
        transform: getTransform(progress),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
