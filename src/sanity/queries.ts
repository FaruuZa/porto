export const PROJECTS_QUERY = `
  *[_type == "project"] | order(date desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    category,
    coverImage,
    gallery,
    shortDescription,
    description,
    techStack,
    links,
    featured
  }
`

export const FEATURED_PROJECTS_QUERY = `
  *[_type == "project" && featured == true] | order(date desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    category,
    coverImage,
    gallery,
    shortDescription,
    description,
    techStack,
    links,
    featured
  }
`

export const AUTHOR_PROFILE_QUERY = `
  *[_type == "author"][0] {
    _id,
    name,
    nickname,
    title,
    location,
    status,
    image,
    bio,
    heroBio,
    whiteSpaceIntro,
    education {
      institution,
      major,
      semester,
      gpa,
      academicStatus,
      description
    },
    languages[] {
      _key,
      name,
      level,
      percentage
    },
    specialization,
    contact {
      email,
      github,
      linkedin,
      resumeUrl
    }
  }
`

export const SKILLS_QUERY = `
  *[_type == "skill"] | order(order asc, _createdAt asc) {
    _id,
    name,
    category,
    level,
    iconId,
    order
  }
`

export const POSTS_QUERY = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage,
    "author": author->{ name, image },
    "categories": categories[]->{ title, "slug": slug.current }
  }
`

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage,
    body,
    "author": author->{ name, image, bio },
    "categories": categories[]->{ title }
  }
`
