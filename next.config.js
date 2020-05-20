const withSourceMaps = require('@zeit/next-source-maps')()

module.exports = withSourceMaps({
  target: 'serverless',
  webpack: (config, options) => {
    // Asking Webpack to replace @sentry/node imports with @sentry/browser when
    // building the browser's bundle
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }
    return config
  },
})
