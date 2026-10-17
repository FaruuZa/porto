import React from 'react';

interface OmoriMarkerScribbleProps {
  variant?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'cover';
}

/**
 * Handcrafted authentic permanent marker zig-zag scribbles inspired by OMORI Black Space.
 * Features 9 distinct variations of furious, multi-layered back-and-forth zig-zag strokes
 * aggressively scrubbing and crossing out the photo subject.
 */
export const OmoriMarkerScribble: React.FC<OmoriMarkerScribbleProps> = ({
  variant = 0,
  className = '',
  size = 'md',
}) => {
  const normalizedVariant = Math.abs(variant) % 9;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    cover: 'w-full h-full max-w-[200px] max-h-[200px]',
  }[size];

  // Render authentic multi-pass permanent marker zigzag paths
  const renderPaths = () => {
    switch (normalizedVariant) {
      case 0:
        // Variant 0: Dense multi-pass horizontal & diagonal zigzag blackout
        return (
          <>
            {/* Primary heavy chisel marker zigzag strokes */}
            <path
              d="M 12,24 L 88,27 L 14,35 L 86,39 L 10,48 L 90,51 L 15,60 L 85,63 L 18,72 L 82,75 L 24,84 L 76,86"
              stroke="#08020a"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.96"
              fill="none"
            />
            {/* Secondary aggressive crossing diagonal zigzags */}
            <path
              d="M 22,18 L 84,78 L 74,84 L 16,28 L 26,16 L 88,72 L 78,88 L 12,34 M 82,20 L 18,80 L 28,86 L 86,26 L 76,14 L 14,74"
              stroke="#040105"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.92"
              fill="none"
            />
            {/* Rapid erratic scratch passes */}
            <path
              d="M 10,30 L 92,32 L 8,44 L 94,46 L 12,56 L 90,58 L 14,68 L 88,70 L 20,80 L 80,82"
              stroke="#000000"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Chaotic overshoot scratch gouges at edges */}
            <path
              d="M 6,36 L 22,34 M 78,42 L 96,40 M 8,52 L 28,50 M 74,62 L 95,64 M 14,66 L 30,68 M 70,78 L 92,76"
              stroke="#050207"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 1:
        // Variant 1: Intense dual-axis cross-zigzag centered over photo subject
        return (
          <>
            {/* Steep angle zigzag scrubbing */}
            <path
              d="M 18,16 L 78,32 L 22,42 L 84,52 L 16,62 L 82,72 L 26,82 L 76,90"
              stroke="#060207"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
              fill="none"
            />
            {/* Opposing diagonal counter-scrub */}
            <path
              d="M 82,18 L 20,34 L 80,44 L 18,54 L 84,64 L 22,74 L 78,84 L 28,92"
              stroke="#000000"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              fill="none"
            />
            {/* Fine jittery overshoots */}
            <path
              d="M 14,24 L 88,38 L 12,50 L 90,60 L 15,70 L 86,78 L 20,88"
              stroke="#0a040d"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 2:
        // Variant 2: Aggressive dense horizontal blackout zigzags with jagged overshoots
        return (
          <>
            <path
              d="M 15,20 L 85,22 L 12,30 L 88,32 L 10,40 L 90,42 L 14,50 L 86,52 L 12,60 L 88,62 L 16,70 L 84,72 L 20,80 L 80,82"
              stroke="#070208"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.96"
              fill="none"
            />
            <path
              d="M 20,18 L 82,82 L 72,86 L 14,26 L 24,14 L 86,74"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
              fill="none"
            />
            <path
              d="M 8,26 L 94,28 L 6,36 L 92,38 L 8,46 L 94,48 L 10,56 L 92,58 L 12,66 L 90,68"
              stroke="#030104"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 3:
        // Variant 3: Furious vertical & diagonal zigzag scrubbing
        return (
          <>
            <path
              d="M 22,14 L 26,88 L 36,12 L 40,86 L 50,14 L 54,88 L 64,12 L 68,86 L 78,16 L 82,84"
              stroke="#060207"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.94"
              fill="none"
            />
            <path
              d="M 14,35 L 86,38 L 12,48 L 88,52 L 16,62 L 84,65 L 20,75 L 80,78"
              stroke="#000000"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.92"
              fill="none"
            />
            <path
              d="M 18,22 L 82,80 L 16,55 L 86,50 L 22,85 L 80,20"
              stroke="#08030b"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 4:
        // Variant 4: Heavy diagonal storm of zigzag scribbles concentrated in the center
        return (
          <>
            <path
              d="M 16,30 L 74,18 L 22,45 L 80,32 L 28,60 L 86,48 L 34,75 L 92,62 L 40,90 L 84,78"
              stroke="#070208"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
              fill="none"
            />
            <path
              d="M 84,28 L 26,16 L 78,43 L 20,32 L 72,58 L 16,48 L 68,74 L 12,64 L 62,88 L 18,78"
              stroke="#000000"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              fill="none"
            />
            <path
              d="M 12,40 L 88,42 L 10,50 L 90,52 L 14,60 L 86,62 L 18,70 L 82,72"
              stroke="#0a040d"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 5:
        // Variant 5: Wide sweeping horizontal chisel marker zigzags with sharp frayed turnarounds
        return (
          <>
            <path
              d="M 10,18 L 90,22 L 8,32 L 92,36 L 12,46 L 88,50 L 10,60 L 90,64 L 14,74 L 86,78 L 18,86 L 82,88"
              stroke="#050106"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.96"
              fill="none"
            />
            <path
              d="M 22,24 L 78,82 L 16,72 L 84,30 L 30,86 L 74,18"
              stroke="#000000"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
              fill="none"
            />
            <path
              d="M 6,28 L 94,30 M 8,42 L 92,44 M 6,56 L 94,58 M 10,70 L 90,72"
              stroke="#07030a"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 6:
        // Variant 6: Tight high-frequency nervous zigzag scribbles
        return (
          <>
            <path
              d="M 14,22 L 86,25 L 12,31 L 88,34 L 10,40 L 90,43 L 14,49 L 86,52 L 12,58 L 88,61 L 10,67 L 90,70 L 16,76 L 84,79 L 20,85 L 80,87"
              stroke="#060207"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.96"
              fill="none"
            />
            <path
              d="M 26,14 L 82,76 L 72,82 L 18,24 L 30,12 L 86,70 L 76,86 L 14,30"
              stroke="#000000"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.92"
              fill="none"
            />
            <path
              d="M 80,18 L 22,78 L 32,84 L 88,28 L 74,12 L 16,72"
              stroke="#0a040d"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 7:
        // Variant 7: Multi-tiered horizontal zig-zag redaction with dense cross-hatching
        return (
          <>
            <path
              d="M 12,26 L 88,28 L 14,36 L 86,38 L 10,46 L 90,48 L 12,56 L 88,58 L 16,66 L 84,68 L 20,76 L 80,78 L 26,86 L 74,88"
              stroke="#070208"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
              fill="none"
            />
            <path
              d="M 16,20 L 84,84 L 12,50 L 88,50 L 16,80 L 84,20"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              fill="none"
            />
            <path
              d="M 8,32 L 94,34 L 6,48 L 94,50 L 8,62 L 92,64 L 12,74 L 88,76"
              stroke="#040105"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );

      case 8:
      default:
        // Variant 8: Heavy saturated permanent marker blackout with violent multi-stroke zigzag fringe
        return (
          <>
            <path
              d="M 10,20 L 90,24 L 12,32 L 88,36 L 8,44 L 92,48 L 14,56 L 86,60 L 10,68 L 90,72 L 16,80 L 84,84 L 22,90 L 78,92"
              stroke="#050106"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.98"
              fill="none"
            />
            <path
              d="M 20,16 L 80,88 L 70,92 L 14,24 L 26,12 L 86,80 M 82,16 L 18,88 L 28,92 L 88,24 L 76,12 L 12,80"
              stroke="#000000"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.94"
              fill="none"
            />
            <path
              d="M 6,28 L 94,30 L 6,42 L 94,44 L 8,54 L 92,56 L 10,66 L 90,68"
              stroke="#0a040d"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
    }
  };

  return (
    <div
      className={`pointer-events-none select-none inline-flex items-center justify-center ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] line-boil"
      >
        {renderPaths()}
      </svg>
    </div>
  );
};
