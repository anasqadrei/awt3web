import { useState } from 'react'
import { gql, useApolloClient, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser } from 'lib/localState'
import { GET_UPLOAD_SIGNED_URL_QUERY } from 'lib/graphql'
import { getUploadFileId } from 'lib/uploadFile'
import ErrorMessage from 'components/errorMessage'

const FORM_FILE = "file"
const UPDATE_USER_MUTATION = gql`
  mutation updateUser ($userId: ID!, $user: UserInput!) {
    updateUser(userId: $userId, user: $user) {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`

const Comp = (props) => {
  // upload state variables
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorUpload, setErrorUpload] = useState(false)

  // apollo client for query later
  const apolloClient = useApolloClient()

  // mutation tuple
  const [updateUser, { loading, error: errorUpdate, data }] = useMutation(
    UPDATE_USER_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onClick event
  const handleRemoveImage = () => {
    if (confirm("Are you sure?")) {
      // execute mutation and update the cache
      updateUser({
        variables: {
          userId: props.user.id,
          user: {
            imageFile: ` `,
            lastSeenDate: new Date(),
          },
        },
        update: (_cache, { data: { updateUser } }) => {
          // update cache
          authUser(updateUser)
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

    // get signed URL to uoload the image file to
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
        updateUser({
          variables: {
            userId: props.user.id,
            user: {
              imageFile: getUploadFileId(data.getUploadSignedURL),
              lastSeenDate: new Date(),
            },
          },
          update: (_cache, { data: { updateUser } }) => {
            // update cache
            authUser(updateUser)
          }
        })
      } else {
        // report file wasn't uploaded
        setErrorUpload(true)
        Sentry.captureMessage(xhr.responseText)
      }
    }

    // upload file
    xhr.open(`PUT`, data?.getUploadSignedURL)
    xhr.send(file)
  }

  // display component
  return (
    <div>
      <button onClick={ () => handleRemoveImage() } disabled={ !props.user.imageUrl || uploadProgress > 0 || loading || data?.updateUser }>
        Remove Image
      </button>

      <form onSubmit={ handleSubmit }>
        <input name={ FORM_FILE } type="file" accept="image/jpeg" required disabled={ uploadProgress > 0 || loading || data?.updateUser }/>
        <button type="submit" disabled={ uploadProgress > 0 || loading || data?.updateUser }>
          Add User Image
        </button>
      </form>

      { uploadProgress > 0 && <div>uploading { uploadProgress }%</div> }
      { loading && <div>mutating (design this)</div> }
      { (errorUpload || errorUpdate) && <ErrorMessage/> }
      { data?.updateUser && <div>Image Added/Removed</div> }
    </div>
  )
}

export default Comp