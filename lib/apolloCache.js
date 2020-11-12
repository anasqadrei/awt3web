import { InMemoryCache } from '@apollo/client'
import { authUser, postLoginAction } from 'lib/localState'

// pagination helper
function concatPagination(keyArgs) {
    if (keyArgs === void 0) { keyArgs = false }

    return {
        keyArgs: keyArgs,
        merge: function (existing, incoming, { variables }) {
          if (variables.page === 1) {
            // special case for refetchQueries. if it's the first page just return the incoming (because existing have old values)
            // BUG: wait for apollo to fix it
            return incoming || []
          } else {
            // merge existing and incoming
            return [...existing || [], ...incoming || []]
          }
        },
    }
}

// cache related
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listArtists: concatPagination(['sort']),
        listArtistSongs: concatPagination(['artistId', 'sort']),
        listUserLikedArtists: concatPagination(['userId', 'sort']),
        listUserPlayedArtists: concatPagination(['userId', 'sort']),
        listBlogposts: concatPagination(['sort']),
        listComments: concatPagination(['reference']),
        listUserLyrics: concatPagination(['userId']),
        listHashtagPlaylists: concatPagination(['hashtag', 'sort']),
        listHashtagSongs: concatPagination(['hashtag', 'sort']),
        searchArtists: concatPagination(['query']),
        searchSongs: concatPagination(['query']),
        searchLyrics: concatPagination(['query']),
        searchPlaylists: concatPagination(['query']),
        listUserPlaylists: concatPagination(['userId', 'private', 'sort']),
        listUserLikedPlaylists: concatPagination(['userId', 'sort']),
        listUserSongs: concatPagination(['userId', 'sort']),
        listUserLikedSongs: concatPagination(['userId', 'sort']),
        listUserPlayedSongs: concatPagination(['userId', 'sort']),
        listUserDownloadedSongs: concatPagination(['userId', 'sort']),
        listUserSongImages: concatPagination(['userId']),
        getAuthUser() {
          return authUser()
        },
        getPostLoginAction() {
          return postLoginAction()
        },
      },
    },
    CommentReference: {
      keyFields: ['collection', 'id'],
    },
    UserSocialProfile: {
      keyFields: ['provider', 'providerId'],
    },
  },
})
