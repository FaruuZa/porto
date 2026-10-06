import React from 'react';

export interface PlaceholderIconProps {
  name: string;
  size?: number;
  className?: string;
  label?: string;
  showTextLabel?: boolean;
}

/**
 * PlaceholderIcon component:
 * Designed to avoid generic emojis and allow the user to easily substitute
 * with their custom Omori pixel sprites or SVG icons later.
 * 
 * To replace an icon later, you can add sprite paths in this component or
 * replace with: <img src={`/assets/icons/${name}.png`} alt={name} />
 */
export const PlaceholderIcon: React.FC<PlaceholderIconProps> = ({
  name,
  size = 20,
  className = '',
  label,
  showTextLabel = false,
}) => {
  // Geometric indie/retro SVG representations for tech stacks & game UI
  const renderSvgShape = () => {
    switch (name.toLowerCase()) {
      case 'laravel':
      case 'php':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        );
      case 'flutter':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M14 2L4 12l5 5 11-11H14z" />
            <path d="M14 12l-5 5 5 5h6l-8-8 8-8" />
          </svg>
        );
      case 'kotlin':
      case 'java':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <rect x="3" y="3" width="18" height="18" />
            <line x1="3" y1="21" x2="21" y2="3" />
            <line x1="3" y1="12" x2="12" y2="3" />
          </svg>
        );
      case 'database':
      case 'postgres':
      case 'postgresql':
      case 'mysql':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        );
      case 'terminal':
      case 'code':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        );
      case 'git':
      case 'github':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
            <path d="M12 12v3" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      case 'heart':
      case 'hp':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      case 'lightbulb':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2v1" />
            <path d="M12 7a5 5 0 0 0-5 5c0 2 1 3.5 2 4.5h6c1-1 2-2.5 2-4.5a5 5 0 0 0-5-5z" />
          </svg>
        );
      case 'key':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <circle cx="7.5" cy="15.5" r="4.5" />
            <path d="M11 12l9-9" />
            <path d="M16 3l4 4" />
            <path d="M13 6l2 2" />
          </svg>
        );
      case 'sword':
      case 'blade':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <polyline points="14.5 17.5 3 6 6 3 17.5 14.5" />
            <line x1="13" y1="19" x2="19" y2="13" />
            <line x1="16" y1="16" x2="20" y2="20" />
            <line x1="19" y1="21" x2="21" y2="19" />
          </svg>
        );
      case 'tear':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        );
      default:
        // Clean indie placeholder bracket
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" strokeDasharray="3 3" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        );
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle ${className}`} title={`[ICON: ${name}]`}>
      <span className="shrink-0 flex items-center justify-center">
        {renderSvgShape()}
      </span>
      {showTextLabel && (
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">
          [{label || name}]
        </span>
      )}
    </span>
  );
};
