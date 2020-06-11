import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'
import { GET_SONG_QUERY } from 'lib/graphql'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const PLAY_SONG_MUTATION = gql`
  mutation playSong ($songId: ID!, $userId: ID!) {
    playSong(songId: $songId, userId: $userId)
  }
`

export default function PlaySong() {
  const router = useRouter()

  // this is to get number of plays
  // the query will most likey use cache
  const { data }  = useQuery (
    GET_SONG_QUERY,
    {
      variables: { id: router.query.id },
    }
  )
  const { getSong } = data

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    songId: router.query.id,
  }

  // play mutation
  const [playSong, { loading, error }] = useMutation(
    PLAY_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling play event
  const playHandler = () => {
    // TODO: stream song
    // execute playSong and update plays counter in the cache
    playSong({
      variables: queryVariables,
      update: (proxy, { data: { playSong } }) => {
        // if successful play, update song plays cache
        if (playSong) {
          // read cache
          const data = proxy.readQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getSong.plays
          proxy.writeQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getSong: {
                ...data.getSong,
                plays: data.getSong.plays + 1,
              }
            },
          })
        }
      },
    })
  }

  // play button
  return (
    <section>
      <button onClick={ () => playHandler() } disabled={ loading }>
        Play
      </button>
      { getSong.plays ? `played ${ getSong.plays } times` : `be the first to play` }
    </section>
  )
}
