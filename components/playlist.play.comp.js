import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
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

const PLAY_PLAYLIST_MUTATION = gql`
  mutation playPlaylist ($playlistId: ID!, $userId: ID!) {
    playPlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default function PlayPlaylist(props) {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    playlistId: router.query.id,
  }

  // play mutation
  const [playPlaylist, { loading, error }] = useMutation(
    PLAY_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling play event
  const playHandler = () => {
    // TODO: stream playlist
    // execute playPlaylist and update plays counter in the cache
    playPlaylist({
      variables: queryVariables,
      update: (proxy, { data: { playPlaylist } }) => {
        // if successful play, update playlist plays cache
        if (playPlaylist) {
          // read cache
          const data = proxy.readQuery({
            query: GET_PLAYLIST_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getPlaylist.plays
          proxy.writeQuery({
            query: GET_PLAYLIST_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getPlaylist: {
                ...data.getPlaylist,
                plays: data.getPlaylist.plays + 1,
              }
            },
          })
        }
      },
    })
  }

  // play button
  return (
    <button onClick={ () => playHandler() } disabled={ loading }>
      { props.shuffle ? 'Shuffle' : 'Play All' }
    </button>
  )
}
