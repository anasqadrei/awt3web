import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

const DELETE_SONG_IMAGE_MUTATION = gql`
  mutation deleteSongImage ($songImageId: ID!, $userId: ID!) {
    deleteSongImage(songImageId: $songImageId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [deleteSongImage, { loading, error, data }] = useMutation(
    DELETE_SONG_IMAGE_MUTATION,
    {
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
      // refetch getSong because updating list of images in cache is a hassle
      deleteSongImage({
        variables: {
          songImageId:  props.image.id,
          userId: getAuthUser.id,
        },
        refetchQueries: () => [{
          query: GET_SONG_QUERY,
          variables: { id: props.songId },
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  // display component
  return (
    <div hidden={ !(getAuthUser?.id === props.image.user.id || getAuthUser?.admin) }>
      <button onClick={ () => handleDelete() } disabled={ loading || data?.deleteSongImage }>
        X Delete Image
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.deleteSongImage && <div>songImage is being Deleted. Check later(won't show instantly)</div> }
    </div>
  )
}
