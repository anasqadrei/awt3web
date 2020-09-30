import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

const DELETE_LYRICS_MUTATION = gql`
  mutation deleteLyrics ($lyricsId: ID!, $userId: ID!) {
    deleteLyrics(lyricsId: $lyricsId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuble
  const [deleteLyrics, { loading, error, data }] = useMutation(
    DELETE_LYRICS_MUTATION,
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
      // refetch getSong because updating list of lyrics in cache is a hassle
      deleteLyrics({
        variables: {
          lyricsId: props.lyrics.id,
          userId: getAuthUser?.id,
        },
        refetchQueries: () => [{
          query: GET_SONG_QUERY,
          variables: { id: props.songId },
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  // display component
  return (
    <div hidden={ !(getAuthUser?.id === props.lyrics.user.id || getAuthUser?.admin) }>
      <button onClick={ () => handleDelete() } disabled={ loading || data?.deleteLyrics }>
        Delete Lyrics
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.deleteLyrics && <div>Lyrics is being Deleted. Check later(won't show instantly)</div> }
    </div>
  )
}
