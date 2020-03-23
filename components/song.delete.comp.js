import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const DELETE_SONG_MUTATION = gql`
  mutation deleteSong ($songId: ID!, $userId: ID!) {
    deleteSong(songId: $songId, userId: $userId)
  }
`

export default function DeleteSong(props) {
  const router = useRouter()

  // mutation
  const [deleteSong, { loading, error }] = useMutation(
    DELETE_SONG_MUTATION,
    {
      onCompleted: (data) => {
        // TODO: redirect or what?
      },
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
        songId: router.query.id,
        userId: loggedOnUser.id,
      }

      // execute deleteSong
      deleteSong({
        variables: queryVariables,
      })
    }
  }

  // show delete song button
  return (
    <div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.song.user.id }>
        <button onClick={ () => deleteHandler() } disabled={ loading }>
          Delete Song
        </button>
        { error && (<ErrorMessage/>) }
      </div>
    </div>
  )
}
