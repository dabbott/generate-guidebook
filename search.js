const path = require('path')
const FlexSearch = require('flexsearch')
const parser = require('./src/parser')
const matter = require('gray-matter')
const flatten = require('./src/flatten')

/**
 * @typedef {import('flexsearch').Index} Index
 * @typedef {import('./index').TreeNode} TreeNode
 * @typedef {{ id: number, body: string }} Document
 */

/**
 * Create document.
 *
 * @param {number} id
 * @param {string} content
 * @returns {Document}
 */
function createDocument(id, content) {
  const root = parser.parse(content)

  return {
    id,
    body: flatten(root),
  }
}

/**
 * @param {string} directory
 * @param {TreeNode} root
 * @returns {Document[]}
 */
function createDocuments(directory, root, fs = require('fs')) {
  const resolvedDirectory = path.resolve(directory)

  function inner(currentDirectory, node, acc) {
    const route = path.join(currentDirectory, node.file)
    const filepath = path.join(resolvedDirectory, route)
    const content = matter(fs.readFileSync(filepath, 'utf8')).content

    const document = createDocument(node.id, content)
    document.title = node.title
    acc.push(document)

    const basename = path.basename(node.file, path.extname(node.file))

    node.children.forEach((child) => {
      inner(
        node === root
          ? currentDirectory
          : path.join(currentDirectory, basename),
        child,
        acc
      )
    })

    return acc
  }

  return inner('', root, [])
}

/**
 * Build a search index from an array of documents.
 *
 * @param {Document[]} documents
 * @param {import('flexsearch').CreateOptions} options
 * @param {TreeNode} root
 */
function buildIndex(documents, options) {
  const index = new FlexSearch(options)

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
  createDocuments,
  buildIndex,
  exportIndex,
}
