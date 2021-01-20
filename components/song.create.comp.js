import { useState } from 'react'
import Router from 'next/router'
import { gql, useApolloClient, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_UPLOAD_SIGNED_URL_QUERY } from 'lib/graphql'
import { getUploadFileId } from 'lib/uploadFile'
import AuthUser from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

const FORM_TITLE = "title"
const FORM_ARTIST = "artist"
const FORM_DESC = "desc"
const FORM_FILE = "file"
const CREATE_SONG_MUTATION = gql`
  mutation createSong ($title: String!, $artist: String!, $desc: String!, $file: ID!, $userId: ID!) {
    createSong(title: $title, artist: $artist, desc: $desc, file: $file, userId: $userId) {
      id
      slug
    }
  }
`

const Comp = () => {
  // upload state variables
  const [loadingGetUrl, setLoadingGetUrl] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorUpload, setErrorUpload] = useState(false)

  // apollo client for query later
  const apolloClient = useApolloClient()

  // mutation tuple
  const [createSong, { loading, error: errorCreate, data }] = useMutation(
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

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = async (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const title = formData.get(FORM_TITLE)
    const artist = formData.get(FORM_ARTIST)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const file = formData.get(FORM_FILE)

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
        // execute mutation
        createSong({
          variables: {
            title: title,
            artist: artist,
            desc: desc,
            userId: getAuthUser?.id,
            file: getUploadFileId(data.getUploadSignedURL),
          },
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
  // TODO: confirmation on this component or another?
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        file: <input name={ FORM_FILE } type="file" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.createSong } accept="audio/mp3" required/>
        song title: <input name={ FORM_TITLE } type="text" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.createSong } maxLength="50" placeholder="title here" required/>
        artist name: <input name={ FORM_ARTIST } type="text" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.createSong } maxLength="50" placeholder="artist here" required/>
        description: <textarea name={ FORM_DESC } type="text" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.createSong } row="7" maxLength="500" placeholder="desc here" required/>
        Name: { getAuthUser?.username }
        <input type="checkbox" disabled={ loadingGetUrl || uploadProgress > 0 || loading || data?.createSong } required/> I have the rights

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

        <button type="submit" disabled={ !getAuthUser || loadingGetUrl || uploadProgress > 0 || loading || data?.createSong }>
          Add Song
        </button>

        { loadingGetUrl && <div>get signed url (design this)</div> }
        { uploadProgress > 0 && <div>uploading { uploadProgress }%</div> }
        { loading && <div>mutating (design this)</div> }
        { (errorUpload || errorCreate) && <ErrorMessage/> }
        { data?.createSong && <div>song added. redirect shortly</div> }      
      </form>

      {
        !getAuthUser && (
          <div>
            يرجى تسجيل الدخول أولا
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}

export default Comp