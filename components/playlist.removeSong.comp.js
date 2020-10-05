import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

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

const Comp = (props) => {
  // mutation tuple
  const [removeSongFromPlaylist, { loading, error }] = useMutation(
    REMOVE_SONG_FROM_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

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
    <div hidden={ !(getAuthUser?.id === props.playlist.user.id || getAuthUser?.admin) }>
      <button onClick={ () => handleRemove() } disabled={ loading }>
        Remove Song
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}

export default Comp