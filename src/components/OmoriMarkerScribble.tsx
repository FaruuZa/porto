import React from 'react';

interface OmoriMarkerScribbleProps {
  variant?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'cover';
}

/**
 * Handcrafted natural black marker scribbles inspired by OMORI Black Space marker scratches
 * Features 9 distinct organic scribble variations mirroring genuine physical felt-tip marker scratches.
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

  // Render SVG paths modeled after real pen and marker loops
  const renderPaths = () => {
    switch (normalizedVariant) {
      case 0:
        // Variant 0: Dense circular loop tangle (Photo 2 top-left)
        return (
          <>
            {/* Saturated core ink bleed */}
            <path
              d="M 32,48 C 30,32 50,28 65,34 C 76,40 74,62 58,68 C 42,74 28,62 30,46 C 32,32 68,30 72,52 C 75,70 44,76 34,60 C 26,46 48,36 62,42 C 72,46 66,64 48,66 C 36,68 34,50 44,40 C 56,30 70,44 64,58 C 60,68 40,70 32,56"
              stroke="#070308"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
              fill="none"
            />
            {/* Fine marker loops */}
            <path
              d="M 22,50 C 20,30 45,22 68,26 C 85,30 88,58 75,72 C 60,84 28,82 18,65 C 10,48 24,24 50,18 C 76,14 90,38 86,62 C 82,82 46,90 28,78 C 14,68 18,36 42,24 C 66,14 84,32 82,56 C 80,74 52,80 34,70 C 20,60 26,38 48,32 C 70,26 80,48 72,66 C 64,80 38,82 28,68"
              stroke="#0a050d"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 26,42 C 38,20 66,22 74,38 C 82,52 68,74 46,74 C 28,74 24,54 38,40 C 50,28 72,36 70,54 C 68,68 48,72 38,62"
              stroke="#050207"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 1:
        // Variant 1: Tight energetic center vortex into erratic outer oval loops (Photo 2 top-mid)
        return (
          <>
            <ellipse
              cx="50"
              cy="50"
              rx="24"
              ry="20"
              fill="#060207"
              opacity="0.85"
            />
            <path
              d="M 38,52 C 34,42 44,36 56,38 C 66,40 68,54 58,60 C 46,66 38,54 44,44 C 50,34 64,36 66,48 C 68,58 54,64 42,58 C 32,52 38,38 52,34 C 68,30 76,46 72,60 C 68,72 44,74 34,64 C 24,54 32,32 54,26 C 76,20 86,44 80,66 C 74,84 40,86 26,72 C 14,58 20,28 48,20 C 78,12 92,42 86,70 C 80,92 36,92 20,76"
              stroke="#070308"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 28,46 C 24,30 48,22 68,28 C 84,34 86,60 72,74 C 56,86 32,82 24,66 C 16,50 30,28 56,24 C 80,20 90,48 82,72"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 2:
        // Variant 2: Aggressive diagonal/horizontal zigzag cross-hatch slash (Photo 2 top-right)
        return (
          <>
            <path
              d="M 22,28 L 78,32 M 18,38 L 84,36 M 16,46 L 86,44 M 20,54 L 82,52 M 18,62 L 76,64 M 26,72 L 70,70"
              stroke="#070308"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 18,26 L 82,34 L 16,42 L 86,48 L 18,56 L 84,62 L 24,68 L 74,74 L 20,44 L 80,50 L 16,36 L 82,60"
              stroke="#000000"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 26,22 L 74,38 L 22,50 L 78,60 L 30,76"
              stroke="#0a050d"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 3:
        // Variant 3: Wide elongated horizontal oval scribble loops (Photo 2 mid-left)
        return (
          <>
            <path
              d="M 16,50 C 14,34 44,28 72,32 C 92,36 94,58 78,68 C 58,78 22,78 14,60 C 8,42 40,24 74,26 C 96,28 98,62 76,74 C 50,86 16,80 12,56 C 8,36 42,20 78,22 C 98,24 96,64 74,76 C 46,88 18,74 16,50"
              stroke="#070308"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.92"
            />
            <path
              d="M 24,46 C 24,36 50,32 72,36 C 88,40 86,58 72,64 C 54,70 30,68 24,56 C 20,44 46,38 68,40 C 84,42 82,56 70,60 C 56,64 36,60 30,52"
              stroke="#000000"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 4:
        // Variant 4: Chaotic tangle loops with saturated center knot (Photo 2 mid-center)
        return (
          <>
            <circle cx="50" cy="50" r="22" fill="#050207" opacity="0.9" />
            <path
              d="M 30,46 C 26,30 52,24 68,32 C 82,40 82,64 66,72 C 48,80 30,68 32,48 C 34,30 64,28 72,46 C 78,64 54,76 38,68 C 24,60 30,38 48,34 C 66,30 76,50 68,66 C 60,78 36,78 28,62 C 20,46 38,30 60,30 C 80,30 84,58 72,74 C 58,86 32,80 22,64"
              stroke="#0a050d"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 18,48 C 18,28 42,16 68,22 C 90,28 92,60 76,78 C 58,92 26,88 16,68 C 8,46 28,24 54,18 C 82,12 94,44 86,72"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 5:
        // Variant 5: Slanted elliptical scratch scribble (Photo 2 mid-right)
        return (
          <>
            <path
              d="M 24,56 C 18,38 42,26 66,32 C 84,38 88,60 76,72 C 62,84 34,80 22,64 C 12,46 30,26 56,22 C 80,18 90,44 82,66 C 74,84 44,88 28,74 C 16,60 26,34 50,28 C 74,22 84,48 76,68 C 68,82 40,84 28,70"
              stroke="#060207"
              strokeWidth="4.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 32,48 C 30,36 50,30 68,36 C 80,42 80,58 68,66 C 52,74 34,68 32,54 C 30,42 50,38 64,42 C 76,46 74,60 62,64"
              stroke="#000000"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 6:
        // Variant 6: Tight dense ball of chaotic marker strings (Photo 2 bottom-left)
        return (
          <>
            <ellipse cx="48" cy="52" rx="26" ry="24" fill="#040206" opacity="0.92" />
            <path
              d="M 20,54 C 18,34 42,22 66,24 C 86,26 90,52 80,68 C 68,82 36,86 22,70 C 12,54 22,30 46,22 C 72,14 88,36 84,62 C 80,82 48,88 30,78 C 16,68 18,38 40,26 C 64,16 84,32 82,58 C 80,78 52,82 34,72 C 22,62 26,40 48,32 C 70,24 82,46 74,66 C 66,80 40,80 28,68 C 18,56 26,36 48,30"
              stroke="#070308"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 28,34 L 74,68 M 72,32 L 24,66 M 48,18 L 52,84 M 14,48 L 86,52"
              stroke="#000000"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </>
        );

      case 7:
        // Variant 7: Loose circular scratch loops (Photo 2 bottom-mid)
        return (
          <>
            <path
              d="M 28,50 C 26,34 44,24 64,28 C 80,32 86,52 78,68 C 68,80 44,84 30,72 C 18,60 22,38 42,28 C 64,18 82,34 82,54 C 82,72 60,82 40,76 C 24,70 20,48 36,36 C 52,24 74,34 76,52 C 78,66 62,76 46,72 C 32,68 30,50 44,40 C 58,30 70,44 68,58"
              stroke="#070308"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.94"
            />
            <path
              d="M 36,44 C 36,32 54,30 66,38 C 76,46 72,62 58,66 C 44,70 34,58 38,46 C 42,36 58,36 64,46 C 70,54 62,64 52,62"
              stroke="#000000"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 8:
      default:
        // Variant 8: Heavy saturated dark ink blackout with wild loop escapes (Photo 2 bottom-right)
        return (
          <>
            <path
              d="M 26,44 C 22,30 46,20 68,26 C 88,32 90,58 78,74 C 62,88 28,88 18,70 C 10,52 24,26 50,18 C 78,10 92,38 88,68 C 84,90 42,94 22,78 C 8,64 16,30 46,20 C 74,10 90,34 86,64"
              stroke="#060207"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#060207"
              opacity="0.9"
            />
            <path
              d="M 20,50 C 16,32 44,18 72,24 C 94,30 96,62 78,80 C 58,94 24,90 14,68 C 6,46 28,20 58,16 C 86,12 98,46 88,76 C 78,98 34,96 18,76"
              stroke="#000000"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 12,38 C 24,18 64,14 80,30 C 94,46 86,78 64,88 C 40,96 16,84 12,58"
              stroke="#0a050d"
              strokeWidth="2.4"
              strokeLinecap="round"
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
