import raw from './profile.json'

// profile.json is edited through Pages CMS, which drops empty fields on save.
// Every field is therefore optional here and gets a default below.
interface EducationItem {
  heading?: string
  heading_en?: string
  subheading?: string
  subheading_en?: string
  date?: string
  date_en?: string
  href?: string
}

interface RawProfile {
  site?: { title?: string; description?: string; description_en?: string; domain?: string }
  author?: {
    name?: string
    name_en?: string
    location?: string
    githubUsername?: string
    email?: string
    googleScholar?: string
    blogStartDate?: string
  }
  home?: { about?: string; about_en?: string; education?: EducationItem[] }
}

const data = raw as unknown as RawProfile

const profile = {
  site: {
    title: data.site?.title || 'My Blog',
    description: data.site?.description || '',
    description_en: data.site?.description_en || '',
    domain: data.site?.domain || ''
  },
  author: {
    name: data.author?.name || '',
    name_en: data.author?.name_en || data.author?.name || '',
    location: data.author?.location || '',
    githubUsername: data.author?.githubUsername || '',
    email: data.author?.email || '',
    googleScholar: data.author?.googleScholar || '',
    blogStartDate: data.author?.blogStartDate || ''
  },
  home: {
    about: data.home?.about || '',
    about_en: data.home?.about_en || data.home?.about || '',
    education: data.home?.education ?? []
  }
}

export default profile
