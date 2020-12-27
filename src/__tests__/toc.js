const toc = require('../toc')

const sample = `
# H1 a

Other text

# H1 b

## H2 b 1

### H3 b 1 i

Some text

### H3 b 1 ii

## H2 c 1

Some text
`

test('parses headings', () => {
  const result = toc(sample)

  expect(result).toMatchSnapshot()
})

const mdSample = `
# Foo **strong**

# Bar \`code\`

# Baz *emphasis*
`

test('parses headings with formatting markdown', () => {
  const result = toc(mdSample)

  expect(result).toMatchSnapshot()
})

const mdxSample = `
# Foo <b>Test</b>
`

test('parses headings with JSX elements', () => {
  const result = toc(mdxSample)

  expect(result).toMatchSnapshot()
})
