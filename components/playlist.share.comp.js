import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { GET_PLAYLIST_QUERY } from './playlist.comp'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const SHARE_PLAYLIST_MUTATION = gql`
  mutation sharePlaylist ($playlistId: ID!, $userId: ID!) {
    sharePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

export default function SharePlaylist() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    playlistId: router.query.id,
  }

  // share mutation
  const [sharePlaylist, { loading, error }] = useMutation(
    SHARE_PLAYLIST_MUTATION,
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

    // execute sharePlaylist and update shares counter in the cache
    sharePlaylist({
      variables: queryVariables,
      update: (proxy, { data: { sharePlaylist } }) => {
        // if successful share, update playlist shares cache
        if (sharePlaylist) {
          // read cache
          const data = proxy.readQuery({
            query: GET_PLAYLIST_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getPlaylist.shares
          proxy.writeQuery({
            query: GET_PLAYLIST_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getPlaylist: {
                ...data.getPlaylist,
                shares: data.getPlaylist.shares + 1,
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
      <button onClick={ () => shareHandler('Facebook') } disabled={ loading }>
        Facebook
      </button>
      <button onClick={ () => shareHandler('Twitter') } disabled={ loading }>
        Twitter
      </button>
    </section>
  )
}
