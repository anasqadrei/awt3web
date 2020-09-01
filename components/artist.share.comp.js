import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_ARTIST_QUERY } from 'lib/graphql'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const SHARE_ARTIST_MUTATION = gql`
  mutation shareArtist ($artistId: ID!, $userId: ID!) {
    shareArtist(artistId: $artistId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuples
  const [shareArtist, { loading, error }] = useMutation(
    SHARE_ARTIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // excute query to display data. the query will most likey use cache
  const { data }  = useQuery (
    GET_ARTIST_QUERY,
    {
      variables: { id: props.artistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getArtist) {
    return null
  }

  // get data
  const { getArtist } = data

  // function: handle onClick event
  const handleShare = () => {
    // TODO: window.open() somehow
    // $scope.share('https://www.facebook.com/dialog/share?app_id=726940310703987&display=popup&redirect_uri=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/close.html') + '&href=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));
    // $scope.share('https://twitter.com/share?via=awtarika&lang=ar&text=' + $scope.data.title + '&url=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));

    // execute mutation and update the cache
    shareArtist({
      variables: {
        userId: loggedOnUser.id,
        artistId: props.artistId,
      },
      update: (cache, { data: { shareArtist } }) => {
        // if a successful share, update artist shares counter in the cache
        if (shareArtist) {
          cache.modify({
            id: cache.identify(getArtist),
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
        { getArtist.shares ? `${ getArtist.shares } shared this` : `be the first to share` }
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
        <span dir="ltr"><input value={ getArtist.url } readOnly/></span>
      </div>
    </section>
  )
}
