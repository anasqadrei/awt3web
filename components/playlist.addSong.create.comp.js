import Link from 'next/link'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
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

export default (props) => {
  // mutation tuples
  const [createPlaylist, { loading: loadingCreate, error: errorCreate }] = useMutation(
    CREATE_PLAYLIST_MUTATION,
    {
      onCompleted: (data) => {
        // execute mutation
        addSongToPlaylist({
          variables: {
            playlistId: data.createPlaylist.id,
            songId: props.song.id,
          },
        })
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [addSongToPlaylist, { loading: loadingAddSong, error: errorAddSong, data: dataAddSong }] = useMutation(
    ADD_SONG_TO_PLAYLIST_MUTATION,
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
    const name = formData.get(FORM_NAME)
    const privacy = formData.get(FORM_PRIVACY) ? true : false

    // execute mutation
    // refetch all user's playlists because updating cache is a hassle
    createPlaylist({
      variables: {
        name: name,
        privacy: privacy,
        userId: loggedOnUser.id,
      },
      refetchQueries: () => [{
        query: LIST_USER_PLAYLISTS_QUERY,
        variables: {
          userId: loggedOnUser.id,
          private: privacy,
          page: 1,
          pageSize: PAGE_SIZE,
          sort: DEFAULT_SORT,
        }
      }],
      awaitRefetchQueries: false,
    })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      playlist name: <input name={ FORM_NAME } type="text" disabled={ loadingCreate || loadingAddSong || dataAddSong } maxLength="50" placeholder="playlist name here" required/>
      <input name={ FORM_PRIVACY } type="checkbox" disabled={ loadingCreate || loadingAddSong || dataAddSong } defaultChecked={ true }/> private playlist
      <button type="submit" disabled={ loadingCreate || loadingAddSong || dataAddSong }>
        Add to Playlist
      </button>

      { (errorCreate || errorAddSong) && <ErrorMessage/> }
      {
        dataAddSong && (
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
        )
      }
    </form>
  )
}
