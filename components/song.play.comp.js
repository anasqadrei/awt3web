import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_SONG_QUERY } from 'lib/graphql'

const PLAY_SONG_MUTATION = gql`
  mutation playSong ($songId: ID!, $userId: ID) {
    playSong(songId: $songId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [playSong, { loading }] = useMutation(
    PLAY_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

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
  const handlePlay = () => {
    // TODO: stream song

    // execute mutation and update the cache
    playSong({
      variables: {
        userId: getAuthUser?.id,
        songId: props.songId,
      },
      update: (cache, { data: { playSong } }) => {
        // if a successful play, update plays counter in the cache
        if (playSong) {
          cache.modify({
            id: cache.identify(getSong),
            fields: {
              plays(currentValue = 0) {
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
      <button onClick={ () => handlePlay() } disabled={ loading }>
        Play
      </button>

      { getSong.plays ? `played ${ getSong.plays } times` : `be the first to play` }
    </section>
  )
}
