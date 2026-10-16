import { useState, useEffect } from 'react';
import { client } from './client';
import { PROJECTS_QUERY } from './queries';
import { PROJECTS_DATA, FEATURED_PROJECTS as STATIC_FEATURED, type ProjectDetail } from '../data/projectsData';

let cachedProjects: ProjectDetail[] | null = null;
let cachedFeatured: ProjectDetail[] | null = null;
let fetchPromise: Promise<{ projects: ProjectDetail[]; featured: ProjectDetail[] }> | null = null;

function fetchProjectsFromSanity() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = client
    .fetch<any[]>(PROJECTS_QUERY)
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const normalized: ProjectDetail[] = data.map((item) => ({
          id: item.id || item._id,
          slug: item.slug || item.id || item._id,
          title: item.title,
          date: item.date || item.year || '2024',
          location: item.location || 'Jember, ID',
          coverImage: item.coverImage,
          gallery: Array.isArray(item.gallery) ? item.gallery : [],
          shortDescription: item.shortDescription,
          description: item.description,
          techStack: Array.isArray(item.techStack) ? item.techStack : [],
          links: item.links || {},
          featured: Boolean(item.featured),
          category: item.category || 'personal',
        }));

        const featured = normalized.filter((p) => p.featured);
        const resolvedFeatured = featured.length > 0 ? featured.slice(0, 4) : normalized.slice(0, 4);

        cachedProjects = normalized;
        cachedFeatured = resolvedFeatured;
        return { projects: normalized, featured: resolvedFeatured };
      }
      cachedProjects = PROJECTS_DATA;
      cachedFeatured = STATIC_FEATURED;
      return { projects: PROJECTS_DATA, featured: STATIC_FEATURED };
    })
    .catch((err) => {
      console.warn('Sanity fetch fallback to static data:', err);
      cachedProjects = PROJECTS_DATA;
      cachedFeatured = STATIC_FEATURED;
      return { projects: PROJECTS_DATA, featured: STATIC_FEATURED };
    });

  return fetchPromise;
}

export function useSanityProjects() {
  const [projects, setProjects] = useState<ProjectDetail[]>(() => cachedProjects || PROJECTS_DATA);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectDetail[]>(() => cachedFeatured || STATIC_FEATURED);
  const [loading, setLoading] = useState<boolean>(() => !cachedProjects);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (cachedProjects && cachedFeatured) {
      setProjects(cachedProjects);
      setFeaturedProjects(cachedFeatured);
      setLoading(false);
      return;
    }

    fetchProjectsFromSanity()
      .then((res) => {
        if (isMounted) {
          setProjects(res.projects);
          setFeaturedProjects(res.featured);
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

  return { projects, featuredProjects, loading, error };
}
