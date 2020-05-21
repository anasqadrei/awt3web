import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'
import { GET_PLAYLIST_QUERY } from 'components/playlist.comp'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const CHECK_USER_LIKE_PLAYLIST_QUERY = gql`
  query checkUserLikePlaylist ($userId: ID!, $playlistId: ID!) {
    checkUserLikePlaylist(userId: $userId, playlistId: $playlistId)
  }
`
const LIKE_PLAYLIST_MUTATION = gql`
  mutation likePlaylist ($playlistId: ID!, $userId: ID!) {
    likePlaylist(playlistId: $playlistId, userId: $userId)
  }
`
const UNLIKE_PLAYLIST_MUTATION = gql`
  mutation unlikePlaylist ($playlistId: ID!, $userId: ID!) {
    unlikePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default function LikePlaylist() {
  const router = useRouter()

  // set query variables (common for all)
  const queryVariables = {
    userId: loggedOnUser.id,
    playlistId: router.query.id,
  }

  // TODO: show the like always even if user wasn't logged in. direct to log them in
  // decide to either show or hide like and unlike buttons
  let hideLike = false
  if (loggedOnUser) {
    // check if user like playlist query
    const { data }  = useQuery (
      CHECK_USER_LIKE_PLAYLIST_QUERY,
      {
        variables: queryVariables,
      }
    )
    // hide like button if user already liked playlist
    if (data) {
      hideLike = data.checkUserLikePlaylist
    }
  }

  // like mutation
  const [likePlaylist, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const likeHandler = () => {
    // execute likePlaylist and update likes in the cache
    likePlaylist({
      variables: queryVariables,
      update: (proxy, { data: { likePlaylist } }) => {
        // if successful like (not a repeated one)
        if (likePlaylist) {
          // update checkUserLikePlaylist cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikePlaylist: true
            proxy.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikePlaylist: true,
              },
            })
          }
          // update playlist likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_PLAYLIST_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by incrementing getPlaylist.likes
            proxy.writeQuery({
              query: GET_PLAYLIST_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getPlaylist: {
                  ...data.getPlaylist,
                  likes: data.getPlaylist.likes + 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // unlike mutation
  const [unlikePlaylist, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const unlikeHandler = () => {
    // execute unlikePlaylist and update likes in the cache
    unlikePlaylist({
      variables: queryVariables,
      update: (proxy, { data: { unlikePlaylist } }) => {
        // if successful unlike (not a repeated one)
        if (unlikePlaylist) {
          // update checkUserLikePlaylist cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikePlaylist: false
            proxy.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikePlaylist: false,
              },
            })
          }
          // update playlist likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_PLAYLIST_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by decrementing getPlaylist.likes
            proxy.writeQuery({
              query: GET_PLAYLIST_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getPlaylist: {
                  ...data.getPlaylist,
                  likes: data.getPlaylist.likes - 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // like and unlike buttons
  return (
    <section>
      <button hidden={ hideLike } onClick={ () => likeHandler() } disabled={ loadingLike }>
        Like
      </button>
      { errorLike && (<ErrorMessage/>) }
      <button hidden={ !hideLike } onClick={ () => unlikeHandler() } disabled={ loadingUnlike }>
        Unlike
      </button>
      { errorUnlike && (<ErrorMessage/>) }
    </section>
  )
}
