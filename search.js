const path = require('path')
const FlexSearch = require('flexsearch')
const unified = require('unified')
const parse = require('remark-parse')
const mdx = require('remark-mdx')
const stringify = require('remark-stringify')
const visit = require('unist-util-visit')
const matter = require('gray-matter')

/**
 * @typedef {import('flexsearch').Index} Index
 * @typedef {import('./index').TreeNode} TreeNode
 * @typedef {{ id: number, body: string }} Document
 */

const processor = unified().use(parse).use(stringify).use(mdx)

/**
 * Create document.
 *
 * @param {number} id
 * @param {string} content
 * @returns {Document}
 */
function createDocument(id, content) {
  const root = processor.parse(content)

  let body = []

  visit(root, function (node) {
    if (node.type === 'text') {
      body.push(node.value)
    }
  })

  return {
    id,
    body: body.join(' '),
  }
}

/**
 * Build a search index.
 *
 * @param {string} directory  Pages directory.
 * @param {TreeNode} root
 */
function buildIndex(directory, root, fs = require('fs')) {
  const index = new FlexSearch()

  const resolvedDirectory = path.resolve(directory)

  /**
   *
   * @param {string} directory
   * @param {TreeNode} node
   * @param {Document[]} acc
   * @returns {Document[]}
   */
  function createDocuments(directory, node, acc) {
    const route = path.join(directory, node.file)
    const filepath = path.join(resolvedDirectory, route)
    const content = matter(fs.readFileSync(filepath, 'utf8')).content

    const document = createDocument(node.id, content)
    acc.push(document)

    const basename = path.basename(node.file, path.extname(node.file))

    node.children.forEach((child) => {
      createDocuments(
        node === root ? directory : path.join(directory, basename),
        child,
        acc
      )
    })

    return acc
  }

  const documents = createDocuments('', root, [])

  documents.forEach((document) => {
    index.add(document.id, document.body)
  })

  return index
}

/**
 * @param {Index} index
 * @returns {any} Serialized search index
 */
function exportIndex(index) {
  return index.export()
}

module.exports = {
  buildIndex,
  exportIndex,
}
