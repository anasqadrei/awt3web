const withSourceMaps = require('@zeit/next-source-maps')

module.exports = withSourceMaps({
  target: 'serverless',
  async redirects() {
    return [
      {
        source: '/artists-list',
        destination: '/browse',
        permanent: true, 
      },
      { 
        source: '/about-us', 
        destination: '/about', 
        permanent: true,
      },
      { 
        source: '/terms', 
        destination: '/legal/terms', 
        permanent: true,
      },
      { 
        source: '/privacy', 
        destination: '/legal/privacy', 
        permanent: true,
      },
      { 
        source: '/copyright', 
        destination: '/legal/copyright', 
        permanent: true,
      },
    ]
  },
  webpack: (config, options) => {
    // Asking Webpack to replace @sentry/node imports with @sentry/browser when
    // building the browser's bundle
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }
    return config
  },
})
