import { useState, useEffect } from 'react';
import { client } from './client';
import { AUTHOR_PROFILE_QUERY, SKILLS_QUERY } from './queries';
import { SKILLS as FALLBACK_SKILLS } from '../data/portfolioData';
import type { AuthorProfile, SkillItem } from '../types';

export const DEFAULT_AUTHOR_PROFILE: AuthorProfile = {
  name: "Ahmad Abdillah Faza",
  nickname: "Faza",
  title: "Software Engineer & IT Student",
  location: "Jember, ID",
  status: {
    id: "Terbuka untuk Magang",
    en: "Open for Internship",
  },
  heroBio: {
    id: "Halo! Saya Ahmad Abdillah Faza, mahasiswa Teknologi Informasi semester 5 di Politeknik Negeri Jember. Fokus utama saya pada rekayasa perangkat lunak, sistem basis data relasional, dan pengembangan web & mobile terintegrasi. Terbiasa merancang solusi perangkat lunak dari arsitektur backend yang kokoh hingga antarmuka sistem yang bersih.",
    en: "Hello! I am Ahmad Abdillah Faza, a 5th-semester Information Technology student at Politeknik Negeri Jember. Focusing on practical software engineering, relational database architecture, and integrated web & mobile systems. Building solid, dependable software from scalable backend logic to clean responsive interfaces.",
  },
  whiteSpaceIntro: [
    "Welcome to White Space.",
    "A quiet domain where coursework, curiosity, and unfinished prototypes intertwine.",
    "You have been experimenting here for as long as you can remember...",
  ],
  education: {
    institution: "Politeknik Negeri Jember",
    major: "D4 Teknik Informatika",
    semester: 5,
    gpa: "3.72",
    academicStatus: {
      id: "IPK 3.72 (Aktif)",
      en: "GPA 3.72 (Active)",
    },
    description: {
      id: "Mempelajari dasar rekayasa perangkat lunak, basis data, dan pengembangan web & mobile, sembari mengeksplorasi eksperimen mandiri.",
      en: "Studying core software engineering, databases, and web & mobile development, while exploring personal creative experiments.",
    },
  },
  languages: [
    {
      _key: "lang-id",
      name: { id: "Bahasa Indonesia", en: "Indonesian" },
      level: { id: "Penutur Asli (Native)", en: "Native" },
      percentage: 100,
    },
    {
      _key: "lang-en",
      name: { id: "Bahasa Inggris", en: "English" },
      level: { id: "CEFR B1 (Intermediate)", en: "CEFR B1 (Intermediate)" },
      percentage: 70,
    },
  ],
  specialization: "Backend Systems & Database Engineering",
  contact: {
    email: "faza.contact.dev@gmail.com",
    github: "https://github.com/faza",
    linkedin: "https://linkedin.com/in/faza",
    resumeUrl: "",
  },
};

let cachedProfile: AuthorProfile | null = null;
let cachedSkills: SkillItem[] | null = null;
let profileFetchPromise: Promise<{ profile: AuthorProfile; skills: SkillItem[] }> | null = null;

function fetchProfileAndSkills() {
  if (profileFetchPromise) return profileFetchPromise;

  profileFetchPromise = Promise.all([
    client.fetch<any>(AUTHOR_PROFILE_QUERY),
    client.fetch<any[]>(SKILLS_QUERY),
  ])
    .then(([authorData, skillsData]) => {
      // Normalize author profile with fallback defaults
      let resolvedProfile = DEFAULT_AUTHOR_PROFILE;
      if (authorData && typeof authorData === 'object') {
        resolvedProfile = {
          ...DEFAULT_AUTHOR_PROFILE,
          ...authorData,
          education: {
            ...DEFAULT_AUTHOR_PROFILE.education!,
            ...(authorData.education || {}),
          },
          contact: {
            ...DEFAULT_AUTHOR_PROFILE.contact!,
            ...(authorData.contact || {}),
          },
          status: authorData.status || DEFAULT_AUTHOR_PROFILE.status,
          heroBio: authorData.heroBio || DEFAULT_AUTHOR_PROFILE.heroBio,
          languages: Array.isArray(authorData.languages) && authorData.languages.length > 0
            ? authorData.languages
            : DEFAULT_AUTHOR_PROFILE.languages,
          whiteSpaceIntro: Array.isArray(authorData.whiteSpaceIntro) && authorData.whiteSpaceIntro.length > 0
            ? authorData.whiteSpaceIntro
            : DEFAULT_AUTHOR_PROFILE.whiteSpaceIntro,
        };
      }

      // Normalize skills
      let resolvedSkills = FALLBACK_SKILLS;
      if (Array.isArray(skillsData) && skillsData.length > 0) {
        resolvedSkills = skillsData.map((item) => ({
          _id: item._id,
          name: item.name,
          category: item.category || 'core',
          level: item.level || 'Proficient',
          iconId: item.iconId || 'code',
          order: item.order ?? 10,
        }));
      }

      cachedProfile = resolvedProfile;
      cachedSkills = resolvedSkills;
      return { profile: resolvedProfile, skills: resolvedSkills };
    })
    .catch((err) => {
      console.warn('Sanity profile/skills fetch fallback to static data:', err);
      cachedProfile = DEFAULT_AUTHOR_PROFILE;
      cachedSkills = FALLBACK_SKILLS;
      return { profile: DEFAULT_AUTHOR_PROFILE, skills: FALLBACK_SKILLS };
    });

  return profileFetchPromise;
}

export function useSanityProfile() {
  const [profile, setProfile] = useState<AuthorProfile>(() => cachedProfile || DEFAULT_AUTHOR_PROFILE);
  const [skills, setSkills] = useState<SkillItem[]>(() => cachedSkills || FALLBACK_SKILLS);
  const [loading, setLoading] = useState<boolean>(() => !cachedProfile);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (cachedProfile && cachedSkills) {
      setProfile(cachedProfile);
      setSkills(cachedSkills);
      setLoading(false);
      return;
    }

    fetchProfileAndSkills()
      .then((res) => {
        if (isMounted) {
          setProfile(res.profile);
          setSkills(res.skills);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, skills, loading, error };
}
