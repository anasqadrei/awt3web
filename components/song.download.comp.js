import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'
import { GET_SONG_QUERY } from 'components/song.comp'

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

export default function DownloadSong() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    songId: router.query.id,
  }

  // download mutation
  const [downloadSong, { loading, error }] = useMutation(
    DOWNLOAD_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling download event
  const downloadHandler = () => {
    // TODO: download song
    // execute downloadSong and update downloads counter in the cache
    downloadSong({
      variables: queryVariables,
      update: (proxy, { data: { downloadSong } }) => {
        // if successful download, update song downloads cache
        if (downloadSong) {
          // read cache
          const data = proxy.readQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getSong.downloads
          proxy.writeQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getSong: {
                ...data.getSong,
                downloads: data.getSong.downloads + 1,
              }
            },
          })
        }
      },
    })
  }

  // download button
  return (
    <section>
      <button onClick={ () => downloadHandler() } disabled={ loading }>
        Download
      </button>
    </section>
  )
}
