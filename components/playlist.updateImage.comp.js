import { useState } from 'react'
import { gql, useApolloClient, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import { GET_UPLOAD_SIGNED_URL_QUERY } from 'lib/graphql'
import { getUploadFileId } from 'lib/uploadFile'
import ErrorMessage from 'components/errorMessage'

const FORM_FILE = "file"
const UPDATE_PLAYLIST_MUTATION = gql`
  mutation updatePlaylist ($playlistId: ID!, $playlist: PlaylistInput!, $userId: ID!) {
    updatePlaylist(playlistId: $playlistId, playlist: $playlist, userId: $userId) {
      id
      imageUrl
    }
  }
`

const Comp = (props) => {
  // upload state variables
  const [loadingGetUrl, setLoadingGetUrl] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorUpload, setErrorUpload] = useState(false)

  // apollo client for query later
  const apolloClient = useApolloClient()

  // mutation tuple
  const [updatePlaylist, { loading, error: errorUpdate, data }] = useMutation(
    UPDATE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onClick event
  const handleRemoveImage = () => {
    if (confirm("Are you sure?")) {
      // execute mutation and update the cache
      updatePlaylist({
        variables: {
          playlistId: props.playlist.id,
          playlist: {
            imageFile: ` `,
          },
          userId: getAuthUser?.id,
        },
        update: (cache, { data: { updatePlaylist } }) => {
          // update the cache with the new image
          cache.modify({
            id: cache.identify(props.playlist),
            fields: {
              imageUrl() {
                return updatePlaylist.imageUrl
              },
            }
          })
        }
      })
    }
  }

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = async (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const file = formData.get(FORM_FILE)
    form.reset()

    // get signed URL to upload the file to
    setLoadingGetUrl(true)
    const { data } = await apolloClient.query({
      fetchPolicy: 'no-cache',
      query: GET_UPLOAD_SIGNED_URL_QUERY,
    })

    // using XMLHttpRequest rather than fetch() for its onprogress event
    const xhr = new XMLHttpRequest()

    // xhr event: track upload progress
    xhr.upload.onprogress = function(event) {
      setUploadProgress(Math.trunc((event.loaded / event.total) * 100))
    }

    // xhr event: track completion: both successful or not
    xhr.onloadend = function() {
      if (xhr.status == 200) {
        // execute mutation and update the cache
        updatePlaylist({
          variables: {
            playlistId: props.playlist.id,
            playlist: {
              imageFile: getUploadFileId(data.getUploadSignedURL),
            },
            userId: getAuthUser?.id,
          },
          update: (cache, { data: { updatePlaylist } }) => {
            // update the cache with the new image
            cache.modify({
              id: cache.identify(props.playlist),
              fields: {
                imageUrl() {
                  return updatePlaylist.imageUrl
                },
              }
            })
          }
        })
      } else {
        // report file wasn't uploaded
        setErrorUpload(true)
        Sentry.captureMessage(xhr.responseText)
      }

      // reset
      setLoadingGetUrl(false)
    }

    // upload file
    xhr.open(`PUT`, data?.getUploadSignedURL)
    xhr.send(file)
  }

  // display component
  return (
    <div hidden={ getAuthUser?.id !== props.playlist.user.id }>
      <button onClick={ () => handleRemoveImage() } disabled={ !props.playlist.imageUrl || loadingGetUrl || uploadProgress > 0 || loading || data?.updatePlaylist }>
        Remove Image
      </button>

      <form onSubmit={ handleSubmit }>
        <input name={ FORM_FILE } type="file" accept="image/jpeg" required disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.updatePlaylist }/>
        <button type="submit" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.updatePlaylist }>
          Add playlist Image
        </button>
      </form>

      { loadingGetUrl && <div>get signed url (design this)</div> }
      { uploadProgress > 0 && <div>uploading { uploadProgress }%</div> }
      { loading && <div>mutating (design this)</div> }
      { (errorUpload || errorUpdate) && <ErrorMessage/> }
      { data?.updatePlaylist && <div>Image Added/Removed</div> }
    </div>
  )
}

export default Comp