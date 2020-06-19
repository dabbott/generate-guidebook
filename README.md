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
  guidebookDirectory = 'pages',
  guidebookModulePath = './guide.js',
})
```
