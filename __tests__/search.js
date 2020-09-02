const { Volume, createFsFromVolume } = require('memfs')
const scan = require('..')
const { buildIndex, exportIndex } = require('../search')

function createFs(fileTree) {
  const volume = Volume.fromNestedJSON(fileTree, '/')
  const memfs = createFsFromVolume(volume)
  return memfs
}

describe('search', () => {
  it('builds a search index', () => {
    const fs = createFs({
      pages: {
        'index.mdx': 'hello',
        'a.mdx': 'foo',
        a: {
          '1.mdx': 'foo',
        },
      },
    })

    const root = scan('/pages', fs)
    const index = buildIndex('/pages', root, fs)

    expect(index.search('hello')).toEqual(['index.mdx'])
    expect(index.search('fo')).toEqual(['a.mdx', 'a/1.mdx'])

    expect(exportIndex(index)).toMatchSnapshot()
  })

  it('indexes titles', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '# hello',
      },
    })

    const root = scan('/pages', fs)
    const index = buildIndex('/pages', root, fs)

    expect(index.search('hello')).toEqual(['index.mdx'])
  })
})
