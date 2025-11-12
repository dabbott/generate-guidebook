const path = require('path')
const matter = require('gray-matter')
const toc = require('./src/toc')

/**
 * @typedef { import('.').TreeNode } TreeNode
 */

/**
 * @function
 * @template T
 * @param {T | null | false | undefined} input
 * @returns {T[]}
 */
function compact(input) {
  let output = []

  for (let value of input) {
    if (typeof value !== 'undefined' && value !== false && value !== null) {
      output.push(value)
    }
  }

  return output
}

/**
 * Replace variables in the string template.
 *
 * @param {template} string
 * @param {any} variables
 * @returns {string}
 */
function replaceTemplate(template, variables) {
  return template.replace(/\$\{(.*?)\}/, (match, group1) => {
    if (typeof variables === 'object' && variables && group1 in variables) {
      return variables[group1].toString()
    }

    return `(Undefined variable: ${group1})`
  })
}

/**
 * @param {string} string
 * @returns {string}
 */
function formatSlug(string) {
  return string.replace(/ /g, '_').toLowerCase()
}

/**
 * @param {string} string
 * @returns {string}
 */
function formatTitle(string) {
  function titleCase(component) {
    if (component === 'or' || component === 'and') return component

    return component.slice(0, 1).toUpperCase() + component.slice(1)
  }

  return string.split('_').map(titleCase).join(' ')
}

/**
 * @typedef {{ order?: number, title?: string, subtitle?: string }} FrontMatter
 */

/**
 * @param {string} filePath
 * @returns {{ data: FrontMatter, content: string }}
 */
function read(filePath, fs) {
  return matter(fs.readFileSync(filePath, 'utf8'))
}

/**
 * @param {string} directoryPath
 * @param {string[]} files
 * @returns {string[]}
 */
function sortFiles(directoryPath, files, fs) {
  let orderJSON = {}

  try {
    const data = fs.readFileSync(path.join(directoryPath, 'config.json'))
    const config = JSON.parse(data)
    orderJSON = (config.order || []).reduce((result, item, index) => {
      result[item] = index + 1
      return result
    }, {})
  } catch (e) {
    // Pass
  }

  function pageKeyFor(file) {
    const basename = path.basename(file)
    if (basename === 'index.mdx') {
      // Use the directory name when sorting directory index pages
      return path.basename(path.dirname(path.join(directoryPath, file)))
    }
    return path.basename(file, '.mdx')
  }

  return files
    .map((file, index) => {
      const key = pageKeyFor(file)
      const order =
        orderJSON[key] ||
        read(path.join(directoryPath, file), fs).data.order ||
        10000 + index

      return { file, order }
    })
    .sort((a, b) => a.order - b.order)
    .map((obj) => obj.file)
}

/**
 * @typedef {{ fs: import('fs'), id: number }} Context
 */

/**
 * @param {string} rootPath
 * @param {string[]} pathComponents
 * @param {context} Context
 * @returns {TreeNode[]}
 */
