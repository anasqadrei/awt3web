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

const SHARE_SONG_MUTATION = gql`
  mutation shareSong ($songId: ID!, $userId: ID!) {
    shareSong(songId: $songId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [shareSong, { loading, error }] = useMutation(
    SHARE_SONG_MUTATION,
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
  const handleShare = () => {
    // TODO: window.open() somehow
    // $scope.share('https://www.facebook.com/dialog/share?app_id=726940310703987&display=popup&redirect_uri=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/close.html') + '&href=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));
    // $scope.share('https://twitter.com/share?via=awtarika&lang=ar&text=' + $scope.data.title + '&url=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));

    // execute mutation and update the cache
    shareSong({
      variables: {
        userId: loggedOnUser.id,
        songId: props.songId,
      },
      update: (cache, { data: { shareSong } }) => {
        // if a successful share, update shares counter in the cache
        if (shareSong) {
          cache.modify({
            id: cache.identify(getSong),
            fields: {
              shares(currentValue = 0) {
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
      <div>
        { getSong.shares ? `${ getSong.shares } shared this` : `be the first to share` }
      </div>

      <div>
        Share
        <button onClick={ () => handleShare('Facebook') } disabled={ loading }>
          Facebook
        </button>
        <button onClick={ () => handleShare('Twitter') } disabled={ loading }>
          Twitter
        </button>
      </div>

      <div>
        <span dir="ltr"><input value={ getSong.url } readOnly/></span>
      </div>
    </section>
  )
}
