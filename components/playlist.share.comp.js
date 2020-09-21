import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'

const SHARE_PLAYLIST_MUTATION = gql`
  mutation sharePlaylist ($playlistId: ID!, $userId: ID!) {
    sharePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuple
  const [sharePlaylist, { loading }] = useMutation(
    SHARE_PLAYLIST_MUTATION,
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
    GET_PLAYLIST_QUERY,
    {
      variables: { id: props.playlistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getPlaylist) {
    return null
  }

  // get data
  const { getPlaylist } = data

  // function: handle onClick event
  const handleShare = () => {
    // TODO: window.open() somehow
    // $scope.share('https://www.facebook.com/dialog/share?app_id=726940310703987&display=popup&redirect_uri=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/close.html') + '&href=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));
    // $scope.share('https://twitter.com/share?via=awtarika&lang=ar&text=' + $scope.data.title + '&url=' + encodeURIComponent($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#!' + $location.url()));

    // execute mutation and update the cache
    getAuthUser && sharePlaylist({
      variables: {
        userId: getAuthUser.id,
        playlistId: props.playlistId,
      },
      update: (cache, { data: { sharePlaylist } }) => {
        // if a successful share, update shares counter in the cache
        if (sharePlaylist) {
          cache.modify({
            id: cache.identify(getPlaylist),
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
      {
        getPlaylist.private ?
          <div>
            { getPlaylist.shares && `${ getPlaylist.shares } shared this` }
          </div>
        :
          <div>
            Share
            <div>
              { getPlaylist.shares ? `${ getPlaylist.shares } shared this` : `be the first to share` }
            </div>

            <div>
              <button onClick={ () => handleShare('Facebook') } disabled={ loading }>
                Facebook
              </button>
              <button onClick={ () => handleShare('Twitter') } disabled={ loading }>
                Twitter
              </button>
            </div>

            <div>
              <span dir="ltr"><input value={ getPlaylist.url } readOnly/></span>
            </div>
          </div>
      }
    </section>
  )
}
