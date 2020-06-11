import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const DELETE_SONG_IMAGE_MUTATION = gql`
  mutation deleteSongImage ($songImageId: ID!, $userId: ID!) {
    deleteSongImage(songImageId: $songImageId, userId: $userId)
  }
`

export default function DeleteSongImage(props) {
  const router = useRouter()

  // mutation
  const [deleteSongImage, { loading, error, data }] = useMutation(
    DELETE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling delete event
  const deleteHandler = event => {
    if (confirm("Are you sure?")) {
      // set query variables
      const queryVariables = {
        songImageId:  props.image.id,
        userId: loggedOnUser.id,
      }

      // execute deleteSongImage and refetch getSong from the start for the deleted song image to be removed
      // update the cache is not easy
      deleteSongImage({
        variables: queryVariables,
        refetchQueries: () => [{
          query: GET_SONG_QUERY,
          variables: { id: router.query.id },
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  // show delete a song image button
  return (
    <div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.image.user.id }>
        <button onClick={ () => deleteHandler() } disabled={ loading || (data && data.deleteSongImage) }>
          X delete
        </button>
        { error && (<ErrorMessage/>) }
        {
          (data && data.deleteSongImage) && (
            <div>songImage is being Deleted. Check later(won't show instantly)</div>
          )
        }
      </div>
    </div>
  )
}
