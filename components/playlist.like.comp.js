import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

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

export default (props) => {
  // mutation tuples
  const [likePlaylist, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikePlaylist, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // TODO: what if user is not logged on
  // set common query variables
  const vars = {
    userId: loggedOnUser.id,
    playlistId: props.playlistId,
  }

  // TODO: show the like always even if user wasn't logged in. then direct to log them in. use skip??
  // decide to either show or hide like and unlike buttons
  let hideLike = false
  if (loggedOnUser) {
    // check if user like playlist query
    const { data }  = useQuery (
      CHECK_USER_LIKE_PLAYLIST_QUERY,
      {
        variables: vars,
        // skip: false,
      }
    )
    // hide like button if user already liked playlist
    hideLike = data?.checkUserLikePlaylist || false
  }

  // excute query to display data. the query will most likey use cache
  const { data }  = useQuery (
    GET_PLAYLIST_QUERY,
    {
      variables: { id: props.playlistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getPlaylist) {
    return null
  }

  // get data
  const { getPlaylist } = data

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    likePlaylist({
      variables: vars,
      update: (cache, { data: { likePlaylist } }) => {
        // if a successful like (not a repeated one)
        if (likePlaylist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getPlaylist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user liked playlist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikePlaylist = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleUnlike = () => {
    // execute mutation and update the cache
    unlikePlaylist({
      variables: vars,
      update: (cache, { data: { unlikePlaylist } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikePlaylist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getPlaylist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user liked playlist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikePlaylist = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // display component
  return (
    <section>
      <div>
        <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike }>
          Like
        </button>

        { loadingLike && <div>mutating (design this)</div> }
        { errorLike && <ErrorMessage/> }

        <button hidden={ !hideLike } onClick={ () => handleUnlike() } disabled={ loadingUnlike }>
          Unlike
        </button>

        { loadingUnlike && <div>mutating (design this)</div> }
        { errorUnlike && <ErrorMessage/> }
      </div>

      <div>
        { getPlaylist.likes ? `${ getPlaylist.likes } liked them` : `be the first to like? or empty?` }
      </div>
    </section>
  )
}
