import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

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

export default (props) => {
  // mutation tuple
  const [createLyrics, { loading, error, data }] = useMutation(
    CREATE_LYRICS_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const content = formData.get(FORM_CONTENT).replace(/\n/g, '<br/>')
    form.reset()

    // set query variables
    const queryVariables = {
      songId: props.songId,
      content: content,
      userId: loggedOnUser.id,
    }

    // execute mutation
    // refetch getSong because updating list of lyrics in cache is a hassle
    createLyrics({
      variables: queryVariables,
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: props.songId },
      }],
      awaitRefetchQueries: true,
    })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      <textarea name={ FORM_CONTENT } type="text" row="20" maxLength="500" placeholder="lyrics here" required />
      <button type="submit" disabled={ loading || data?.createLyrics }>
        Add Lyrics
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.createLyrics && <div>Lyrics Added. Check later(won't apear instantly)</div> }

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
