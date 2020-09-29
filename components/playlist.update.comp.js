import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import ErrorMessage from 'components/errorMessage'

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

export default (props) => {
  // mutation tuble
  const [updatePlaylist, { loading, error, data }] = useMutation(
    UPDATE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const name = formData.get(FORM_NAME)
    const desc = formData.get(FORM_DESC).replace(/\n/g, '<br/>')
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // set query variables. update only what's changed
    const varsUpdatePlaylist = {
      playlistId: props.playlist.id,
      playlist: {},
    }
    const varsListPlaylists = {
      userId: getAuthUser?.id,
      page: 1,
      pageSize: PAGE_SIZE,
      sort: DEFAULT_SORT,
    }
    let moreRefetchQueries = []

    if (name != props.playlist.name) {
      varsUpdatePlaylist.playlist.name = name
    }
    if (desc != props.playlist.desc) {
      varsUpdatePlaylist.playlist.desc = desc.trim().length ? desc : ' '
    }
    if (privacy != props.playlist.private) {
      varsUpdatePlaylist.playlist.private = privacy
      // refetch all public and private for the cache to be correctly updated
      moreRefetchQueries = [{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: { ...varsListPlaylists, private: true },
      },
      {
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: { ...varsListPlaylists, private: false },
      }]
    }

    // execute mutation
    // refetch listUserPlaylists because updating privacy changes in cache is a hassle
    updatePlaylist({
      variables: varsUpdatePlaylist,
      refetchQueries: () => [
        {
          query: GET_PLAYLIST_QUERY,
          variables: { id: props.playlist.id },
        },
        ...moreRefetchQueries,
      ],
      awaitRefetchQueries: true,
    })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      <div hidden={ getAuthUser?.id !== props.playlist.user.id }>
        playlist name: <input name={ FORM_NAME } type="text" disabled={ loading } maxLength="50" defaultValue={ props.playlist.name } placeholder="playlist name here" required/>
        description: <textarea name={ FORM_DESC } type="text" disabled={ loading } row="7" maxLength="500" defaultValue={ props.playlist?.desc?.replace(/<br\/>/g, '\n') } placeholder="desc here"/>
        <input name={ FORM_PRIVACY } type="checkbox" disabled={ loading } defaultChecked={ props.playlist.private }/> private playlist
        <button type="submit" disabled={ loading || data?.updatePlaylist }>
          Update Playlist
        </button>

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.updatePlaylist && <div>Playlist Updated</div> }
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
