import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser, postLoginAction, queryPostLoginAction } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import { GET_SONG_QUERY } from 'lib/graphql'

const POST_LOGIN_ACTION = 'DOWNLOAD_SONG'
const DOWNLOAD_SONG_MUTATION = gql`
  mutation downloadSong ($songId: ID!, $userId: ID!) {
    downloadSong(songId: $songId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [downloadSong, { loading }] = useMutation(
    DOWNLOAD_SONG_MUTATION,
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
  const handleDownload = () => {
    // TODO: download song

    // execute mutation and update the cache
    getAuthUser && downloadSong({
      variables: {
        userId: getAuthUser.id,
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

  // get post login action
  const getPostLoginAction = queryPostLoginAction()

  // if actions and properties match then reset and execute the action
  if (getAuthUser && getPostLoginAction?.action === POST_LOGIN_ACTION && getPostLoginAction?.id === props.songId && !loading) {
    //reset
    postLoginAction(null)
    //execute
    handleDownload()
  }

  // display component
  return (
    <section>
      {
        getAuthUser ? (
          <button onClick={ () => handleDownload() } disabled={ loading }>
            Download
          </button>
        ) : (
          <AuthUser buttonText="Download" postLoginAction={ { action: POST_LOGIN_ACTION, id: props.songId } }/>
        )
      }

      { getSong.downloads && `Downloaded ${ getSong.downloads } times` }
    </section>
  )
}
