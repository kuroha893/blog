import rawAbout from './about.json'
import rawAcademic from './academic.json'
import rawProjects from './projects.json'

// These JSON files are edited through Pages CMS, which drops empty fields on save
// and does not validate values. Everything is normalized here so that a missing
// or mistyped field can never break the build.
type Lang = 'zh' | 'en'
type Rec = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '')
const list = (v: unknown) => (Array.isArray(v) ? (v as Rec[]).filter((x) => x && typeof x === 'object') : [])
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback
const localized = (zh: unknown, en: unknown, lang: Lang) => (lang === 'en' ? str(en) || str(zh) : str(zh))
/** Split a multi-paragraph text field on blank lines */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
const links = (v: unknown, fallbackType: string) =>
  list(v)
    .map((l) => ({ type: str(l.type) || fallbackType, href: str(l.href), label: str(l.label) || undefined }))
    .filter((l) => l.href)

export function getAboutPage(lang: Lang) {
  const data = rawAbout as unknown as Rec
  return {
    intro: paragraphs(localized(data.intro, data.intro_en, lang)),
    distributions: list(data.distributions)
      .map((d) => ({
        title: localized(d.title, d.title_en, lang),
        // DistributionSection prepends https:// itself
        url: str(d.url).replace(/^https?:\/\//, '').replace(/\/$/, ''),
        platform: str(d.platform) || 'default'
      }))
      .filter((d) => d.url)
  }
}

export function getProjectsPage(lang: Lang) {
  const data = rawProjects as unknown as Rec
  return {
    projects: list(data.projects)
      .map((p) => ({
        name: localized(p.name, p.name_en, lang),
        description: localized(p.description, p.description_en, lang),
        links: links(p.links, 'site')
      }))
      .filter((p) => p.name)
  }
}

export function getAcademicPage(lang: Lang) {
  const data = rawAcademic as unknown as Rec
  return {
    about: paragraphs(localized(data.about, data.about_en, lang)),
    cvUrl: str(data.cvUrl),
    interests: list(data.interests)
      .map((i) => ({
        title: localized(i.title, i.title_en, lang),
        description: localized(i.description, i.description_en, lang),
        icon: str(i.icon).toLowerCase()
      }))
      .filter((i) => i.title),
    publications: list(data.publications)
      .map((p) => ({
        title: str(p.title),
        authors: list(p.authors)
          .map((a) => ({
            name: str(a.name),
            isMe: a.isMe === true,
            isEqual: a.isEqual === true,
            isCoreContributor: a.isCoreContributor === true,
            homepage: str(a.homepage) || undefined
          }))
          .filter((a) => a.name),
        venue: str(p.venue),
        year: str(p.year),
        type: oneOf(p.type, ['conference', 'journal', 'workshop', 'preprint'] as const, 'conference'),
        status: oneOf(p.status, ['published', 'accepted', 'under-review', 'preprint'] as const, 'published'),
        abstract: str(p.abstract) || undefined,
        links: links(p.links, 'website')
      }))
      .filter((p) => p.title),
    openSource: list(data.openSource)
      .map((p) => ({
        title: localized(p.title, p.title_en, lang),
        description: localized(p.description, p.description_en, lang),
        category: str(p.category) || undefined,
        status: oneOf(p.status, ['active', 'completed', 'archived'] as const, 'active'),
        links: links(p.links, 'github')
      }))
      .filter((p) => p.title)
  }
}
