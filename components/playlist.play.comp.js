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

const PLAY_PLAYLIST_MUTATION = gql`
  mutation playPlaylist ($playlistId: ID!, $userId: ID!) {
    playPlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [playPlaylist, { loading, error }] = useMutation(
    PLAY_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

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
  const handlePlay = () => {
    // TODO: stream playlist

    // execute mutation and update the cache
    playPlaylist({
      variables: {
        userId: loggedOnUser.id,
        playlistId: props.playlistId,
      },
      update: (cache, { data: { playPlaylist } }) => {
        // if a successful play, update plays counter in the cache
        if (playPlaylist) {
          cache.modify({
            id: cache.identify(getPlaylist),
            fields: {
              plays(currentValue = 0) {
                return currentValue + 1
              },
            }
          })
        }
      },
    })
  }

  // display component
  return (
    <button onClick={ () => handlePlay() } disabled={ loading }>
      { props.shuffle ? 'Shuffle' : 'Play All' }
    </button>
  )
}
