import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { GET_ARTIST_QUERY } from './artist.comp'

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

export default function ShareArtist() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    artistId: router.query.id,
  }

  // share mutation
  const [shareArtist, { loading, error }] = useMutation(
    SHARE_ARTIST_MUTATION,
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

    // execute shareArtist and update shares counter in the cache
    shareArtist({
      variables: queryVariables,
      update: (proxy, { data: { shareArtist } }) => {
        // if successful share, update artist shares cache
        if (shareArtist) {
          // read cache
          const data = proxy.readQuery({
            query: GET_ARTIST_QUERY,
            variables: { id: router.query.id },
          })
          // update cache by incrementing getArtist.shares
          proxy.writeQuery({
            query: GET_ARTIST_QUERY,
            variables: { id: router.query.id },
            data: {
              ...data,
              getArtist: {
                ...data.getArtist,
                shares: data.getArtist.shares + 1,
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