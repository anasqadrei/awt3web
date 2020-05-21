import Router from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
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

export default function DeletePlaylist(props) {
  // mutation
  const [deletePlaylist, { loading, error }] = useMutation(
    DELETE_PLAYLIST_MUTATION,
    {
      onCompleted: (data) => {
        Router.push(`/user/playlists-list`)
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling delete event
  const deleteHandler = event => {
    if (confirm("Are you sure?")) {
      // set query variables
      const deletePlaylistQueryVariables = {
        playlistId: props.playlist.id,
        userId: loggedOnUser.id,
      }
      const listPlaylistsQueryVariables = {
        userId: loggedOnUser.id,
        private: props.playlist.private,
        page: 1,
        pageSize: PAGE_SIZE,
        sort: DEFAULT_SORT,
      }

      // execute deletePlaylist and fetch all user's list for the deleted one to disappear
      // update cache is not easy in case of lists
      deletePlaylist({
        variables: deletePlaylistQueryVariables,
        refetchQueries: () => [{
          query: LIST_USER_PLAYLISTS_QUERY,
          variables: listPlaylistsQueryVariables,
        }],
        awaitRefetchQueries: false,
      })
    }
  }

  // show delete playlist button
  return (
    <div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.playlist.user.id }>
        <button onClick={ () => deleteHandler() } disabled={ loading }>
          Delete Playlist
        </button>
        { error && (<ErrorMessage/>) }
      </div>
    </div>
  )
}
