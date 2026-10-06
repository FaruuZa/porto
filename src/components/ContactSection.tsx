import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { RedactedText } from './RedactedText';
import { blackSpaceManager, BlackSpaceState } from '../utils/blackSpaceState';
import { Mail, Copy, Check } from 'lucide-react';
import { PlaceholderIcon } from './PlaceholderIcon';
import { useLanguage } from '../utils/languageContext';

interface ContactSectionProps {
  theme?: ThemeMode;
  onNavigateSection?: (sectionId: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  theme = 'dark',
}) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const email = "faza.contact.dev@gmail.com";
  const isBlackSpace = theme === 'black-space';

  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const shouldSpawnAnomalyHere =
    isBlackSpace && puzzleState.spawnLocations.secondaryLocation === 'contact';

  const handleCopy = async () => {
    sound.playSelect();
    
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="contact"
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none pt-12 pb-6 md:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col justify-center my-auto">
        {/* Contact Dialogue Box */}
        <div className="omori-box p-5 sm:p-7 text-center">
          <div data-glitch="true" className="text-[11px] sm:text-xs text-[var(--accent-red)] uppercase font-bold tracking-widest mb-1.5">
            {isBlackSpace
              ? '> DESOLATE REST POINT'
              : lang === 'id'
              ? '> KONTAK // HUBUNGI SAYA'
              : '> CONTACT // GET IN TOUCH'}
          </div>
          <h2 data-glitch="true" className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-main)] leading-snug">
            {isBlackSpace
              ? "Rest Here. You Can Still Wake Up."
              : lang === 'id'
              ? "Mari Terhubung & Berkolaborasi"
              : "Let's Connect & Collaborate"}
          </h2>
          <div className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto font-sans leading-relaxed mb-5">
            {isBlackSpace ? (
              <div className="text-[#fca5a5]/80">
                <span>The basket is empty. The red hands linger in the corners.{' '}</span>
                {shouldSpawnAnomalyHere && (
                  <RedactedText
                    theme={theme}
                    anomalyId="anomaly-contact"
                    originalText="A crumpled letter lies under the checkered cloth."
                    corruptedText="PICNIC_NOTE_#05"
                  />
                )}
              </div>
            ) : (
              lang === 'id'
                ? "Terbuka untuk peluang magang (internship), proyek rekayasa perangkat lunak, maupun diskusi teknis."
                : "Open for internship opportunities, software engineering collaborations, and technical discussions."
            )}
          </div>

          {/* Action Direct Links */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <a
              href="https://github.com/faza"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playTextBlip()}
              className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--text-main)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlaceholderIcon name="github" size={14} />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/faza"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playTextBlip()}
              className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--text-main)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlaceholderIcon name="linkedin" size={14} />
              <span>LinkedIn</span>
            </a>

            <button
              onClick={handleCopy}
              onMouseEnter={() => sound.playTextBlip()}
              className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--accent-red)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? (lang === 'id' ? '[ TERSALIN! ]' : '[ COPIED! ]') : (lang === 'id' ? '[ SALIN EMAIL ]' : '[ COPY EMAIL ]')}</span>
            </button>
          </div>

          {/* Email Display */}
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Mail size={13} className="text-[var(--accent-red)]" />
            <span className="font-mono text-[var(--text-main)] selection:bg-[var(--accent-red)]">
              {email}
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-[10px] text-[var(--text-muted)] font-mono">
          <span>&copy; {new Date().getFullYear()} FAZA // SOFTWARE CRAFTSMANSHIP</span>
          <span className="mx-2">•</span>
          <span>POLITEKNIK NEGERI JEMBER</span>
        </div>
      </div>
    </section>
  );
};
