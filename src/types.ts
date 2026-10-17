export type EmotionType = 'NEUTRAL' | 'HAPPY' | 'ECSTATIC' | 'SAD' | 'AFRAID' | 'ANGRY';

export interface LocalizedText {
  en: string;
  id: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: LocalizedText | string;
  date: string;
  location?: string;
  coverImage?: any;
  gallery?: Array<{
    asset?: any;
    caption?: string;
    alt?: string;
    _type?: string;
    [key: string]: any;
  }>;
  imageUrl?: string;
  shortDescription?: LocalizedText | string;
  description: LocalizedText | string;
  techStack: string[];
  links?: {
    demo?: string;
    repo?: string;
    repoMobile?: string;
    repoApi?: string;
    github?: string;
  };
  featured: boolean;
  category?: string;
  // Backward compatibility fields if needed
  tagline?: string;
  year?: string;
  type?: string;
}

export interface SkillItem {
  _id?: string;
  name: string;
  category: 'backend' | 'mobile' | 'database-tools' | 'core' | 'framework' | 'database' | 'tool' | string;
  level?: 'Proficient' | 'Intermediate' | 'Advanced' | string;
  iconId: string;
  order?: number;
}

export interface StatAttribute {
  name: string;
  value: string;
  score: number;
  tag: string;
}

export interface EducationInfo {
  institution: string;
  major: string;
  semester: number;
  gpa: string;
  academicStatus?: LocalizedText | string;
  description?: LocalizedText | string;
}

export interface LanguageProficiency {
  _key?: string;
  name: LocalizedText | string;
  level: LocalizedText | string;
  percentage: number;
}

export interface AuthorContact {
  email?: string;
  github?: string;
  linkedin?: string;
  resumeUrl?: string;
}

export interface AuthorProfile {
  _id?: string;
  name: string;
  nickname?: string;
  title?: string;
  location?: string;
  status?: LocalizedText | string;
  image?: any;
  bio?: string;
  heroBio?: LocalizedText | string;
  whiteSpaceIntro?: string[];
  education?: EducationInfo;
  languages?: LanguageProficiency[];
  specialization?: string;
  contact?: AuthorContact;
}
