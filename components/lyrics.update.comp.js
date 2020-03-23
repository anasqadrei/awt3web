import React, { useState } from 'react'
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
const UPDATE_LYRICS_MUTATION = gql`
  mutation updateLyrics ($lyricsId: ID!, $content: String!, $userId: ID!) {
    updateLyrics(lyricsId: $lyricsId, content: $content, userId: $userId) {
      id
    }
  }
`

// to track changes in props.lyrics.content
let oldPropsLyricsContent

export default function UpdateLyrics(props) {
  // set props.lyrics.content in a state variable (stateContent)
  const [stateContent, setStateContent] = useState(props.lyrics.content.replace(/<br\/>/g, '\n'))

  // if props.lyrics.content changes from outside then reset state variable (stateContent) to the new props.lyrics.content
  // it does not automaically happen
  if (oldPropsLyricsContent != props.lyrics.content) {
    oldPropsLyricsContent = props.lyrics.content
    setStateContent(props.lyrics.content.replace(/<br\/>/g, '\n'))
  }
  const router = useRouter()

  // mutation
  const [updateLyrics, { loading, error }] = useMutation(
    UPDATE_LYRICS_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling change in content. "onChange" must be used with "value" at textarea
  const contentChangeHandler = event => {
    setStateContent(event.target.value)
  }

  // handling submit event
  const handleSubmit = event => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const content = formData.get(FORM_CONTENT).replace(/\n/g, '<br/>')

    // set query variables
    const queryVariables = {
      lyricsId: props.lyrics.id,
      content: content,
      userId: loggedOnUser.id,
    }

    // execute updateLyrics and refetch getSong from the start for the new lyrics to be shown
    // update the cache is not easy but can be done
    updateLyrics({
      variables: queryVariables,
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: router.query.id },
      }],
      awaitRefetchQueries: true,
    })
  }

  // show update lyrics form
  return (
    <form onSubmit={ handleSubmit }>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.lyrics.user.id }>
        <textarea name={ FORM_CONTENT } type="text" disabled={ loading } row="20" maxLength="500" value={ stateContent } onChange={ contentChangeHandler } placeholder="lyrics here" required/>
        <button type="submit" disabled={ loading }>update lyrics</button>
        { error && (<ErrorMessage/>) }
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
