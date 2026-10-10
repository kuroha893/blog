import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import profile from '../data/site-profile'

// The terms pages ship with [Your Name] / [Your Domain] / [Your Email] placeholders.
// Fill them from the site profile so they never need editing by hand.
const siteUrl = profile.site.domain ? `https://${profile.site.domain}` : profile.site.title
const replacements: Record<string, string> = {
  '[Your Name]': profile.author.name_en || profile.author.name || profile.site.title,
  '[Your Domain]': profile.site.domain || profile.site.title,
  '[Your Email]': profile.author.email || siteUrl
}
const pattern = /\[Your (?:Name|Domain|Email)\]/g

export default function remarkSitePlaceholders() {
  return (tree: Root, file: VFile) => {
    if (!/[\\/]pages[\\/](?:en[\\/])?terms[\\/]/.test(file.path ?? '')) return
    visit(tree, (node) => {
      if ((node.type === 'text' || node.type === 'html') && typeof node.value === 'string') {
        node.value = node.value.replace(pattern, (match) => replacements[match] ?? match)
      }
    })
  }
}
