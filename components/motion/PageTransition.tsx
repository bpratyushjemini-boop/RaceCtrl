"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    requestAnimationFrame(() => {
      setPrefersReducedMotion(motionQuery.matches);
    });
  }, []);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      
      if (prefersReducedMotion) {
        requestAnimationFrame(() => {
          setDisplayChildren(children);
        });
        return;
      }

      const container = containerRef.current;
      if (container) {
        // Step 1: Start fade out
        container.style.transition = "opacity 90ms ease-out, transform 90ms ease-out";
        container.style.opacity = "0.01";
        container.style.transform = "translate3d(0, -4px, 0)";
      }

      const timer = setTimeout(() => {
        // Step 2: Swap content and reset position instantly below viewport
        requestAnimationFrame(() => {
          setDisplayChildren(children);
        });
        
        if (container) {
          container.style.transition = "none";
          container.style.opacity = "0.01";
          container.style.transform = "translate3d(0, 8px, 0)";
          
          // Force layout reflow to register the reset state
          void container.offsetHeight;
        }

        requestAnimationFrame(() => {
          if (container) {
            container.style.transition = "opacity 280ms cubic-bezier(0.25, 1, 0.5, 1), transform 280ms cubic-bezier(0.25, 1, 0.5, 1)";
            container.style.opacity = "1";
            container.style.transform = "translate3d(0, 0, 0)";
          }
        });
      }, 95);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      style={
        !prefersReducedMotion
          ? {
              opacity: 1,
              transform: "translate3d(0, 0, 0)",
              willChange: "opacity, transform",
            }
          : {}
      }
    >
      {displayChildren}
    </div>
  );
}
