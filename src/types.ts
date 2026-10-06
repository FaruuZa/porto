export type EmotionType = 'NEUTRAL' | 'HAPPY' | 'ECSTATIC' | 'SAD' | 'AFRAID' | 'ANGRY';

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  type: string;
  category?: string;
  description: string;
  techStack: string[];
  features: string[];
  stats: { label: string; value: string }[];
  quote?: string;
  flavorQuote?: string;
  links?: {
    demo?: string;
    github?: string;
    docs?: string;
  };
  featured?: boolean;
}

export interface SkillItem {
  name: string;
  category: 'core' | 'framework' | 'database' | 'tool';
  level: 'Proficient' | 'Intermediate' | 'Advanced';
  iconId: string;
}

export interface StatAttribute {
  name: string;
  value: string;
  score: number;
  tag: string;
}
