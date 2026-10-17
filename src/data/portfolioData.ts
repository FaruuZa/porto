import { SkillItem, StatAttribute } from '../types';
import { PROJECTS_DATA } from './projectsData';

export const HERO_DATA = {
  fullName: "Ahmad Abdillah Faza",
  name: "Ahmad Abdillah Faza",
  nickname: "Faza",
  title: "Software Engineer & IT Student",
  subTitle: "D4 Teknik Informatika — Politeknik Negeri Jember (Semester 5)",
  ipk: "3.72",
  englishLevel: "CEFR B1 (Intermediate)",
  statusText: "Open for Learning & Internship Opportunities",
  whiteSpaceIntro: [
    "Welcome to White Space.",
    "A quiet domain where coursework, curiosity, and unfinished prototypes intertwine.",
    "You have been experimenting here for as long as you can remember..."
  ]
};

export const PROJECTS = PROJECTS_DATA;

export const SKILLS: SkillItem[] = [
  {
    name: "Laravel",
    category: "backend",
    iconId: "laravel",
    order: 1
  },
  {
    name: "Java",
    category: "backend",
    iconId: "java",
    order: 2
  },
  {
    name: "Kotlin",
    category: "backend",
    iconId: "kotlin",
    order: 3
  },
  {
    name: "PHP",
    category: "backend",
    iconId: "php",
    order: 4
  },
  {
    name: "Flutter",
    category: "mobile",
    iconId: "flutter",
    order: 1
  },
  {
    name: "JavaScript",
    category: "mobile",
    iconId: "code",
    order: 2
  },
  {
    name: "PostgreSQL",
    category: "database-tools",
    iconId: "postgres",
    order: 1
  },
  {
    name: "MySQL",
    category: "database-tools",
    iconId: "mysql",
    order: 2
  },
  {
    name: "Git & GitHub",
    category: "database-tools",
    iconId: "git",
    order: 3
  }
];

export const CHARACTER_STATS: StatAttribute[] = [
  { name: "Academic GPA", value: "3.72 / 4.00", score: 93, tag: "Semester 5 • Polije D4 TI" },
  { name: "Software Engineering", value: "Student", score: 88, tag: "Practical Systems & DB Design" },
  { name: "Full-Stack Adaptability", value: "High", score: 85, tag: "Web & Mobile Exploration" },
  { name: "Teamwork & Git", value: "Cooperative", score: 85, tag: "Collaborative Projects" },
  { name: "English Proficiency", value: "CEFR B1 Intermediate", score: 70, tag: "Technical Documentation" }
];
