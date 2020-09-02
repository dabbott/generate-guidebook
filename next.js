const EvalWebpackPlugin = require('eval-webpack-plugin')
const generateGuidebook = require('./index')
const { buildIndex, exportIndex } = require('./search')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  const {
    guidebookDirectory = './pages',
    guidebookModulePath = './guidebook.js',
    searchIndexPath = './searchIndex.js',
  } = pluginOptions

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.plugins.push(
        new EvalWebpackPlugin(guidebookModulePath, () =>
          generateGuidebook(guidebookDirectory)
        )
      )

      config.plugins.push(
        new EvalWebpackPlugin(searchIndexPath, () => {
          const root = generateGuidebook(guidebookDirectory)
          const index = buildIndex(guidebookDirectory, root)
          return exportIndex(index)
        })
      )

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
