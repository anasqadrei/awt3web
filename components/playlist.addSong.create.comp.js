import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import { GET_PLAYLIST_QUERY } from 'components/playlist.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_NAME = "name"
const FORM_PRIVACY = "privacy"
const CREATE_PLAYLIST_MUTATION = gql`
  mutation createPlaylist ($name: String!, $desc: String, $privacy: Boolean!, $userId: ID!) {
    createPlaylist(name: $name, desc: $desc, private: $privacy, userId: $userId) {
      id
    }
  }
`
const ADD_SONG_TO_PLAYLIST_MUTATION = gql`
  mutation addSongToPlaylist ($playlistId: ID!, $songId: ID!) {
    addSongToPlaylist(playlistId: $playlistId, songId: $songId) {
      id
      name
      slug
    }
  }
`

export default function AddSongToCreatedPlaylist(props) {
  // 1. create playlist mutation
  const [createPlaylist, { loading: loadingCreate, error: errorCreate }] = useMutation(
    CREATE_PLAYLIST_MUTATION,
    {
      onCompleted: (data) => {
        // set add song query variables
        const addSongQueryVariables = {
          playlistId: data.createPlaylist.id,
          songId: props.song.id,
        }
        // execute addSongToPlaylist
        addSongToPlaylist({
          variables: addSongQueryVariables,
        })
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  // 2. add song to playlist mutation
  const [addSongToPlaylist, { loading: loadingAddSong, error: errorAddSong, data: dataAddSong }] = useMutation(
    ADD_SONG_TO_PLAYLIST_MUTATION,
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
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // set query variables
    const createPlaylistQueryVariables = {
      name: name,
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

    // execute createPlaylist and fetch all user's playlists for the new one to show
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
      playlist name: <input name={ FORM_NAME } type="text" disabled={ loadingCreate || loadingAddSong || dataAddSong } maxLength="50" placeholder="playlist name here" required/>
      <input name={ FORM_PRIVACY } type="checkbox" disabled={ loadingCreate || loadingAddSong || dataAddSong } defaultChecked={ true }/> private playlist
      <button type="submit" disabled={ loadingCreate || loadingAddSong || dataAddSong }>add to playlist</button>
      { (errorCreate || errorAddSong) && (<ErrorMessage/>) }
      { (!errorAddSong && dataAddSong) && (
        <div>
          Song
          <Link href="/song/[id]/[slug]" as={ `/song/${ props.song.id }/${ props.song.slug }` }>
            <a>{ props.song.title }</a>
          </Link>
          -
          <Link href="/artist/[id]/[slug]" as={ `/artist/${ props.song.artist.id }/${ props.song.artist.slug }` }>
            <a>{ props.song.artist.name }</a>
          </Link>
          was added to playlist
          <Link href="/playlist/[id]/[slug]" as={ `/playlist/${ dataAddSong.addSongToPlaylist.id }/${ dataAddSong.addSongToPlaylist.slug }` }>
            <a>{ dataAddSong.addSongToPlaylist.name }</a>
          </Link>
          successfully!!
        </div>
      )}
    </form>
  )
}
