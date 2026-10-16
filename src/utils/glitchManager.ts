// Atmospheric Psychological Glitch Engine for Omori Black Space Mode
// Granular character-level corruption: tints ONLY the specific corrupted symbol/word, never the entire paragraph.
// Prioritizes visible elements on screen so the distortion is tangibly felt.
// Includes a 35% chance for glitched characters to STAY permanently corrupted until Wake Up.

const CORRUPTION_GLYPHS = ['?', 'X', '_', '0', '~', '§', 'Ø', '#', '1', '!', '%', '█'];

interface ActiveTwitch {
  preTwitchHtml: string;
  timeoutId: number;
}

class GlitchManager {
  private intervalId: number | null = null;
  private pristineContent = new Map<HTMLElement, string>();
  private activeTwitches = new Map<HTMLElement, ActiveTwitch>();

  public start(): void {
    if (typeof window === 'undefined') return;
    if (this.intervalId !== null) return;

    // Atmospheric pulse: glitches trigger every 450ms on visible text
    this.intervalId = window.setInterval(() => {
      this.pulseGlitch();
    }, 450);
  }

  private getCandidateElements(): HTMLElement[] {
    if (typeof document === 'undefined') return [];

    const candidates: HTMLElement[] = [];
    const elements = document.querySelectorAll<HTMLElement>(
      'p, span, h1, h2, h3, li, strong, kbd, [data-glitch]'
    );

    elements.forEach((el) => {
      // Exclude interactive elements and non-content areas
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'BUTTON' ||
        el.closest('button') ||
        el.closest('a') ||
        el.closest('svg') ||
        el.closest('[data-no-glitch]') ||
        el.closest('.scribble-mark') ||
        el.closest('.wake-up-overlay') ||
        el.closest('nav')
      ) {
        return;
      }

      // Exclude containers with structural children so we only corrupt leaf content
      const nonGlitchChildren = Array.from(el.children).filter(
        (child) =>
          !child.classList.contains('glitch-char-corrupt') &&
          !child.classList.contains('glitch-char-permanent')
      );
      if (nonGlitchChildren.length > 0) {
        return;
      }

      // Check if element has sufficient text content
      const text = el.textContent?.trim();
      if (text && text.length >= 6) {
        // Exclude elements currently undergoing a temporary twitch
        if (!this.activeTwitches.has(el)) {
          candidates.push(el);
        }
      }
    });

    return candidates;
  }

  private pulseGlitch(): void {
    const allCandidates = this.getCandidateElements();
    if (allCandidates.length === 0) return;

    // Prioritize visible elements currently within viewport
    const visibleCandidates = allCandidates.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0 && rect.height > 0;
    });

    const candidatePool = visibleCandidates.length > 0 ? visibleCandidates : allCandidates;

    // Corrupt 1-2 elements per pulse for noticeable yet eerie decay
    const countToGlitch = Math.min(candidatePool.length, Math.random() < 0.4 ? 2 : 1);
    const selected = new Set<HTMLElement>();

    for (let c = 0; c < countToGlitch; c++) {
      const target = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      if (target && !selected.has(target) && !this.activeTwitches.has(target)) {
        selected.add(target);
        this.corruptElement(target);
      }
    }
  }

  private corruptElement(target: HTMLElement): void {
    // Record original pristine content on first contact so Wake Up restores it completely
    if (!this.pristineContent.has(target)) {
      this.pristineContent.set(target, target.innerHTML);
    }

    const currentText = target.textContent || '';
    const words = currentText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    // Pick 1 eligible word with length >= 3
    const eligibleIndices: number[] = [];
    words.forEach((w, idx) => {
      const glyphCount = w.split('').filter((ch) => CORRUPTION_GLYPHS.includes(ch)).length;
      if (w.length >= 3 && glyphCount < w.length * 0.6) {
        eligibleIndices.push(idx);
      }
    });

    if (eligibleIndices.length === 0) return;
    const targetWordIdx = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    const originalWord = words[targetWordIdx];
    if (!originalWord) return;

    // Mutate 1-2 characters in the word into glitch glyphs
    const chars = originalWord.split('');
    const mutateIdx = Math.floor(Math.random() * chars.length);
    chars[mutateIdx] = CORRUPTION_GLYPHS[Math.floor(Math.random() * CORRUPTION_GLYPHS.length)];

    if (chars.length > 4 && Math.random() < 0.6) {
      const secondIdx = (mutateIdx + 1) % chars.length;
      chars[secondIdx] = CORRUPTION_GLYPHS[Math.floor(Math.random() * CORRUPTION_GLYPHS.length)];
    }

    // 35% chance that the glitch STAYS permanently for this Black Space session!
    const shouldStayPermanent = Math.random() < 0.35;

    const corruptedSpan = shouldStayPermanent
      ? `<span class="glitch-char-permanent">${chars.join('')}</span>`
      : `<span class="glitch-char-corrupt">${chars.join('')}</span>`;

    const preTwitchHtml = target.innerHTML;

    // Replace ONLY that specific word with the styled corrupted span (never entire paragraph)
    const newWords = [...words];
    newWords[targetWordIdx] = corruptedSpan;
    target.innerHTML = newWords.join(' ');

    if (!shouldStayPermanent) {
      // Temporary twitch: heals after 380ms
      const timeoutId = window.setTimeout(() => {
        if (this.activeTwitches.has(target)) {
          target.innerHTML = preTwitchHtml;
          this.activeTwitches.delete(target);
        }
      }, 380);

      this.activeTwitches.set(target, {
        preTwitchHtml,
        timeoutId,
      });
    }
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Cancel all pending temporary twitches
    this.activeTwitches.forEach((twitch) => {
      clearTimeout(twitch.timeoutId);
    });
    this.activeTwitches.clear();

    // Instantly restore all permanently and temporarily glitched elements back to pristine HTML
    this.pristineContent.forEach((originalHtml, el) => {
      el.innerHTML = originalHtml;
    });
    this.pristineContent.clear();
  }
}

export const glitchManager = new GlitchManager();
