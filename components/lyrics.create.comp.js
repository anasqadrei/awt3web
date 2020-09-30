import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_SONG_QUERY } from 'lib/graphql'
import AuthUser from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

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

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const content = formData.get(FORM_CONTENT).replace(/\n/g, '<br/>')
    form.reset()

    // execute mutation
    // refetch getSong because updating list of lyrics in cache is a hassle
    createLyrics({
      variables: {
        songId: props.songId,
        content: content,
        userId: getAuthUser.id,
      },
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: props.songId },
      }],
      awaitRefetchQueries: true,
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        <textarea name={ FORM_CONTENT } type="text" row="20" maxLength="500" placeholder="lyrics here" required/>
        {
          getAuthUser && (
            <button type="submit" disabled={ loading || data?.createLyrics }>
              Add Lyrics
            </button>
          )
        }

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.createLyrics && <div>Lyrics Added. Check later(won't apear instantly)</div> }
      </form>

      {
        !getAuthUser && (
          <div>
            سجل دخول لإضافة الكلمات!
            <AuthUser/>
          </div>
        )
      }

      <style jsx>{`
        input {
          display: block;
        }
      `}</style>
    </div>
  )
}
