import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'components/song.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const DELETE_LYRICS_MUTATION = gql`
  mutation deleteLyrics ($lyricsId: ID!, $userId: ID!) {
    deleteLyrics(lyricsId: $lyricsId, userId: $userId)
  }
`

export default function DeleteLyrics(props) {
  const router = useRouter()

  // mutation
  const [deleteLyrics, { loading, error }] = useMutation(
    DELETE_LYRICS_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling delete event
  const deleteHandler = event => {
    if (confirm("Are you sure?")) {
      // set query variables
      const queryVariables = {
        lyricsId: props.lyrics.id,
        userId: loggedOnUser.id,
      }

      // execute deleteLyrics and refetch getSong from the start for the deleted lyrics to be removed
      // update the cache is not easy
      deleteLyrics({
        variables: queryVariables,
        refetchQueries: () => [{
          query: GET_SONG_QUERY,
          variables: { id: router.query.id },
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  // show delete lyrics button
  return (
    <div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.lyrics.user.id }>
        <button onClick={ () => deleteHandler() } disabled={ loading }>
          Delete Lyrics
        </button>
        { error && (<ErrorMessage/>) }
      </div>
    </div>
  )
}
