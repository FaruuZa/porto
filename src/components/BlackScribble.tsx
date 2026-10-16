import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { blackSpaceManager, ScribbleLocation } from '../utils/blackSpaceState';

interface BlackScribbleProps {
  scribble: ScribbleLocation;
  className?: string;
}

export const BlackScribble: React.FC<BlackScribbleProps> = ({ scribble, className = '' }) => {
  const [isDissolving, setIsDissolving] = useState(false);
  const isCollected = blackSpaceManager.hasFound(scribble.id);

  if (isCollected && !isDissolving) {
    return null;
  }

  const handleCollect = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (isCollected || isDissolving) return;

    sound.playHit();
    setIsDissolving(true);

    window.setTimeout(() => {
      const collected = blackSpaceManager.collectScribble(scribble.id);
      if (collected && blackSpaceManager.getState().canWakeUp) {
        sound.playSecret();
      }
    }, 340);
  };

  // Authentic natural hand-drawn ballpoint & felt-tip marker scribbles (chaotic, irregular, messy)
  const renderScribblePath = () => {
    switch (scribble.variant) {
      case 0:
        // Variant 0: Frantic Ballpoint Crossout (tight, erratic zig-zags with sharp overshoots)
        return (
          <svg
            viewBox="0 0 48 38"
            className="w-9 h-7 sm:w-11 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Primary chaotic scratch zigzag */}
            <path
              d="M 5,22 Q 8,11 12,19 Q 15,28 19,13 Q 23,7 26,24 Q 28,31 32,16 Q 35,9 39,26 Q 42,32 44,18"
              strokeWidth="2.4"
            />
            {/* Overlapping aggressive cross gouge */}
            <path
              d="M 7,12 Q 16,18 24,11 Q 31,6 38,19 Q 43,26 42,9 M 11,29 Q 19,20 28,27 Q 35,32 41,21"
              strokeWidth="2.0"
            />
            {/* Nervous stray scratch marks & ink blot */}
            <path
              d="M 14,7 L 17,31 M 23,5 L 21,33 M 31,8 L 33,30 M 8,17 L 38,15"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <circle cx="27" cy="18" r="2.2" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="24" y1="18" x2="2" y2="3" />
                <line x1="24" y1="18" x2="46" y2="4" />
                <line x1="24" y1="18" x2="47" y2="34" />
                <line x1="24" y1="18" x2="1" y2="35" />
                <circle cx="4" cy="4" r="1.8" fill="currentColor" />
                <circle cx="44" cy="5" r="1.8" fill="currentColor" />
                <circle cx="45" cy="32" r="1.8" fill="currentColor" />
                <circle cx="3" cy="33" r="1.8" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 1:
        // Variant 1: Nervous Felt-Tip Ink Tangle (irregular wandering scribble coils)
        return (
          <svg
            viewBox="0 0 48 38"
            className="w-9 h-7 sm:w-11 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Chaotic looping knot */}
            <path
              d="M 12,24 C 6,14 18,6 27,11 C 36,16 41,8 35,19 C 29,30 11,31 8,20 C 5,9 20,4 32,8 C 42,12 43,27 34,31 C 25,35 15,26 18,17 C 21,8 34,14 28,25 C 22,33 13,22 22,15"
              strokeWidth="2.2"
            />
            {/* Stray aggressive slashes escaping the coil */}
            <path
              d="M 4,28 Q 18,14 36,9 M 9,8 Q 23,22 41,27 M 16,33 L 31,5"
              strokeWidth="1.8"
              opacity="0.85"
            />
            {/* Organic ink pooling blobs */}
            <ellipse cx="23" cy="19" rx="2.5" ry="1.8" fill="currentColor" />
            <circle cx="33" cy="14" r="1.4" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="24" y1="18" x2="3" y2="2" />
                <line x1="24" y1="18" x2="45" y2="3" />
                <line x1="24" y1="18" x2="46" y2="35" />
                <line x1="24" y1="18" x2="2" y2="34" />
                <circle cx="5" cy="4" r="1.6" fill="currentColor" />
                <circle cx="43" cy="4" r="1.8" fill="currentColor" />
                <circle cx="44" cy="33" r="1.7" fill="currentColor" />
                <circle cx="4" cy="32" r="1.6" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 2:
      default:
        // Variant 2: Raw Scratch Wound (harsh jagged gouges scratched violently into paper)
        return (
          <svg
            viewBox="0 0 48 38"
            className="w-9 h-7 sm:w-11 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sharp jagged back-and-forth pen gouges */}
            <path
              d="M 6,9 L 41,28 M 9,31 L 43,8 M 18,4 L 29,34 M 5,20 L 44,16 M 22,33 L 26,5"
              strokeWidth="2.4"
            />
            {/* Irregular hand scratch overlay */}
            <path
              d="M 11,15 Q 19,8 28,12 Q 38,16 35,26 Q 30,33 21,29 Q 12,25 15,16 Z"
              strokeWidth="1.9"
            />
            {/* Asymmetrical heavy pen strike */}
            <path
              d="M 14,24 L 20,11 L 32,23 L 37,13"
              strokeWidth="2.1"
            />
            <circle cx="21" cy="17" r="2.0" fill="currentColor" />
            <circle cx="28" cy="21" r="1.6" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="24" y1="18" x2="1" y2="4" />
                <line x1="24" y1="18" x2="47" y2="2" />
                <line x1="24" y1="18" x2="46" y2="36" />
                <line x1="24" y1="18" x2="2" y2="35" />
                <circle cx="3" cy="5" r="1.8" fill="currentColor" />
                <circle cx="45" cy="3" r="1.8" fill="currentColor" />
                <circle cx="44" cy="34" r="1.8" fill="currentColor" />
                <circle cx="4" cy="33" r="1.8" fill="currentColor" />
              </g>
            )}
          </svg>
        );
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCollect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCollect(e);
        }
      }}
      className={`scribble-mark inline-flex items-center justify-center p-1 rounded-xs cursor-pointer select-none transition-all duration-300 transform ${
        isDissolving
          ? 'ink-explode'
          : 'opacity-95 hover:opacity-100 hover:scale-115 active:scale-95'
      } text-[#dc2626] hover:text-[#ff4d4d] ${className}`}
      title=" "
      aria-label="A disturbed ink anomaly"
    >
      {renderScribblePath()}
    </div>
  );
};
