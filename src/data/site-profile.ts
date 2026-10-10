import { socialLinks } from '../types/constants'
import raw from './profile.json'
import rawSettings from './settings.json'

// These JSON files are edited through Pages CMS, which drops empty fields on save
// and does not validate values. Everything is normalized here so that a missing
// or mistyped field can never break the build.
type Rec = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const rec = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : {})
const list = (v: unknown) => (Array.isArray(v) ? (v as Rec[]).filter((x) => x && typeof x === 'object') : [])
const isHttpUrl = (v: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol)
  } catch {
    return false
  }
}
/** Uploaded media is stored as a site-absolute path; accept that or a full URL */
const image = (v: unknown, fallback: string) => {
  const s = str(v)
  return s.startsWith('/') || isHttpUrl(s) ? s : fallback
}

const data = rec(raw)
const site = rec(data.site)
const author = rec(data.author)
const home = rec(data.home)
const settingsData = rec(rawSettings)
const comments = rec(settingsData.comments)

const DEFAULT_AVATAR = '/avatar/default.svg'
const DEFAULT_FAVICON = '/favicon/favicon.svg'
const FAVICON_EXT = /\.(ico|gif|jpe?g|png|svg)$/i

const favicon = image(site.favicon, DEFAULT_FAVICON)
const avatar = image(author.avatar, DEFAULT_AVATAR)
const githubUsername = str(author.githubUsername).replace(/^@/, '')

// Footer social links: GitHub comes from the username, the rest from the list
const social: Partial<Record<(typeof socialLinks)[number], string>> = {}
if (githubUsername) social.github = `https://github.com/${githubUsername}`
for (const item of list(data.social)) {
  const platform = str(item.platform).toLowerCase() as (typeof socialLinks)[number]
  let url = str(item.url)
  if (platform === 'email' && url && !url.startsWith('mailto:')) url = `mailto:${url}`
  if (!socialLinks.includes(platform) || platform === 'rss') continue
  if (isHttpUrl(url) || url.startsWith('mailto:')) social[platform] = url
}

const DEFAULT_MENU = [
  { title: 'Blog', link: '/blog' },
  { title: 'Academic', link: '/academic' },
  { title: 'Projects', link: '/projects' },
  { title: 'Links', link: '/links' },
  { title: 'About', link: '/about' }
]
const menu = list(settingsData.menu)
  .map((m) => ({ title: str(m.title), link: str(m.link) }))
  .filter((m) => m.title && (m.link.startsWith('/') || isHttpUrl(m.link)))

const walineServer = str(comments.server)

const profile = {
  site: {
    title: str(site.title) || 'My Blog',
    description: str(site.description),
    description_en: str(site.description_en) || str(site.description),
    domain: str(site.domain)
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, ''),
    favicon: FAVICON_EXT.test(favicon.split('?')[0]) ? favicon : DEFAULT_FAVICON,
    // Default image for link previews; social platforms do not render SVG
    socialImage: avatar === DEFAULT_AVATAR ? '/avatar/avatar.png' : avatar
  },
  author: {
    name: str(author.name),
    name_en: str(author.name_en) || str(author.name),
    avatar,
    location: str(author.location),
    githubUsername,
    email: str(author.email),
    googleScholar: isHttpUrl(str(author.googleScholar)) ? str(author.googleScholar) : '',
    blogStartDate: /^\d{4}-\d{2}-\d{2}/.test(str(author.blogStartDate)) ? str(author.blogStartDate) : ''
  },
  social,
  home: {
    about: str(home.about),
    about_en: str(home.about_en) || str(home.about),
    education: list(home.education).map((e) => ({
      heading: str(e.heading),
      heading_en: str(e.heading_en) || str(e.heading),
      subheading: str(e.subheading),
      subheading_en: str(e.subheading_en) || str(e.subheading),
      date: str(e.date),
      date_en: str(e.date_en) || str(e.date),
      href: isHttpUrl(str(e.href)) ? str(e.href) : ''
    }))
  },
  settings: {
    menu: menu.length > 0 ? menu : DEFAULT_MENU,
    comments: {
      // Comments need a server; without one they stay off whatever the switch says
      enable: comments.enable === true && isHttpUrl(walineServer),
      server: isHttpUrl(walineServer) ? walineServer : ''
    }
  }
}

export default profile
