import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'

const PLAY_PLAYLIST_MUTATION = gql`
  mutation playPlaylist ($playlistId: ID!, $userId: ID) {
    playPlaylist(playlistId: $playlistId, userId: $userId)
  }
`

const Comp = (props) => {
  // mutation tuple
  const [playPlaylist, { loading }] = useMutation(
    PLAY_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

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
        userId: getAuthUser?.id,
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

export default Comp