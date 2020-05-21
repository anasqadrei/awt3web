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

const FORM_FILE = "file"
const CREATE_SONG_IMAGE_MUTATION = gql`
  mutation createSongImage ($songId: ID!, $userId: ID!) {
    createSongImage(songId: $songId, userId: $userId) {
      id
    }
  }
`

export default function CreateSongImage() {
  const router = useRouter()

  // mutation
  const [createSongImage, { loading, error, data }] = useMutation(
    CREATE_SONG_IMAGE_MUTATION,
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
    const file = formData.get(FORM_FILE)
    form.reset()

    // set query variables
    const queryVariables = {
      // file: file,
      songId: router.query.id,
      userId: loggedOnUser.id,
    }

    // execute createSongImage and refetch getSong from the start for the new song image to be shown
    // update the cache is not easy
    createSongImage({
      variables: queryVariables,
      refetchQueries: () => [{
        query: GET_SONG_QUERY,
        variables: { id: router.query.id },
      }],
      awaitRefetchQueries: true,
    })
  }

  // show add a song image form
  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_FILE } type="file" accept="image/png, image/jpeg" required/>
      <button type="submit" disabled={ loading || (data && data.createSongImage) }>add a song image</button>
      { error && (<ErrorMessage/>) }
      {
        (data && data.createSongImage) && (
          <div>Image Added</div>
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
