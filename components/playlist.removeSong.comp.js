import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from 'components/playlist.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const REMOVE_SONG_FROM_PLAYLIST_MUTATION = gql`
  mutation removeSongFromPlaylist($playlistId: ID!, $songId: ID!, $index: Int!) {
    removeSongFromPlaylist(playlistId: $playlistId, songId: $songId, index: $index) {
      id
      name
      slug
      url
      imageUrl
      desc
      hashtags
      private
      duration
      createdDate
      lastUpdatedDate
      user {
        id
        username
        slug
      }
      songs {
        id
        title
        slug
        artist {
          id
          name
          slug
        }
        duration
        defaultImage {
          url
        }
      }
      comments
      plays
      usersPlayed
      likes
      shares
    }
  }
`

export default function RemoveSongFromPlaylist(props) {
  // mutation
  const [removeSongFromPlaylist, { loading, error }] = useMutation(
    REMOVE_SONG_FROM_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling remove song event
  const removeSongHandler = event => {
    if (confirm("Are you sure?")) {
      // set query variables
      const removeSongQueryVariables = {
        playlistId: props.playlist.id,
        songId: props.song.id,
        index: props.index,
      }
      const getPlaylistQueryVariables = {
        id: props.playlist.id,
      }

      // execute removeSongFromPlaylist and update playlist in cache for the song to be removed
      removeSongFromPlaylist({
        variables: removeSongQueryVariables,
        update: (proxy, { data: { removeSongFromPlaylist } }) => {
          // read cache
          const data = proxy.readQuery({
            query: GET_PLAYLIST_QUERY,
            variables: getPlaylistQueryVariables,
          })
          // update cache
          proxy.writeQuery({
            query: GET_PLAYLIST_QUERY,
            variables: getPlaylistQueryVariables,
            data: {
              ...data,
              getPlaylist: removeSongFromPlaylist,
            },
          })
        },
      })
    }
  }

  // show remove song button
  return (
    <div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.playlist.user.id }>
        <button onClick={ () => removeSongHandler() } disabled={ loading }>
          remove song
        </button>
        { error && (<ErrorMessage/>) }
      </div>
    </div>
  )
}
