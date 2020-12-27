const visit = require('unist-util-visit')

const textTypes = {
  text: true,
  inlineCode: true,
}

module.exports = function flatten(root) {
  let body = []

  visit(root, (node) => {
    if (textTypes[node.type]) {
      body.push(node.value.trim())
    }
  })

  return body.join(' ')
}
