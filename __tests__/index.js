const { Volume, createFsFromVolume, DirectoryJSON } = require('memfs')
const scan = require('..')

function createFs(fileTree) {
  const volume = Volume.fromNestedJSON(fileTree, '/')
  const memfs = createFsFromVolume(volume)
  return memfs
}

describe('index', () => {
  it('converts an index file', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
      },
    })

    const result = scan('/pages', fs)

    expect(result).toEqual({
      file: 'index.mdx',
      slug: '',
      title: 'Index',
      subtitle: undefined,
      children: [],
      next: undefined,
    })
  })

  it('reads frontmatter', () => {
    const fs = createFs({
      pages: {
        'index.mdx': `---
title: foo
subtitle: bar
---

# Content`,
      },
    })

    const result = scan('/pages', fs)

    expect(result).toEqual({
      file: 'index.mdx',
      slug: '',
      title: 'foo',
      subtitle: 'bar',
      children: [],
      next: undefined,
    })
  })

  it('handles order in config.json', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        'b.mdx': '',
        'config.json': JSON.stringify({
          order: ['b', 'a'],
        }),
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })

  it('reads top-level directory', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        'b.mdx': '',
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })

  it('reads nested directories', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        a: {
          '1.mdx': '',
          '2.mdx': '',
        },
        'b.mdx': '',
        b: {
          '1.mdx': '',
        },
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })

  it('reads doubly nested directories', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        a: {
          '1.mdx': '',
          '2.mdx': '',
          '2': {
            'i.mdx': '',
            'j.mdx': '',
          },
        },
        'b.mdx': '',
        b: {
          '1.mdx': '',
        },
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })

  it('handles order in nested config.json', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        a: {
          '1.mdx': '',
        },
        'hooks.mdx': '',
        hooks: {
          'custom_hooks.mdx': '',
          'usecontext.mdx': '',
          'useeffect.mdx': '',
          'usereducer.mdx': '',
          'useref.mdx': '',
          'usestate.mdx': `---
title: useState
---

# useState`,
          'config.json': JSON.stringify({
            order: [
              'usestate',
              'usereducer',
              'useeffect',
              'useref',
              'usecontext',
              'custom_hooks',
            ],
          }),
        },
        'config.json': JSON.stringify({
          order: ['a', 'hooks'],
        }),
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })

  it('handles hidden flag in frontmatter', () => {
    const fs = createFs({
      pages: {
        'index.mdx': '',
        'a.mdx': '',
        'b.mdx': `---
hidden: true
---`,
      },
    })

    const result = scan('/pages', fs)

    expect(result).toMatchSnapshot()
  })
})
