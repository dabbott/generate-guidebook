const { Volume, createFsFromVolume } = require('memfs')
const scan = require('..')
const { createDocuments, buildIndex, exportIndex } = require('../search')

function createFs(fileTree) {
  const volume = Volume.fromNestedJSON(fileTree, '/')
  const memfs = createFsFromVolume(volume)
  return memfs
}

describe('search', () => {
  it('builds a search index', () => {
    const directory = '/pages'
    const fs = createFs({
      pages: {
        'index.mdx': 'hello',
        'a.mdx': 'foo',
        a: {
          '1.mdx': 'foo',
        },
      },
    })

    const root = scan(directory, undefined, fs)
    const documents = createDocuments(directory, root, fs)
    const index = buildIndex(documents)

    expect(index.search('hello')).toEqual([0])
    expect(index.search('fo')).toEqual([1, 2])

    expect(exportIndex(index)).toMatchSnapshot()
  })

  it('indexes titles', () => {
    const directory = '/pages'
    const fs = createFs({
      pages: {
        'index.mdx': '# hello',
      },
    })

    const root = scan(directory, undefined, fs)
    const documents = createDocuments(directory, root, fs)
    const index = buildIndex(documents)

    expect(index.search('hello')).toEqual([0])
  })
})
