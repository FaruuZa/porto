// Multi-Section Black Space Scribble & Easter Egg Puzzle Manager
// Oversees the 3 randomized hidden scribbles, session state, and wake-up availability

export type BlackSpaceSection = 'hero' | 'projects' | 'skills' | 'profile' | 'contact';

export interface ScribbleLocation {
  section: BlackSpaceSection;
  slotIndex: number; // 0, 1, or 2 (subtle layout slot variation)
  variant: 0 | 1 | 2 | 3 | 4; // Hand-drawn SVG vandalism doodle variation
  id: string;
}

export interface BlackSpaceState {
  isActive: boolean;
  totalRequired: number; // Exactly 5 scribbles required
  foundCount: number;
  foundScribbleIds: string[];
  canWakeUp: boolean;
  scribbles: ScribbleLocation[];
}

const ALL_SECTIONS: BlackSpaceSection[] = ['hero', 'projects', 'skills', 'profile', 'contact'];

class BlackSpaceManager {
  private isActive: boolean = false;
  private foundScribbleIds: Set<string> = new Set();
  private readonly totalRequired: number = 5;
  private scribbles: ScribbleLocation[] = [];
  private listeners: Set<(state: BlackSpaceState) => void> = new Set();

  public subscribe(listener: (state: BlackSpaceState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState(): BlackSpaceState {
    return {
      isActive: this.isActive,
      totalRequired: this.totalRequired,
      foundCount: this.foundScribbleIds.size,
      foundScribbleIds: Array.from(this.foundScribbleIds),
      canWakeUp: this.foundScribbleIds.size >= this.totalRequired,
      scribbles: this.scribbles,
    };
  }

  /**
   * Called when entering Black Space via the hanging bulb:
   * Populates all 5 sections (hero, projects, skills, profile, contact) with exactly
   * 1 hidden vandalism scribble each at randomized slot positions (0, 1, or 2).
   */
  public enterBlackSpace(): void {
    this.isActive = true;
    this.foundScribbleIds.clear();

    const sessionTimestamp = Date.now();

    this.scribbles = ALL_SECTIONS.map((sec, idx) => ({
      section: sec,
      slotIndex: Math.floor(Math.random() * 3), // 0, 1, or 2 within that section
      variant: (idx % 5) as 0 | 1 | 2 | 3 | 4,
      id: `scribble-${sec}-${sessionTimestamp}-${idx}`,
    }));

    this.notify();
  }

  /**
   * Called when the user clicks a hidden scribble:
   * Silently records the discovery without exposing counter/toast text.
   * On the 3rd discovery, enables the "Wake up" button.
   */
  public collectScribble(scribbleId: string): boolean {
    if (this.foundScribbleIds.has(scribbleId)) return false;
    this.foundScribbleIds.add(scribbleId);
    this.notify();
    return true;
  }

  public hasFound(scribbleId: string): boolean {
    return this.foundScribbleIds.has(scribbleId);
  }

  public getScribbleForSection(section: BlackSpaceSection): ScribbleLocation | undefined {
    return this.scribbles.find((s) => s.section === section);
  }

  /**
   * Called upon successfully waking up to White Space
   */
  public exitBlackSpace(): void {
    this.isActive = false;
    this.foundScribbleIds.clear();
    this.scribbles = [];
    this.notify();
  }

  public wakeUp(): void {
    this.exitBlackSpace();
  }
}

export const blackSpaceManager = new BlackSpaceManager();
