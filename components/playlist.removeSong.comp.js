import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
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

export default (props) => {
  // mutation tuple
  const [removeSongFromPlaylist, { loading, error }] = useMutation(
    REMOVE_SONG_FROM_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onClick event
  const handleRemove = () => {
    if (confirm("Are you sure?")) {
      // execute mutation and update the cache
      removeSongFromPlaylist({
        variables: {
          playlistId: props.playlist.id,
          songId: props.song.id,
          index: props.index,
        },
        update: (cache, { data: { removeSongFromPlaylist } }) => {
          // write to cache
          cache.writeQuery({
            query: GET_PLAYLIST_QUERY,
            variables: { id: props.playlist.id },
            data: removeSongFromPlaylist,
          })
        },
      })
    }
  }

  // display component
  return (
    <div hidden={ !(loggedOnUser?.id === props.playlist.user.id || loggedOnUser?.admin) }>
      <button onClick={ () => handleRemove() } disabled={ loading }>
        Remove Song
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}
