"use client";

import React, { useId, useRef, useState, useEffect } from "react";

interface LiquidGlassSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  className?: string;
}

export function LiquidGlassSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  name,
  ariaLabel,
  className = "",
}: LiquidGlassSwitchProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const gooId = `liquid-goo-${safeId}`;
  const knockoutId = `liquid-knockout-${safeId}`;
  const removeBlackId = `liquid-remove-black-${safeId}`;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragInfo = useRef({
    startX: 0,
    startComplete: 0,
    isDragging: false,
    hasMoved: false,
  });

  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [complete, setComplete] = useState(checked ? 1 : 0);

  // Sync state if checked prop changes from outside (e.g. settings context reset)
  useEffect(() => {
    if (!dragInfo.current.isDragging) {
      setComplete(checked ? 1 : 0);
    }
  }, [checked]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Capture pointer to track dragging outside bounds
    buttonRef.current?.setPointerCapture(e.pointerId);
    
    dragInfo.current = {
      startX: e.clientX,
      startComplete: checked ? 1 : 0,
      isDragging: true,
      hasMoved: false,
    };
    
    setIsPressed(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !dragInfo.current.isDragging) return;
    
    const deltaX = e.clientX - dragInfo.current.startX;
    
    // If movement is larger than 3px, mark it as a genuine drag gesture
    if (Math.abs(deltaX) > 3) {
      dragInfo.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragInfo.current.hasMoved) {
      // 20px is the active travel distance of the thumb
      const travelDistance = 20;
      const progress = Math.max(0, Math.min(1, dragInfo.current.startComplete + deltaX / travelDistance));
      setComplete(progress);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !dragInfo.current.isDragging) return;

    buttonRef.current?.releasePointerCapture(e.pointerId);
    setIsPressed(false);
    setIsDragging(false);
    
    const wasDragging = dragInfo.current.hasMoved;
    const finalComplete = complete;
    
    dragInfo.current.isDragging = false;

    if (!wasDragging) {
      // It's a clean tap, just toggle state
      const nextChecked = !checked;
      onCheckedChange(nextChecked);
      setComplete(nextChecked ? 1 : 0);
    } else {
      // Resolve drag based on threshold
      const nextChecked = finalComplete >= 0.5;
      onCheckedChange(nextChecked);
      setComplete(nextChecked ? 1 : 0);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !dragInfo.current.isDragging) return;

    buttonRef.current?.releasePointerCapture(e.pointerId);
    setIsPressed(false);
    setIsDragging(false);
    dragInfo.current.isDragging = false;
    
    // Reset to current checked state on cancel
    setComplete(checked ? 1 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onCheckedChange(!checked);
    }
  };

  // Determine dynamic scale & deform values during dragging
  const delta = Math.abs(complete - (checked ? 1 : 0));
  
  // Drag stretch deformation constraints
  const scaleX = isDragging ? 1 + delta * 0.15 : 1;
  const scaleY = isDragging ? 1 - delta * 0.08 : 1;
  const pressedScale = isPressed && !isDragging ? 1.10 : 1;

  // Compile CSS properties for layout positioning and custom filters
  const switchStyle = {
    "--complete": complete,
    "--scale-x": scaleX * pressedScale,
    "--scale-y": scaleY * pressedScale,
    "--goo-filter": `url(#${gooId})`,
    "--knockout-filter": `url(#${knockoutId})`,
    "--remove-black-filter": `url(#${removeBlackId})`,
  } as React.CSSProperties;

  return (
    <button
      ref={buttonRef}
      id={id}
      name={name}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      style={switchStyle}
      className={`racectrl-liquid-switch ${checked ? "is-checked" : ""} ${
        isDragging ? "is-dragging" : ""
      } ${disabled ? "is-disabled" : ""} ${className}`}
    >
      {/* 1. Knockout masking layer */}
      <div className="racectrl-liquid-switch__knockout">
        <div className="racectrl-liquid-switch__indicator racectrl-liquid-switch__indicator--masked">
          <div className="racectrl-liquid-switch__mask" />
        </div>
      </div>

      {/* 2. Physical liquid layer */}
      <div className="racectrl-liquid-switch__liquid">
        <div className="racectrl-liquid-switch__shadow" />
        <div className="racectrl-liquid-switch__wrapper">
          <div className="racectrl-liquid-switch__liquids">
            <div className="racectrl-liquid-switch__liquid-shadow" />
            <div className="racectrl-liquid-switch__liquid-track" />
          </div>
        </div>
        <div className="racectrl-liquid-switch__cover" />
      </div>

      {/* 3. Embedded filters definition */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id={gooId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>

          <filter id={knockoutId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 -1 1" />
          </filter>

          <filter id={removeBlackId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 1 0" />
          </filter>
        </defs>
      </svg>
    </button>
  );
}
