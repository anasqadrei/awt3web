import Router from 'next/router'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const DELETE_PLAYLIST_MUTATION = gql`
  mutation deletePlaylist ($playlistId: ID!, $userId: ID!) {
    deletePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuble
  const [deletePlaylist, { loading, error }] = useMutation(
    DELETE_PLAYLIST_MUTATION,
    {
      onCompleted: () => {
        Router.push(`/user/playlists-list`)
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onClick event
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      // execute mutation
      // refetch all user's playlists because updating list of lyrics in cache is a hassle
      deletePlaylist({
        variables: {
          playlistId: props.playlist.id,
          userId: loggedOnUser.id,
        },
        refetchQueries: () => [{
          query: LIST_USER_PLAYLISTS_QUERY,
          variables: {
            userId: loggedOnUser.id,
            private: props.playlist.private,
            page: 1,
            pageSize: PAGE_SIZE,
            sort: DEFAULT_SORT,
          },
        }],
        awaitRefetchQueries: false,
      })
    }
  }

  // display component
  return (
    <div hidden={ !(loggedOnUser?.id === props.playlist.user.id || loggedOnUser?.admin) }>
      <button onClick={ () => handleDelete() } disabled={ loading }>
        Delete Playlist
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}
