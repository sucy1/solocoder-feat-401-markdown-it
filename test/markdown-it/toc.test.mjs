import { fileURLToPath } from 'node:url'
import { describe } from 'node:test'
import { generateTests } from '../helpers.mjs'
import markdownit from '../../index.mjs'

describe('table of contents', function () {
  const mdDefault = markdownit({ html: true })
  mdDefault.use(markdownit.tableOfContents)

  generateTests(fileURLToPath(new URL('../fixtures/markdown-it/toc.txt', import.meta.url)), mdDefault)
})

describe('table of contents (ordered)', function () {
  const mdOrdered = markdownit({ html: true })
  mdOrdered.use(markdownit.tableOfContents, { ordered: true })

  generateTests(fileURLToPath(new URL('../fixtures/markdown-it/toc-ordered.txt', import.meta.url)), mdOrdered)
})

describe('table of contents (maxDepth)', function () {
  const mdMaxDepth = markdownit({ html: true })
  mdMaxDepth.use(markdownit.tableOfContents, { maxDepth: 2 })

  generateTests(fileURLToPath(new URL('../fixtures/markdown-it/toc-maxdepth.txt', import.meta.url)), mdMaxDepth)
})
