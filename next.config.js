const withSourceMaps = require('@zeit/next-source-maps')()

module.exports = withSourceMaps({
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    AWS_APPSYNC_GRAPHQL_ENDPOINT: process.env.AWS_APPSYNC_GRAPHQL_ENDPOINT,
    AWS_APPSYNC_AUTHENTICATION_TYPE: process.env.AWS_APPSYNC_AUTHENTICATION_TYPE,
    AWS_APPSYNC_REGION: process.env.AWS_APPSYNC_REGION,
    AWS_APPSYNC_APIKEY: process.env.AWS_APPSYNC_APIKEY,
  },
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
