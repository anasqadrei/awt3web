import { InMemoryCache } from '@apollo/client'
import { authUser } from 'lib/localState'

// TODO: array performance? [...a,...b]? or concat, or push? or what?
// pagination helper
function pushPagination(keyArgs) {
    if (keyArgs === void 0) { keyArgs = false }

    return {
        keyArgs: keyArgs,
        merge: function (existing, incoming, { variables }) {
          if (existing?.length && incoming?.length) {
            if (variables.page === 1) {
              // special case fo refetchQueries. if it's the first page just return the incoming (because existing have old values)
              // BUG: wait for apollo to fix it
              return incoming
            } else {
              // if both arrays have elements then merge them
              const merged = []
              merged.push(...existing, ...incoming)
              return merged
            }
          } else if (existing?.length && !incoming?.length) {
            // if only existing has elements then return it
            return existing
          } else if (!existing?.length && incoming?.length) {
            // if only incoming has elements then return it
            return incoming
          } else {
            // return an empty array if both are empty or null
            return []
          }
        },
    }
}

// cache related
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listArtists: pushPagination(['sort']),
        listArtistSongs: pushPagination(['artistId', 'sort']),
        listUserLikedArtists: pushPagination(['userId', 'sort']),
        listUserPlayedArtists: pushPagination(['userId', 'sort']),
        listBlogposts: pushPagination(['sort']),
        listComments: pushPagination(['reference']),
        listUserLyrics: pushPagination(['userId']),
        listHashtagPlaylists: pushPagination(['hashtag', 'sort']),
        listHashtagSongs: pushPagination(['hashtag', 'sort']),
        search: pushPagination(['query', 'indexes', 'userId']), // TODO: userId might be null. test
        listUserPlaylists: pushPagination(['userId', 'private', 'sort']),
        listUserLikedPlaylists: pushPagination(['userId', 'sort']),
        listUserSongs: pushPagination(['userId', 'sort']),
        listUserLikedSongs: pushPagination(['userId', 'sort']),
        listUserPlayedSongs: pushPagination(['userId', 'sort']),
        listUserDownloadedSongs: pushPagination(['userId', 'sort']),
        listUserSongImages: pushPagination(['userId']),
        getAuthUser() {
          return authUser()
        },
      },
    },
    CommentReference: {
      keyFields: ['collection', 'id'],
    },
    UserSocialProfile: {
      keyFields: ['provider', 'providerId'],
    },
    SearchResult: {
      keyFields: ['index', 'id'],
    },
  },
})
