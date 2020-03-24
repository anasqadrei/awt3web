import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from './playlist.comp'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from './playlist.user.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

// TODO: still image and list of songs can be updated
const FORM_NAME = "name"
const FORM_DESC = "desc"
const FORM_PRIVACY = "privacy"
const UPDATE_PLAYLIST_MUTATION = gql`
  mutation updatePlaylist ($playlistId: ID!, $playlist: PlaylistInput!) {
    updatePlaylist(playlistId: $playlistId, playlist: $playlist) {
      id
    }
  }
`

export default function UpdatePlaylist(props) {
  const router = useRouter()

  // mutation
  const [updatePlaylist, { loading, error }] = useMutation(
    UPDATE_PLAYLIST_MUTATION,
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
    const name = formData.get(FORM_NAME)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // set query variables
    const updatePlaylistQueryVariables = {
      playlistId: router.query.id,
      playlist: {},
    }
    const listPlaylistsQueryVariables = {
      userId: loggedOnUser.id,
      page: 1,
      pageSize: PAGE_SIZE,
      sort: DEFAULT_SORT,
    }

    // update only what's changed
    if (name != props.playlist.name) {
      updatePlaylistQueryVariables.playlist.name = name
    }
    if (desc != props.playlist.desc) {
      updatePlaylistQueryVariables.playlist.desc = desc
    }
    let moreRefetchQueries = []
    if (privacy != props.playlist.private) {
      updatePlaylistQueryVariables.playlist.private = privacy
      // refetch all public and private for the cache to be correctly updated
      moreRefetchQueries = [{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: { ...listPlaylistsQueryVariables, private: true },
      },{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: { ...listPlaylistsQueryVariables, private: false },
      }]
    }

    // execute updatePlaylist and refetch getPlaylist
    // update the cache is hard when privace changes
    updatePlaylist({
      variables: updatePlaylistQueryVariables,
      refetchQueries: () => [{
        query: GET_PLAYLIST_QUERY,
        variables: { id: router.query.id },
      }, ...moreRefetchQueries],
      awaitRefetchQueries: true,
    })
  }

  // show update playlist form
  return (
    <form onSubmit={ handleSubmit }>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.playlist.user.id }>
        playlist name: <input name={ FORM_NAME } type="text" disabled={ loading } maxLength="50" defaultValue={ props.playlist.name } placeholder="playlist name here" required/>
        description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" defaultValue={ props.playlist.desc.replace(/<br\/>/g, '\n') } placeholder="desc here"/>
        <input name={ FORM_PRIVACY } type="checkbox" disabled={ loading } defaultChecked={ props.playlist.private }/> private playlist
        <button type="submit" disabled={ loading }>update playlist</button>
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
