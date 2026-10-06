import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { blackSpaceManager } from '../utils/blackSpaceState';
import { ThemeMode } from '../App';

interface RedactedTextProps {
  theme: ThemeMode;
  anomalyId?: string;
  originalText: string;
  corruptedText?: string;
  className?: string;
}

export const RedactedText: React.FC<RedactedTextProps> = ({
  theme,
  anomalyId,
  originalText,
  corruptedText,
  className = '',
}) => {
  const isBlackSpace = theme === 'black-space';
  const [isUncovered, setIsUncovered] = useState(false);

  // Check if this anomaly was already uncovered in this session
  useEffect(() => {
    if (anomalyId && blackSpaceManager.hasFound(anomalyId)) {
      setIsUncovered(true);
    } else if (!isBlackSpace) {
      setIsUncovered(false);
    }
  }, [anomalyId, isBlackSpace]);

  if (!isBlackSpace) {
    return <span className={className}>{originalText}</span>;
  }

  const handleCut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUncovered) {
      sound.playHit();
      setIsUncovered(true);
      if (anomalyId) {
        blackSpaceManager.uncoverAnomaly(anomalyId);
      }
    }
  };

  if (isUncovered) {
    return (
      <span
        className={`line-through decoration-[#ff0033] decoration-2 text-[#8b0000] font-bold px-0.5 select-none transition-colors ${className}`}
      >
        {corruptedText || originalText}
      </span>
    );
  }

  return (
    <span
      onClick={handleCut}
      onMouseEnter={() => sound.playTextBlip()}
      className={`inline-block align-middle cursor-pointer bg-[#000000] text-transparent hover:text-[#ff0033] border border-[#5c111a] px-2 py-0.5 mx-0.5 rounded-[1px] select-none transition-transform hover:scale-105 active:scale-95 group relative ${className}`}
      title="[???]"
    >
      {/* Blackout censor block with knife hover reaction */}
      <span className="font-mono tracking-widest text-[#150206] group-hover:text-[#ff0033] text-xs">
        ████████
      </span>
    </span>
  );
};
