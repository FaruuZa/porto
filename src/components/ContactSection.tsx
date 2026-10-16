import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../utils/audio';
import { ThemeMode } from '../App';
import { blackSpaceManager, BlackSpaceState, ScribbleLocation } from '../utils/blackSpaceState';
import { Mail, Copy, Check } from 'lucide-react';
import { PlaceholderIcon } from './PlaceholderIcon';
import { useLanguage } from '../utils/languageContext';
import { BlackScribble } from './BlackScribble';
import { useSanityProfile } from '../sanity/useSanityProfile';

interface ContactSectionProps {
  theme?: ThemeMode;
  onNavigateSection?: (sectionId: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  theme = 'light',
}) => {
  const { lang } = useLanguage();
  const { profile } = useSanityProfile();
  const [copied, setCopied] = useState(false);
  const email = profile.contact?.email?.trim() || "";
  const githubUrl = profile.contact?.github?.trim() && profile.contact.github.trim() !== '#' ? profile.contact.github.trim() : "";
  const linkedinUrl = profile.contact?.linkedin?.trim() && profile.contact.linkedin.trim() !== '#' ? profile.contact.linkedin.trim() : "";
  const isBlackSpace = theme === 'black-space';

  const [puzzleState, setPuzzleState] = useState<BlackSpaceState>(() =>
    blackSpaceManager.getState()
  );

  useEffect(() => {
    const unsub = blackSpaceManager.subscribe((state) => setPuzzleState(state));
    return () => unsub();
  }, []);

  const contactScribble: ScribbleLocation | undefined = useMemo(() => {
    if (!isBlackSpace) return undefined;
    return puzzleState.scribbles.find((s) => s.section === 'contact');
  }, [isBlackSpace, puzzleState.scribbles]);

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
      className="h-[100dvh] md:h-screen w-full flex flex-col justify-start sm:justify-center items-center overflow-y-auto md:overflow-hidden px-4 sm:px-6 font-mono select-none pt-18 pb-16 sm:py-0"
    >
      <div className="w-full max-w-3xl flex flex-col justify-center my-auto relative">
        {/* Contact Dialogue Box */}
        <div className="omori-box p-5 sm:p-7 text-center relative">
          
          {/* Slot 0: Top right corner inside dialogue box */}
          {contactScribble && contactScribble.slotIndex === 0 && (
            <div className="absolute top-3 right-3 z-10">
              <BlackScribble scribble={contactScribble} />
            </div>
          )}

          <div data-no-glitch="true" className="text-[11px] sm:text-xs text-[var(--accent-red)] uppercase font-bold tracking-widest mb-1.5">
            {isBlackSpace
              ? '> DESOLATE REST POINT'
              : lang === 'id'
              ? '> KONTAK // HUBUNGI SAYA'
              : '> CONTACT // GET IN TOUCH'}
          </div>
          <h2 data-no-glitch="true" className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-main)] leading-snug">
            {isBlackSpace
              ? "Rest Here. You Can Still Wake Up."
              : lang === 'id'
              ? "Mari Terhubung & Berkolaborasi"
              : "Let's Connect & Collaborate"}
          </h2>
          <div className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto font-sans leading-relaxed mb-5">
            {isBlackSpace ? (
              <span className="text-[var(--text-muted)] italic">
                {lang === 'id'
                  ? 'Titik istirahat sunyi di tepi kehampaan.'
                  : 'A desolate rest stop at the edge of the void.'}
              </span>
            ) : (
              lang === 'id'
                ? "Terbuka untuk peluang magang (internship), proyek rekayasa perangkat lunak, maupun diskusi teknis."
                : "Open for internship opportunities, software engineering projects, and technical discussions."
            )}
          </div>

          {/* Action Direct Links */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4 relative">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playTextBlip()}
                className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--text-main)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlaceholderIcon name="github" size={14} />
                <span>GitHub</span>
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playTextBlip()}
                className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--text-main)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlaceholderIcon name="linkedin" size={14} />
                <span>LinkedIn</span>
              </a>
            )}

            {email && (
              <button
                onClick={handleCopy}
                onMouseEnter={() => sound.playTextBlip()}
                className="px-4 py-2.5 sketch-border bg-[var(--paper-color)] hover:border-[var(--accent-red)] text-[var(--text-main)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? (lang === 'id' ? '[ TERSALIN! ]' : '[ COPIED! ]') : (lang === 'id' ? '[ SALIN EMAIL ]' : '[ COPY EMAIL ]')}</span>
              </button>
            )}

            {/* Slot 1: Beside action links */}
            {contactScribble && contactScribble.slotIndex === 1 && (
              <div className="inline-flex items-center ml-1">
                <BlackScribble scribble={contactScribble} />
              </div>
            )}
          </div>

          {/* Email Display */}
          {email && (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
              <Mail size={13} className="text-[var(--accent-red)]" />
              <span className="font-mono text-[var(--text-main)] selection:bg-[var(--accent-red)]">
                {email}
              </span>

              {/* Slot 2: Beside email line */}
              {contactScribble && contactScribble.slotIndex === 2 && (
                <BlackScribble scribble={contactScribble} className="ml-2" />
              )}
            </div>
          )}

          {!email && contactScribble && contactScribble.slotIndex === 2 && (
            <div className="mt-2 flex justify-center">
              <BlackScribble scribble={contactScribble} />
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-[10px] text-[var(--text-muted)] font-mono">
          <span>&copy; {new Date().getFullYear()} {(profile.nickname || profile.name || 'FAZA').toUpperCase()} // SOFTWARE CRAFTSMANSHIP</span>
          <span className="mx-2">•</span>
          <span>{(profile.education?.institution || 'POLITEKNIK NEGERI JEMBER').toUpperCase()}</span>
        </div>
      </div>
    </section>
  );
};
