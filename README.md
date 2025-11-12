# Generate Guidebook

A utility for generating a tutorial guide. Used in:

- https://javascript.express
- http://react.express
- http://www.reactnativeexpress.com/

## Example

```js
const generateGuidebook = require('generate-guidebook')

const guidebook = generateGuidebook('./pages')
```

## Next plugin

```js
const withGuidebook = require('generate-guidebook/next')

// These are the default options
module.exports = withGuidebook({
  guidebookDirectory = './pages',
  guidebookModulePath = './guide.js',
})
```

## Directory structure

- The root of your guidebook must contain an `index.mdx` file. This is the root page.
- At any level, a folder is treated as a documentation page if it contains an `index.mdx` inside it. The folder name becomes the slug segment.
- Regular pages are `.mdx` files that sit alongside folders (excluding `index.mdx`).

Example:

```
pages/
  index.mdx              -> slug: ""
  getting-started/
    index.mdx            -> slug: "getting-started"
    install.mdx          -> slug: "getting-started/install"
  guides/
    index.mdx            -> slug: "guides"
    deep-dive/
      index.mdx          -> slug: "guides/deep-dive"
      advanced.mdx       -> slug: "guides/deep-dive/advanced"
  faq.mdx                -> slug: "faq"
```

Notes:

- Backwards compatibility: the older pattern of `foo.mdx` alongside a `foo/` folder (when the folder has no `index.mdx`) still works. The recommended pattern is `foo/index.mdx`.
- Ordering: control ordering via either frontmatter `order` or a `config.json` file placed in the directory.
  - `config.json` takes precedence over frontmatter `order`.
  - In `config.json`, list basenames: for directory pages use the directory name (e.g. `"guides"`), and for file pages use the file basename without extension (e.g. `"faq"`).
  - Example `config.json`:
    ```json
    { "order": ["getting-started", "guides", "faq"] }
    ```
- Hiding pages: add `hidden: true` in a page's frontmatter to omit it from the tree. You can also set `hidden: SOME_VARIABLE` and pass `variables` to conditionally hide.
