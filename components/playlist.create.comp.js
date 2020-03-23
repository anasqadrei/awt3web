import Router from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from './playlist.user.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_NAME = "name"
const FORM_DESC = "desc"
const FORM_PRIVACY = "privacy"
const CREATE_PLAYLIST_MUTATION = gql`
  mutation createPlaylist ($name: String!, $desc: String, $privacy: Boolean!, $userId: ID!) {
    createPlaylist(name: $name, desc: $desc, private: $privacy, userId: $userId) {
      id
      slug
    }
  }
`

export default function CreatePlaylist() {
  // mutation
  const [createPlaylist, { loading, error }] = useMutation(
    CREATE_PLAYLIST_MUTATION,
    {
      onCompleted: (data) => {
        Router.push(`/playlist/[id]/[slug]`, `/playlist/${ data.createPlaylist.id }/${ data.createPlaylist.slug }`)
      },
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
    const name = formData.get(FORM_NAME)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // set query variables
    const createPlaylistQueryVariables = {
      name: name,
      desc: desc,
      privacy: privacy,
      userId: loggedOnUser.id,
    }
    const listPlaylistsQueryVariables = {
      userId: loggedOnUser.id,
      private: privacy,
      page: 1,
      pageSize: PAGE_SIZE,
      sort: DEFAULT_SORT,
    }

    // execute createPlaylist and fetch all user's list for the new one to show
    // update cache is not easy in case of lists
    createPlaylist({
      variables: createPlaylistQueryVariables,
      refetchQueries: () => [{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: listPlaylistsQueryVariables
      }],
      awaitRefetchQueries: false,
    })
  }

  // show create playlist form
  return (
    <form onSubmit={ handleSubmit }>
      playlist name: <input name={ FORM_NAME } type="text" disabled={ loading } maxLength="50" placeholder="playlist name here" required/>
      description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" placeholder="desc here"/>
      <input name={ FORM_PRIVACY } type="checkbox" disabled={ loading }/> private playlist
      <button type="submit" disabled={ loading }>add playlist</button>
      { error && (<ErrorMessage/>) }
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
