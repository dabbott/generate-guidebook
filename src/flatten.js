const visit = require('unist-util-visit')

module.exports = function flatten(root) {
  let body = []

  visit(root, (node) => {
    if (node.type === 'text') {
      body.push(node.value.trim())
    }
  })

  return body.join(' ')
}
