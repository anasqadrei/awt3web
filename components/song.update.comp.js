import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_TITLE = "title"
const FORM_ARTIST = "artist"
const FORM_DESC = "desc"
const UPDATE_SONG_MUTATION = gql`
  mutation updateSong ($songId: ID!, $title: String, $artist: String, $desc: String, $userId: ID!) {
    updateSong(songId: $songId, title: $title, artist: $artist, desc: $desc, userId: $userId) {
      id
    }
  }
`

export default (props) => {
  // mutation tuble
  const [updateSong, { loading, error, data }] = useMutation(
    UPDATE_SONG_MUTATION,
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
    const title = formData.get(FORM_TITLE)
    const artist = formData.get(FORM_ARTIST)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')

    // set query variables. update only what's changed
    const vars = {
      songId: props.song.id,
      userId: loggedOnUser.id,
    }

    if (title != props.song.title) {
      vars.title = title
    }
    if (artist != props.song.artist.name) {
      vars.artist = artist
    }
    if (desc != props.song.desc) {
      vars.desc = desc
    }

    // execute mutation
    // refetch getSong because updating the cache won't work in case artist was changed to a new one
    updateSong({
      variables: vars,
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: props.song.id },
      }],
      awaitRefetchQueries: true,
    })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      <div hidden={ !(loggedOnUser?.id === props.song.user.id || loggedOnUser?.admin) }>
        song title: <input name={ FORM_TITLE } type="text" disabled={ loading } maxLength="50" defaultValue={ props.song.title } placeholder="title here" required/>
        artist name: <input name={ FORM_ARTIST } type="text" disabled={ loading } maxLength="50" defaultValue={ props.song.artist.name } placeholder="artist here" required/>
        description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" defaultValue={ props.song?.desc?.replace(/<br\/>/g, '\n') } placeholder="desc here" required />
        <button type="submit" disabled={ loading || data?.updateSong }>
          Update Song
        </button>

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.updateSong && <div>Song Updated. Check later(won't show instantly)</div> }
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
