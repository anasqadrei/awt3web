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

const SHARE_SONG_MUTATION = gql`
  mutation shareSong ($songId: ID!, $userId: ID!) {
    shareSong(songId: $songId, userId: $userId)
  }
`

export default function ShareSong() {
  const router = useRouter()

  // this is to get number of shares
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

  // share mutation
  const [shareSong, { loading, error }] = useMutation(
    SHARE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling share event
  const shareHandler = () => {
    // TODO: window.open() somehow
    // $scope.share('https://www.facebook.com/dialog/share?app_id=726940310703987&display=popup&redirect_uri=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/close.html') + '&href=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));
    // $scope.share('https://twitter.com/share?via=awtarika&lang=ar&text=' + $scope.data.title + '&url=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));

    // execute shareSong and update shares counter in the cache
    shareSong({
      variables: queryVariables,
      update: (proxy, { data: { shareSong } }) => {
        // if successful share, update song shares cache
        if (shareSong) {
          // read cache
          const data = proxy.readQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getSong.shares
          proxy.writeQuery({
            query: GET_SONG_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getSong: {
                ...data.getSong,
                shares: data.getSong.shares + 1,
              }
            },
          })
        }
      },
    })
  }

  // share buttons
  return (
    <section>
      <div>
        { getSong.shares ? `${ getSong.shares } shared this` : `be the first to share` }
      </div>
      <div>
        Share
        <button onClick={ () => shareHandler('Facebook') } disabled={ loading }>
          Facebook
        </button>
        <button onClick={ () => shareHandler('Twitter') } disabled={ loading }>
          Twitter
        </button>
      </div>
      <div>
        <span dir="ltr"><input value={ getSong.url } readOnly/></span>
      </div>
    </section>
  )
}
