import { useState } from 'react'
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
const UPDATE_LYRICS_MUTATION = gql`
  mutation updateLyrics ($lyricsId: ID!, $content: String!, $userId: ID!) {
    updateLyrics(lyricsId: $lyricsId, content: $content, userId: $userId) {
      id
    }
  }
`

export default (props) => {
  // set props.lyrics.content in a state variable (stateContent)
  const [stateContent, setStateContent] = useState(props.lyrics.content.replace(/<br\/>/g, '\n'))

  // to track changes in props.lyrics.content
  const [oldContent, setOldContent] = useState(props.lyrics.content)

  // if props.lyrics.content changes from outside, then reset state variable (stateContent) to the new props.lyrics.content
  // it does not automaically happen
  if (oldContent != props.lyrics.content) {
    setOldContent(props.lyrics.content)
    setStateContent(props.lyrics.content.replace(/<br\/>/g, '\n'))
  }

  // mutation tuble
  const [updateLyrics, { loading, error, data }] = useMutation(
    UPDATE_LYRICS_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onChange event
  const handleContentChange = (event) => {
    // handling change in content related to the issue of <br> in HTML and new line is textarea
    // "onChange" must be used with "value" at textarea
    setStateContent(event.target.value)
  }

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const content = formData.get(FORM_CONTENT).replace(/\n/g, '<br/>')

    // execute mutation
    // refetch getSong because updating list of lyrics in cache is a hassle
    updateLyrics({
      variables: {
        lyricsId: props.lyrics.id,
        content: content,
        userId: loggedOnUser.id,
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
    <form onSubmit={ handleSubmit }>
      <div hidden={ !(loggedOnUser?.id === props.lyrics.user.id || loggedOnUser?.admin) }>
        <textarea name={ FORM_CONTENT } type="text" disabled={ loading } row="20" maxLength="500" value={ stateContent } onChange={ (event) => handleContentChange(event) } placeholder="lyrics here" required/>
        <button type="submit" disabled={ loading || data?.updateLyrics }>
          Update Lyrics
        </button>

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.updateLyrics && <div>Lyrics updated. Check later(won't apear instantly)</div> }
      </div>

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
