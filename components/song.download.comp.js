import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const DOWNLOAD_SONG_MUTATION = gql`
  mutation downloadSong ($songId: ID!, $userId: ID!) {
    downloadSong(songId: $songId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [downloadSong, { loading, error }] = useMutation(
    DOWNLOAD_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // excute query to display data. the query will most likey use cache
  const { data }  = useQuery (
    GET_SONG_QUERY,
    {
      variables: { id: props.songId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getSong) {
    return null
  }

  // get data
  const { getSong } = data

  // function: handle onClick event
  const handleDownload = () => {
    // TODO: download song

    // execute mutation and update the cache
    downloadSong({
      variables: {
        userId: loggedOnUser.id,
        songId: props.songId,
      },
      update: (cache, { data: { downloadSong } }) => {
        // if a successful download, update downloads counter in the cache
        if (downloadSong) {
          cache.modify({
            id: cache.identify(getSong),
            fields: {
              downloads(currentValue = 0) {
                return currentValue + 1
              },
            }
          })
        }
      },
    })
  }

  // display component
  return (
    <section>
      <button onClick={ () => handleDownload() } disabled={ loading }>
        Download
      </button>

      { getSong.downloads && `Downloaded ${ getSong.downloads } times` }
    </section>
  )
}