function readTree(rootPath, pathComponents, context) {
  const { fs } = context
  const files = fs.readdirSync(rootPath)

  // Identify documentation directories: directories that contain an index.mdx
  const directories = files.filter((f) =>
    fs.statSync(path.join(rootPath, f)).isDirectory()
  )

  const docDirectories = directories.filter((dir) =>
    fs.existsSync(path.join(rootPath, dir, 'index.mdx'))
  )

  // Regular page files at this level (excluding index.mdx and any that have a corresponding doc directory)
  const filePages = files.filter(
    (f) =>
      f.endsWith('.mdx') &&
      f !== 'index.mdx' &&
      !docDirectories.includes(path.basename(f, '.mdx'))
  )

  // Represent directory pages as 'dir/index.mdx'
  const directoryPageFiles = docDirectories.map((dir) =>
    path.join(dir, 'index.mdx')
  )

  const pages = sortFiles(rootPath, [...filePages, ...directoryPageFiles], fs)

  return compact(
    pages.map((file) => {
      // Determine basename (slug component) and whether this page is a directory index
      const isDirectoryIndex = path.basename(file) === 'index.mdx'
      const basename = isDirectoryIndex
        ? path.basename(path.dirname(path.join(rootPath, file)))
        : path.basename(file, '.mdx')

      const components = [...pathComponents, basename]

      let { data: frontmatter, content } = read(path.join(rootPath, file), fs)

      const { hidden, ...rest } = frontmatter

      frontmatter = rest

      if (hidden === true) return

      if (
        typeof hidden === 'string' &&
        typeof context.variables === 'object' &&
        context.variables &&
        context.variables[hidden]
      ) {
        return
      }

      return {
        ...frontmatter,
        id: context.id++,
        file: path.basename(file),
        title: frontmatter.title
          ? replaceTemplate(frontmatter.title, context.variables)
          : formatTitle(basename),
        subtitle: frontmatter.subtitle
          ? replaceTemplate(frontmatter.subtitle, context.variables)
          : undefined,
        slug: components.map(formatSlug).join('/'),
        parent: components.slice(0, -1).map(formatSlug).join('/'),
        children: isDirectoryIndex
          ? readTree(
              path.join(rootPath, basename),
              components,
              context
            )
          : directories.includes(basename)
          ? // Backwards compatibility: support old pattern of file.mdx + dir without index.mdx
            readTree(path.join(rootPath, basename), components, context)
          : [],
        headings: toc(content),
        ...(frontmatter.author && {
          author: {
            name: frontmatter.author.name,
            url: frontmatter.author.url,
          },
        }),
      }
    })
  )
}

/**
 * @param {TreeNode[]} nodes
 * @param {string} previous
 * @param {string | undefined} next
 * @returns {TreeNode[]}
 */
function connectNodes(nodes, previous, next) {
  nodes.forEach((node, index) => {
    const isFirst = index === 0
    const isLast = index === nodes.length - 1

    if (isFirst) {
      node.previous = previous
    } else {
      let previousNode = nodes[index - 1]

      while (previousNode.children.length > 0) {
        previousNode = previousNode.children[previousNode.children.length - 1]
      }

      node.previous = previousNode.slug
    }

    if (isLast) {
      if (node.children.length === 0) {
        node.next = next
      } else {
        node.next = node.children[0].slug
      }

      connectNodes(node.children, node.slug, next)
    } else {
      const nextNode = nodes[index + 1]

      if (node.children.length === 0) {
        node.next = nextNode.slug
      } else {
        node.next = node.children[0].slug
      }

      connectNodes(node.children, node.slug, nextNode.slug)
    }
  })
}

/**
 * @param {string} directory  Directory to scan for pages
 * @param {any} variables  Variable data for usage in frontmatter
 * @returns {TreeNode}
 */
function scan(directory, variables, fs = require('fs')) {
  const pagesPath = path.resolve(directory)

  let indexId = 0
  const topLevelPages = readTree(pagesPath, [], {
    id: indexId + 1,
    variables: variables,
    fs,
  })

  connectNodes(topLevelPages, '')

  const file = 'index.mdx'
  let { data: frontmatter, content } = read(path.join(directory, file), fs)

  const { hidden, ...rest } = frontmatter

  frontmatter = rest

  return {
    ...frontmatter,
    id: indexId,
    file,
    slug: '',
    title: frontmatter.title
      ? replaceTemplate(frontmatter.title, variables)
      : formatTitle('index'),
    subtitle: frontmatter.subtitle
      ? replaceTemplate(frontmatter.subtitle, variables)
      : undefined,
    children: topLevelPages,
    next: topLevelPages[0] ? topLevelPages[0].slug : undefined,
    headings: toc(content),
    ...(frontmatter.author && {
      author: {
        name: frontmatter.author.name,
        url: frontmatter.author.url,
      },
    }),
  }
}

module.exports = scan
