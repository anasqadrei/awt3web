import AWSAppSyncClient from 'aws-appsync';
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'isomorphic-fetch'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

function create(initialState) {
  return new AWSAppSyncClient({
    url: publicRuntimeConfig.AWS_APPSYNC_GRAPHQL_ENDPOINT,
    region: publicRuntimeConfig.AWS_APPSYNC_REGION,
    auth: {
      type: publicRuntimeConfig.AWS_APPSYNC_AUTHENTICATION_TYPE,
      apiKey: publicRuntimeConfig.AWS_APPSYNC_APIKEY
    },
    disableOffline: true,
  }, {
    cache: new InMemoryCache().restore(initialState || {}),
    ssrMode: true
  })
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}
