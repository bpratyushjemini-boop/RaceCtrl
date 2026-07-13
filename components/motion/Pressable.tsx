"use client";

import React, { useState, useEffect } from "react";

interface PressableProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  scaleAmount?: number;
  disabled?: boolean;
}

export function Pressable({
  children,
  className = "",
  onClick,
  scaleAmount = 0.975,
  disabled = false,
}: PressableProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    requestAnimationFrame(() => {
      setPrefersReducedMotion(motionQuery.matches);
    });
  }, []);

  const handlePointerDown = () => {
    if (disabled || prefersReducedMotion) return;
    setIsPressed(true);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const handlePointerCancel = () => {
    setIsPressed(false);
  };

  const style: React.CSSProperties = {
    transform: isPressed ? `scale(${scaleAmount})` : "scale(1)",
    transition: "transform 140ms cubic-bezier(0.25, 1, 0.5, 1)",
    display: "block",
    width: "100%",
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={onClick}
      className={`select-none cursor-pointer ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
