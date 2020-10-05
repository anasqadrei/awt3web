import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const DELETE_SONG_MUTATION = gql`
  mutation deleteSong ($songId: ID!, $userId: ID!) {
    deleteSong(songId: $songId, userId: $userId)
  }
`

const Comp = (props) => {
  // mutation tuble
  const [deleteSong, { loading, error, data }] = useMutation(
    DELETE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onClick event
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      // execute mutation
      deleteSong({
        variables: {
          songId: props.song.id,
          userId: getAuthUser?.id,
        },
      })
      // NOTE: deleted song could exist in many places in the cache such as artist list, new songs, playlists...
      // NOTE: remove all is a hassle. it will disapear at the next website visit anyway
    }
  }

  // display component
  return (
    <div hidden={ !(getAuthUser?.id === props.song.user.id || getAuthUser?.admin) }>
      <button onClick={ () => handleDelete() } disabled={ loading || data?.deleteSong }>
        Delete Song
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.deleteSong && <div>song is being Deleted. Check later(won't show instantly)</div> }
    </div>
  )
}

export default Comp