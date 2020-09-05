const EvalWebpackPlugin = require('eval-webpack-plugin')
const scan = require('./index')
const { createDocuments, buildIndex, exportIndex } = require('./search')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  const {
    guidebookDirectory = './pages',
    guidebookModulePath = './guidebook.js',
    searchIndexPath = './searchIndex.js',
    searchIndexOptions = {},
    variables,
  } = pluginOptions

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.plugins.push(
        new EvalWebpackPlugin(guidebookModulePath, () =>
          scan(guidebookDirectory, variables)
        )
      )

      config.plugins.push(
        new EvalWebpackPlugin(searchIndexPath, () => {
          const root = scan(guidebookDirectory, variables)
          const documents = createDocuments(guidebookDirectory, root)
          const index = buildIndex(documents, searchIndexOptions)
          return { indexData: exportIndex(index), documents }
        })
      )

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
