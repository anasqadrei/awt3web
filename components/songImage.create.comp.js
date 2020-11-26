import { gql, useApolloClient, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_SONG_QUERY, GET_UPLOAD_SIGNED_URL_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

const FORM_FILE = "file"
const CREATE_SONG_IMAGE_MUTATION = gql`
  mutation createSongImage ($songId: ID!, $userId: ID!) {
    createSongImage(songId: $songId, userId: $userId) {
      id
    }
  }
`

const Comp = (props) => {
  // apollo client for query later
  const apolloClient = useApolloClient()

  // mutation tuple
  const [createSongImage, { loading, error, data }] = useMutation(
    CREATE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = async (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const file = formData.get(FORM_FILE)
    form.reset()

    // get signed URL to uoload the image file to
    const { data } = await apolloClient.query({
      fetchPolicy: 'no-cache',
      query: GET_UPLOAD_SIGNED_URL_QUERY,
    })
    
    // using XMLHttpRequest rather than fetch() for its onprogress event
    const xhr = new XMLHttpRequest()

    // xhr event: track upload progress
    xhr.upload.onprogress = function(event) {
      console.log(`Uploaded ${ event.loaded } of ${ event.total } (${ Math.trunc((event.loaded/event.total)*100) }%)`);
    }

    // xhr event: track completion: both successful or not
    xhr.onloadend = function() {
      console.log(xhr);
      if (xhr.status == 200) {
        console.log("success");
        // console.log(data.getUploadSignedURL.match(/(?<=(\.com\/))(.+)(?=\?)/)[0]);
      } else {
        console.log("error " + this.status);
      }
    }

    // upload file
    xhr.open(`PUT`, data?.getUploadSignedURL)
    xhr.send(file)

    // // execute mutation
    // // refetch getSong because updating list of images in cache is a hassle
    // createSongImage({
    //   variables: {
    //     // TODO: file
    //     // file: file,
    //     songId: props.songId,
    //     userId: getAuthUser?.id,
    //   },
    //   refetchQueries: () => [{
    //     query: GET_SONG_QUERY,
    //     variables: { id: props.songId },
    //   }],
    //   awaitRefetchQueries: true,
    // })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_FILE } type="file" accept="image/png, image/jpeg" required/>
      <button type="submit" disabled={ loading || data?.createSongImage }>
        Add Song Image
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.createSongImage && <div>song-image added. Check later(won't show instantly)</div> }
    </form>
  )
}

export default Comp