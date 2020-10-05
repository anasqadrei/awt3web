import Router from 'next/router'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import ErrorMessage from 'components/errorMessage'

const DELETE_PLAYLIST_MUTATION = gql`
  mutation deletePlaylist ($playlistId: ID!, $userId: ID!) {
    deletePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

const Comp = (props) => {
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

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // function: handle onClick event
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      // execute mutation
      // refetch all user's playlists because updating list of lyrics in cache is a hassle
      deletePlaylist({
        variables: {
          playlistId: props.playlist.id,
          userId: getAuthUser?.id,
        },
        refetchQueries: () => [{
          query: LIST_USER_PLAYLISTS_QUERY,
          variables: {
            userId: getAuthUser?.id,
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
    <div hidden={ !(getAuthUser?.id === props.playlist.user.id || getAuthUser?.admin) }>
      <button onClick={ () => handleDelete() } disabled={ loading }>
        Delete Playlist
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}

export default Comp