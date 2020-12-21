const unified = require('unified')
const parse = require('remark-parse')
const mdx = require('remark-mdx')
const stringify = require('remark-stringify')

const parser = unified().use(parse).use(stringify).use(mdx)

module.exports = parser
