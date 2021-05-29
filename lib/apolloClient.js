import { useMemo } from 'react'
import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client'
import { createAuthLink } from 'aws-appsync-auth-link'
import { cache } from 'lib/apolloCache'
import { TYPE_DEFS } from 'lib/localState'
import { getAuthUserIdToken } from 'components/user.auth.comp'

let apolloClient

function useIdTokenLink({ operationName, variables }) {
  // unconditional operations
  const operationsList = [
    `getLinkedUser`,
    `listUserRecommendedSongs`,
    `listUserLikedArtists`,
    `listUserPlayedArtists`,
    `listUserLikedSongs`,
    `listUserPlayedSongs`,
    `listUserDownloadedSongs`,
    `listUserLikedPlaylists`,
    `listUserSearches`,
    `checkUserLikeComments`,
    `checkUserLikeArtist`,
    `checkUserLikeSong`,
    `checkUserDislikeSong`,
    `checkUserLikeSongImage`,
    `checkUserDislikeSongImage`,
    `checkUserLikePlaylist`,
    `likeArtist`,
    `unlikeArtist`,
    `createSong`,
    `updateSong`,
    `likeSong`,
    `unlikeSong`,
    `dislikeSong`,
    `undislikeSong`,
    `downloadSong`,
    `deleteSong`,
    `createSongImage`,
    `likeSongImage`,
    `unlikeSongImage`,
    `dislikeSongImage`,
    `undislikeSongImage`,
    `deleteSongImage`,
    `createLyrics`,
    `updateLyrics`,
    `deleteLyrics`,
    `updateUser`,
    `deleteUser`,
    `createComment`,
    `likeComment`,
    `unlikeComment`,
    `flagComment`,
    `deleteComment`,
    `createPlaylist`,
    `updatePlaylist`,
    `addSongToPlaylist`,
    `removeSongFromPlaylist`,
    `likePlaylist`,
    `unlikePlaylist`,
    `deletePlaylist`,
    `contactUs`,
    `getUploadSignedURL`,
  ]

  // conditional operations [operation, condition]
  const conditionalOperationsList = new Map([
    [ 'listUserPlaylists', variables.private ],
    [ 'searchSongs', variables.userId ],
    [ 'listTopSearches', variables.userId ],
    [ 'shareArtist', variables.userId ],
    [ 'playPlaylist', variables.userId ],
    [ 'sharePlaylist', variables.userId ],
  ])

  return (operationsList.includes(operationName) || conditionalOperationsList.get(operationName))
}

function createApolloClient() {
  // API key link
  const apiAuthLink = createAuthLink({
    auth: {
      type: 'API_KEY',
      apiKey: process.env.NEXT_PUBLIC_AWS_APPSYNC_APIKEY,
    },
  })

  // OpenID Connect link
  const oidcAuthLink = createAuthLink({
    auth: {
      type: 'OPENID_CONNECT',
      jwtToken: async () => await getAuthUserIdToken(),
    },
  })
  
  // decide which the proper link from above to use (directional link)
  const awsLink = ApolloLink.split((operation) => useIdTokenLink(operation), oidcAuthLink, apiAuthLink)

  // http link (the terminating link in the chain)
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_AWS_APPSYNC_GRAPHQL_ENDPOINT,
  })

  // create ApolloClient with AWS links and cache
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([ awsLink, httpLink ]),
    cache: cache,
    typeDefs: TYPE_DEFS,
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
