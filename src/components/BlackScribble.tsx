import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { blackSpaceManager, ScribbleLocation } from '../utils/blackSpaceState';
import { blackSpaceAudio } from '../utils/blackSpaceAudio';

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
      if (collected) {
        const clicks = blackSpaceManager.getState().foundCount;
        blackSpaceAudio.setIntensity(clicks);
        if (blackSpaceManager.getState().canWakeUp) {
          sound.playSecret();
        }
      }
    }, 340);
  };

  // Authentic natural hand-drawn permanent marker & graphite vandalism scribbles
  const renderScribblePath = () => {
    switch (scribble.variant) {
      case 0:
        // Variant 0: Heavy Chisel Marker Zigzag Crossout (furious back-and-forth scrubbing strokes)
        return (
          <svg
            viewBox="0 0 54 36"
            className="w-10 h-7 sm:w-12 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Primary thick marker horizontal scrubbing zigzag */}
            <path
              d="M 4,14 L 50,11 L 6,19 L 48,17 L 3,25 L 51,23 L 8,30 L 46,28"
              strokeWidth="2.8"
            />
            {/* Secondary cross-scrub diagonal passes */}
            <path
              d="M 12,8 L 44,28 M 38,7 L 10,29 M 22,6 L 36,32 M 32,5 L 18,31"
              strokeWidth="2.0"
              opacity="0.85"
            />
            {/* Chaotic overshoot gouge marks */}
            <path
              d="M 2,12 L 10,14 M 44,18 L 53,16 M 1,26 L 12,24 M 43,30 L 52,29"
              strokeWidth="1.8"
            />
            <circle cx="28" cy="18" r="2.2" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="27" y1="18" x2="2" y2="3" />
                <line x1="27" y1="18" x2="52" y2="4" />
                <line x1="27" y1="18" x2="53" y2="33" />
                <line x1="27" y1="18" x2="1" y2="34" />
                <circle cx="4" cy="4" r="1.8" fill="currentColor" />
                <circle cx="50" cy="5" r="1.8" fill="currentColor" />
                <circle cx="51" cy="31" r="1.8" fill="currentColor" />
                <circle cx="3" cy="32" r="1.8" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 1:
        // Variant 1: Manic Graphite/Pencil Vandalism Scratch (sharp rapid claw gouges hacking into paper)
        return (
          <svg
            viewBox="0 0 54 36"
            className="w-10 h-7 sm:w-12 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* High-frequency sharp pencil slash cluster */}
            <path
              d="M 5,6 L 49,30 M 8,31 L 47,5 M 16,3 L 39,33 M 36,3 L 13,33 M 24,2 L 31,34"
              strokeWidth="2.2"
            />
            {/* Chaotic jagged horizontal saw marks */}
            <path
              d="M 7,18 L 14,10 L 22,25 L 30,12 L 38,24 L 46,11 L 49,20"
              strokeWidth="2.0"
            />
            {/* Stray aggressive pencil stabs */}
            <path
              d="M 3,22 L 18,20 M 34,14 L 51,16 M 9,12 L 23,8 M 31,27 L 46,26"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <ellipse cx="27" cy="17" rx="2.4" ry="1.6" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="27" y1="18" x2="3" y2="2" />
                <line x1="27" y1="18" x2="51" y2="3" />
                <line x1="27" y1="18" x2="52" y2="34" />
                <line x1="27" y1="18" x2="2" y2="33" />
                <circle cx="5" cy="4" r="1.6" fill="currentColor" />
                <circle cx="49" cy="4" r="1.8" fill="currentColor" />
                <circle cx="50" cy="32" r="1.7" fill="currentColor" />
                <circle cx="4" cy="31" r="1.6" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 2:
        // Variant 2: Heavy Vandal "X" Strike-Through (thick multi-stroke blackout cross)
        return (
          <svg
            viewBox="0 0 54 36"
            className="w-10 h-7 sm:w-12 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Primary heavy dual-stroke X gouges */}
            <path
              d="M 6,5 L 48,31 M 8,4 L 50,30 M 47,5 L 7,31 M 49,6 L 9,32"
              strokeWidth="2.7"
            />
            {/* Overlapping frantic center blackout scrawl */}
            <path
              d="M 12,18 L 42,17 M 15,14 L 39,22 M 17,23 L 37,13 M 20,9 L 34,27"
              strokeWidth="2.1"
            />
            {/* Edge overshoot splatter ticks */}
            <circle cx="27" cy="18" r="2.8" fill="currentColor" />
            <circle cx="16" cy="12" r="1.6" fill="currentColor" />
            <circle cx="38" cy="24" r="1.6" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="27" y1="18" x2="1" y2="4" />
                <line x1="27" y1="18" x2="53" y2="2" />
                <line x1="27" y1="18" x2="52" y2="35" />
                <line x1="27" y1="18" x2="2" y2="34" />
                <circle cx="3" cy="5" r="1.8" fill="currentColor" />
                <circle cx="51" cy="3" r="1.8" fill="currentColor" />
                <circle cx="50" cy="33" r="1.8" fill="currentColor" />
                <circle cx="4" cy="32" r="1.8" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 3:
        // Variant 3: Barbed Felt-Tip Strike-Through (erratic horizontal censorship scribble)
        return (
          <svg
            viewBox="0 0 54 36"
            className="w-10 h-7 sm:w-12 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Barbed, nervous back-and-forth censorship strike */}
            <path
              d="M 3,18 Q 12,10 20,22 Q 28,12 36,23 Q 44,11 51,19 M 5,16 Q 14,24 23,14 Q 31,25 40,15 Q 47,24 52,17"
              strokeWidth="2.5"
            />
            {/* Rapid jagged tremor lines */}
            <path
              d="M 7,14 L 11,26 L 18,9 L 24,28 L 31,10 L 37,27 L 43,11 L 48,25"
              strokeWidth="2.0"
              opacity="0.9"
            />
            {/* Vandalism puncture marks */}
            <circle cx="21" cy="18" r="2.0" fill="currentColor" />
            <circle cx="34" cy="18" r="2.0" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="27" y1="18" x2="2" y2="2" />
                <line x1="27" y1="18" x2="52" y2="2" />
                <line x1="27" y1="18" x2="52" y2="34" />
                <line x1="27" y1="18" x2="2" y2="34" />
                <circle cx="4" cy="4" r="1.6" fill="currentColor" />
                <circle cx="50" cy="4" r="1.6" fill="currentColor" />
                <circle cx="50" cy="32" r="1.6" fill="currentColor" />
                <circle cx="4" cy="32" r="1.6" fill="currentColor" />
              </g>
            )}
          </svg>
        );

      case 4:
      default:
        // Variant 4: Dense Marker Vandalism Smear (deep ink pooling with furious cross-scratch)
        return (
          <svg
            viewBox="0 0 54 36"
            className="w-10 h-7 sm:w-12 sm:h-8 overflow-visible pointer-events-none line-boil"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Dense chisel marker multi-pass scribble cloud */}
            <path
              d="M 8,11 L 46,25 L 42,10 L 10,27 L 14,8 L 43,28 L 38,7 L 12,30"
              strokeWidth="2.8"
            />
            {/* Violent jagged spikes breaking out */}
            <path
              d="M 3,19 L 16,16 L 27,24 L 38,15 L 51,18 M 18,3 L 26,33 M 34,4 L 28,32"
              strokeWidth="2.2"
            />
            {/* Ink pooling blotches */}
            <ellipse cx="27" cy="18" rx="3.2" ry="2.2" fill="currentColor" />
            <circle cx="17" cy="18" r="2.0" fill="currentColor" />
            <circle cx="37" cy="18" r="2.0" fill="currentColor" />
            {isDissolving && (
              <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="27" y1="18" x2="1" y2="3" />
                <line x1="27" y1="18" x2="53" y2="3" />
                <line x1="27" y1="18" x2="53" y2="34" />
                <line x1="27" y1="18" x2="1" y2="34" />
                <circle cx="3" cy="4" r="1.8" fill="currentColor" />
                <circle cx="51" cy="4" r="1.8" fill="currentColor" />
                <circle cx="51" cy="32" r="1.8" fill="currentColor" />
                <circle cx="3" cy="32" r="1.8" fill="currentColor" />
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
