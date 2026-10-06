// Persistent Multi-Page Black Space Anomaly and Puzzle Manager
// Keeps progress intact across landing page and /projects navigation

export interface BlackSpaceSpawnLocations {
  homeSection: 'hero' | 'skills' | 'profile';
  projectCardIndex: number; // 0, 1, or 2 on /projects
  secondaryLocation: 'hero' | 'projects' | 'contact';
}

export interface BlackSpaceState {
  isActive: boolean;
  totalRequired: number;
  foundAnomalies: string[];
  canWakeUp: boolean;
  spawnLocations: BlackSpaceSpawnLocations;
}

class BlackSpaceManager {
  private isActive: boolean = false;
  private foundAnomalies: Set<string> = new Set();
  private totalRequired: number = 3;
  private spawnLocations: BlackSpaceSpawnLocations = {
    homeSection: 'hero',
    projectCardIndex: 1,
    secondaryLocation: 'contact',
  };
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
      foundAnomalies: Array.from(this.foundAnomalies),
      canWakeUp: this.foundAnomalies.size >= this.totalRequired,
      spawnLocations: this.spawnLocations,
    };
  }

  /**
   * Called when entering Black Space:
   * Sets up new randomized spawn locations across landing page and /projects.
   * Progress begins fresh for this Black Space run.
   */
  public enterBlackSpace(): void {
    this.isActive = true;
    this.foundAnomalies.clear();

    const homeSections: Array<'hero' | 'skills' | 'profile'> = ['hero', 'skills', 'profile'];
    const secondarySections: Array<'hero' | 'projects' | 'contact'> = ['hero', 'projects', 'contact'];

    this.spawnLocations = {
      homeSection: homeSections[Math.floor(Math.random() * homeSections.length)],
      projectCardIndex: Math.floor(Math.random() * 3), // random card 0, 1, or 2
      secondaryLocation: secondarySections[Math.floor(Math.random() * secondarySections.length)],
    };

    this.notify();
  }

  /**
   * Called when uncovering an anomaly in any page:
   * Persists progress so traveling between / and /projects retains the score!
   */
  public uncoverAnomaly(anomalyId: string): boolean {
    if (this.foundAnomalies.has(anomalyId)) return false;
    this.foundAnomalies.add(anomalyId);
    this.notify();
    return true;
  }

  public hasFound(anomalyId: string): boolean {
    return this.foundAnomalies.has(anomalyId);
  }

  /**
   * Called upon successfully waking up to White Space
   */
  public exitBlackSpace(): void {
    this.isActive = false;
    this.foundAnomalies.clear();
    this.notify();
  }

  public wakeUp(): void {
    this.exitBlackSpace();
  }
}

export const blackSpaceManager = new BlackSpaceManager();
