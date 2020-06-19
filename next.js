const EvalWebpackPlugin = require('eval-webpack-plugin')
const generateGuidebook = require('./index')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  const {
    guidebookDirectory = 'pages',
    guidebookModulePath = './guide.js',
  } = pluginOptions

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.plugins.push(
        new EvalWebpackPlugin(guidebookModulePath, () =>
          generateGuidebook(guidebookDirectory)
        )
      )

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
