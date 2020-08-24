import { useMemo } from 'react'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { concatPagination } from '@apollo/client/utilities'
import { createAuthLink } from 'aws-appsync-auth-link'

let apolloClient

function createApolloClient() {
  // API key link
  const apiAuthLink = createAuthLink({
    url: process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT,
    region: process.env.NEXT_PUBLIC_AWS_APPSYNC_REGION,
    auth: {
      type: process.env.NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATION_TYPE,
      apiKey: process.env.NEXT_PUBLIC_AWS_APPSYNC_APIKEY,
    },
  })

  // OpenID Connect link
  // TODO: https://github.com/awslabs/aws-mobile-appsync-sdk-js
  // const oidcAuthLink = createAuthLink({}) OR add jwtToken to above?

  // http link (the terminating link in the chain)
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT,
  })

  // cache policies
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          listArtists: concatPagination(['sort']),
        },
      },
    },
  })

  // create ApolloClient with AWS links and cache
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([ apiAuthLink, httpLink ]),
    cache: cache,
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
