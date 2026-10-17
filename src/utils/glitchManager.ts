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
  private currentIntensity: number = 0;

  public start(): void {
    if (typeof window === 'undefined') return;
    // On fresh entry into Black Space (L0), text glitch is at 0 (pristine/clean)
    this.setIntensity(this.currentIntensity);
  }

  public setIntensity(intensity: number): void {
    this.currentIntensity = Math.max(0, Math.min(5, Math.floor(intensity)));

    if (this.currentIntensity === 0) {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return;
    }

    // Interval accelerates dynamically as more doodles are erased:
    // L1: 4200ms (rare subtle twitch)
    // L2: 2800ms
    // L3: 1800ms
    // L4: 1100ms
    // L5: 750ms (furious decay without CPU thrash)
    const intervalMap = [0, 4200, 2800, 1800, 1100, 750];
    const intervalMs = intervalMap[this.currentIntensity];

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.pulseGlitch();
    }, intervalMs);
  }

  private getCandidatePool(): HTMLElement[] {
    if (typeof document === 'undefined') return [];
    const root = document.getElementById('main-content');
    if (!root) return [];

    const candidates: HTMLElement[] = [];
    const elements = root.querySelectorAll<HTMLElement>('p, h1, h2, h3, li, [data-glitch="true"]');

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'BUTTON' ||
        el.closest('button') ||
        el.closest('a') ||
        el.closest('[data-no-glitch="true"]') ||
        el.closest('.scribble-mark')
      ) {
        continue;
      }

      const text = el.textContent?.trim();
      if (text && text.length >= 6 && !this.activeTwitches.has(el)) {
        candidates.push(el);
      }
    }

    return candidates;
  }

  private pulseGlitch(): void {
    const pool = this.getCandidatePool();
    if (pool.length === 0) return;

    // Pick 1-2 targets by testing up to 4 random samples (max 4 getBoundingClientRect calls, 0 layout thrashing)
    const countToPick = this.currentIntensity >= 4 && Math.random() < 0.4 ? 2 : 1;
    const picked: HTMLElement[] = [];

    // Attempt to pick a currently visible element
    const maxTries = Math.min(8, pool.length);
    for (let t = 0; t < maxTries && picked.length < countToPick; t++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!candidate || picked.includes(candidate)) continue;

      const rect = candidate.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100 && rect.height > 0;
      if (isVisible) {
        picked.push(candidate);
      }
    }

    // Fallback if none in viewport sampled
    if (picked.length === 0) {
      picked.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    for (const target of picked) {
      if (target && !this.activeTwitches.has(target)) {
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

    // 35% chance that the glitch STAYS permanently for this Black Space session (capped at 10 to keep DOM lean)
    const shouldStayPermanent = this.pristineContent.size < 10 && Math.random() < 0.35;

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
    this.currentIntensity = 0;
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
