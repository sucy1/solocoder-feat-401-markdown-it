// Table of contents plugin

import { escapeHtml } from './common/utils.mjs'

const TOC_OPEN_RE = /^<!--\s*toc\s*-->$/i
const TOC_CLOSE_RE = /^<!--\s*\/toc\s*-->$/i

function slugify (str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

function getHeadingText (tokens, idx) {
  const inlineToken = tokens[idx + 1]
  if (!inlineToken || inlineToken.type !== 'inline' || !inlineToken.children) {
    return ''
  }

  let text = ''
  for (const child of inlineToken.children) {
    if (child.type === 'text') {
      text += child.content
    }
  }
  return text.trim()
}

function generateTocHtml (headings, options) {
  if (headings.length === 0) {
    return ''
  }

  const listTag = options.ordered ? 'ol' : 'ul'
  let html = ''

  const stack = []

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1] > heading.level) {
      html += `</li>\n</${listTag}>\n`
      stack.pop()
    }

    if (stack.length === 0) {
      html += `<${listTag} class="table-of-contents">\n`
    } else if (stack[stack.length - 1] < heading.level) {
      html += `<${listTag}>\n`
    } else {
      html += '</li>\n'
      stack.pop()
    }

    html += `<li><a href="#${escapeHtml(heading.slug)}">${escapeHtml(heading.text)}</a>`
    stack.push(heading.level)
  }

  while (stack.length > 0) {
    html += '</li>\n'
    stack.pop()
    if (stack.length > 0) {
      html += `</${listTag}>\n`
    }
  }

  html += `</${listTag}>\n`
  return html
}

function tocPlugin (md, options) {
  options = Object.assign({
    ordered: false,
    maxDepth: 6
  }, options || {})

  function tocRule (state) {
    const tokens = state.tokens
    const headings = []
    const usedSlugs = {}
    let tocOpenIdx = -1
    let tocCloseIdx = -1

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'html_block') {
        const content = token.content.trim()
        if (TOC_OPEN_RE.test(content) && tocOpenIdx === -1) {
          tocOpenIdx = i
        } else if (TOC_CLOSE_RE.test(content) && tocOpenIdx !== -1 && tocCloseIdx === -1) {
          tocCloseIdx = i
        }
      }
    }

    if (tocOpenIdx === -1 || tocCloseIdx === -1) {
      return
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substr(1), 10)
        if (level <= options.maxDepth) {
          const text = getHeadingText(tokens, i)
          if (text) {
            const baseSlug = slugify(text)
            let slug = baseSlug
            if (usedSlugs[baseSlug]) {
              const count = usedSlugs[baseSlug]
              slug = `${baseSlug}-${count}`
              usedSlugs[baseSlug]++
            } else {
              usedSlugs[baseSlug] = 1
            }
            headings.push({ level, text, slug })
            token.attrSet('id', slug)
          }
        }
      }
    }

    const tocHtml = generateTocHtml(headings, options)

    const newTokens = []

    for (let i = 0; i < tokens.length; i++) {
      if (i === tocOpenIdx) {
        newTokens.push(tokens[i])

        if (tocHtml) {
          const tocToken = new state.Token('html_block', '', 0)
          tocToken.content = tocHtml + '\n'
          newTokens.push(tocToken)
        }

        i = tocCloseIdx
        newTokens.push(tokens[i])
      } else {
        newTokens.push(tokens[i])
      }
    }

    state.tokens = newTokens
  }

  md.core.ruler.push('toc', tocRule)
}

export default tocPlugin
