import Router from 'next/router'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_TITLE = "title"
const FORM_ARTIST = "artist"
const FORM_DESC = "desc"
const FORM_FILE = "file"
const CREATE_SONG_MUTATION = gql`
  mutation createSong ($title: String!, $artist: String!, $desc: String!, $userId: ID!) {
    createSong(title: $title, artist: $artist, desc: $desc, userId: $userId) {
      id
      slug
    }
  }
`

export default () => {
  // mutation tuple
  const [createSong, { loading, error, data }] = useMutation(
    CREATE_SONG_MUTATION,
    {
      onCompleted: (data) => {
        Router.push(`/song/[id]/[slug]`, `/song/${ data.createSong.id }/${ data.createSong.slug }`)
      },
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
    const title = formData.get(FORM_TITLE)
    const artist = formData.get(FORM_ARTIST)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const file = formData.get(FORM_FILE)

    // execute mutation
    createSong({
      variables: {
        title: title,
        artist: artist,
        desc: desc,
        userId: loggedOnUser.id,
        // file: file,
      },
    })
  }

  // display component
  // TODO: check the audio file type after setting up the streaming
  // TODO: confirmation on this component or another?
  return (
    <form onSubmit={ handleSubmit }>
      file: <input name={ FORM_FILE } type="file" disabled={ loading } accept="audio/*" required/>
      song title: <input name={ FORM_TITLE } type="text" disabled={ loading } maxLength="50" placeholder="title here" required/>
      artist name: <input name={ FORM_ARTIST } type="text" disabled={ loading } maxLength="50" placeholder="artist here" required/>
      description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" placeholder="desc here" required/>
      Name: { loggedOnUser.username }
      <input type="checkbox" disabled={ loading } required/> I have the rights

      {/*
      <div>
        Confirmation
        <p>song title: blah blaj</p>
        <p>artist name: john doe</p>
        <p>description: text text tex #hashtag text text #hash_tag blah</p>
        <p>uploader: user name</p>
        <p>file: file name.mp3</p>
        <p>size: 4MB</p>
      </div>
      */}

      <button type="submit" disabled={ loading || data?.createSong }>
        Add Song
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.createSong && <div>song added. redirect shortly</div> }

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
