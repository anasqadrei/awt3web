import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from './song.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_CONTENT = "content"
const CREATE_LYRICS_MUTATION = gql`
  mutation createLyrics ($songId: ID!, $content: String!, $userId: ID!) {
    createLyrics(songId: $songId, content: $content, userId: $userId) {
      id
    }
  }
`

export default function CreateLyrics() {
  const router = useRouter()

  // mutation
  const [createLyrics, { loading, error, data }] = useMutation(
    CREATE_LYRICS_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling submit event
  const handleSubmit = event => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const content = formData.get(FORM_CONTENT).replace(/\n/g, '<br/>')
    form.reset()

    // set query variables
    const queryVariables = {
      songId: router.query.id,
      content: content,
      userId: loggedOnUser.id,
    }

    // execute createLyrics and refetch getSong from the start for the new lyrics to be shown
    // update the cache is not easy
    createLyrics({
      variables: queryVariables,
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: router.query.id },
      }],
      awaitRefetchQueries: true,
    })
  }

  // show add lyrics form
  return (
    <form onSubmit={ handleSubmit }>
      <textarea name={ FORM_CONTENT } type="text" row="20" maxLength="500" placeholder="lyrics here" required />
      <button type="submit" disabled={ loading || (data && data.createLyrics) }>add lyrics</button>
      { error && (<ErrorMessage/>) }
      {
        (data && data.createLyrics) && (
          <div>Lyrics Added</div>
        )
      }
      <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
        }
        input {
          display: block;
        }
      `}</style>
    </form>
  )
}
