// Psychological Horror Text Infection Engine for Omori Black Space Mode
// Infects normal text across the entire page (paragraphs, headings, cards, spans)
// Corrupts at least 1 FULL word per infected node (full symbol scramble or horror word injection)
// High frequency ripple with zero layout distortion (exact word lengths preserved).

const HORROR_GLYPHS = [
  '!', '@', '#', '$', '%', '&', '*', '?', '/',
  'X', '0', '1', 'Ø', '§', '†', '‡', '¿',
  '█', '░', '▒', '▓'
];

const HORROR_WORDS_EN = [
  'WATCHING', 'SOMETHING', 'COLD', 'SHADOW', 'ROTTEN',
  'FLESH', 'GUILT', 'ALONE', 'LIAR', 'STATIC', 'SILENCE',
  'DROWN', 'SINK', 'FORGET', 'VOID', 'BEHIND', 'DARK'
];

const HORROR_WORDS_ID = [
  'MELIHAT', 'SESUATU', 'DINGIN', 'BAYANGAN', 'SENDIRI',
  'BOHONG', 'HILANG', 'GELAP', 'TAKUT', 'BUNGKAM', 'LENYAP'
];

interface ActiveInfection {
  originalText: string;
  timeoutId: number;
}

class GlitchManager {
  private intervalId: number | null = null;
  private activeInfections = new Map<HTMLElement, ActiveInfection>();

  public start(): void {
    if (typeof window === 'undefined') return;
    if (this.intervalId !== null) return;

    // Accelerated frequency: pulse infection every 130ms
    this.intervalId = window.setInterval(() => {
      this.infectRandomNodes();
    }, 130);
  }

  private getCandidateElements(): HTMLElement[] {
    if (typeof document === 'undefined') return [];

    const candidates: HTMLElement[] = [];
    const elements = document.querySelectorAll<HTMLElement>(
      'p, h1, h2, h3, h4, span, li, a, [data-glitch]'
    );

    elements.forEach((el) => {
      // Exclude interactive elements that shouldn't be disrupted (inputs, buttons with icons, redacted targets)
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'BUTTON' ||
        el.closest('button') ||
        el.closest('svg') ||
        el.closest('[data-no-glitch]') ||
        el.classList.contains('redacted-block')
      ) {
        return;
      }

      // Check if element has direct text content (leaf text container)
      const text = el.textContent?.trim();
      if (text && text.length >= 3 && el.children.length === 0) {
        if (!this.activeInfections.has(el)) {
          candidates.push(el);
        }
      }
    });

    return candidates;
  }

  private infectRandomNodes(): void {
    const candidates = this.getCandidateElements();
    if (candidates.length === 0) return;

    // Infect 3 to 6 random elements simultaneously across the page
    const countToInfect = Math.min(candidates.length, Math.floor(Math.random() * 4) + 3);

    for (let c = 0; c < countToInfect; c++) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      if (!target || this.activeInfections.has(target)) continue;

      const originalText = target.textContent || '';
      if (originalText.trim().length < 3) continue;

      const words = originalText.split(' ');
      if (words.length === 0) continue;

      // Select 1 random word (at least 2 letters) in the sentence to corrupt
      const eligibleWordIndices: number[] = [];
      words.forEach((w, idx) => {
        if (w.trim().length >= 2) eligibleWordIndices.push(idx);
      });

      if (eligibleWordIndices.length === 0) continue;
      const targetWordIdx = eligibleWordIndices[Math.floor(Math.random() * eligibleWordIndices.length)];
      const originalWord = words[targetWordIdx];
      if (!originalWord) continue;

      let corruptedWord = '';

      // 30% chance to inject an uncanny psychological horror word
      const shouldInjectHorrorWord = Math.random() < 0.30;

      if (shouldInjectHorrorWord) {
        const pool = Math.random() < 0.5 ? HORROR_WORDS_EN : HORROR_WORDS_ID;
        const horrorCandidate = pool[Math.floor(Math.random() * pool.length)];

        // Mutate 1-2 letters inside the horror word with symbols
        corruptedWord = horrorCandidate
          .split('')
          .map((ch, i) => {
            if (i === 1 || i === Math.floor(horrorCandidate.length / 2)) {
              return HORROR_GLYPHS[Math.floor(Math.random() * HORROR_GLYPHS.length)];
            }
            return ch;
          })
          .join('');
      } else {
        // Corrupt at least 1 FULL word into glitch symbols (preserving punctuation and length)
        corruptedWord = originalWord
          .split('')
          .map((ch, idx) => {
            // Keep common punctuation at boundaries
            if (ch === '.' || ch === ',' || ch === ':' || ch === '-' || ch === '"' || ch === "'") {
              return ch;
            }
            // Retain the first letter 20% of the time, otherwise replace entire word with symbols
            if (idx === 0 && Math.random() < 0.2) {
              return ch;
            }
            return HORROR_GLYPHS[Math.floor(Math.random() * HORROR_GLYPHS.length)];
          })
          .join('');
      }

      // Replace that full word in the sentence
      words[targetWordIdx] = corruptedWord;
      target.textContent = words.join(' ');
      target.classList.add('glitch-horror-corrupt');

      // Infection duration: stays infected for 400ms to 800ms, then heals smoothly
      const infectionDuration = 400 + Math.random() * 400;

      const timeoutId = window.setTimeout(() => {
        if (this.activeInfections.has(target)) {
          target.textContent = originalText;
          target.classList.remove('glitch-horror-corrupt');
          this.activeInfections.delete(target);
        }
      }, infectionDuration);

      this.activeInfections.set(target, {
        originalText,
        timeoutId,
      });
    }
  }

  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Instantly restore all infected elements back to pristine text
    this.activeInfections.forEach((infection, el) => {
      clearTimeout(infection.timeoutId);
      el.textContent = infection.originalText;
      el.classList.remove('glitch-horror-corrupt');
    });
    this.activeInfections.clear();
  }
}

export const glitchManager = new GlitchManager();
