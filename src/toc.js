const toc = require('mdast-util-toc')
const flatten = require('./flatten')
const parser = require('./parser')

function compressList(ast) {
  return inner(ast, 1).flat(Infinity)

  function inner(node, depth) {
    if (!node) return []

    return node.children.map((listItem) => {
      return listItem.children.map((child) => {
        switch (child.type) {
          case 'list':
            return inner(child, depth + 1)
          case 'paragraph':
            const { url } = child.children[0]

            return {
              level: depth,
              title: flatten(child),
              url,
            }
          default:
            return child
        }
      })
    })
  }
}

/**
 * @param {string} content
 */
module.exports = function parseHeadings(content) {
  const root = parser.parse(content)

  const result = toc(root, {})

  return compressList(result.map)
}
