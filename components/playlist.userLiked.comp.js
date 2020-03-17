import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import PlaylistItem from './playlist.item.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-likedDate'
const PAGE_SIZE = 1
const LIST_USER_LIKED_PLAYLISTS_QUERY = gql`
  query listUserLikedPlaylists ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserLikedPlaylists(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      plays
      duration
      imageUrl
    }
  }
`

// defaults
let nextPage = true

export default function UserLikedPlaylists() {
  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_LIKED_PLAYLISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched playlists. also decide on paging
  const loadMorePlaylists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserLikedPlaylists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserLikedPlaylists || (fetchMoreResult.listUserLikedPlaylists && fetchMoreResult.listUserLikedPlaylists.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserLikedPlaylists: [...previousResult.listUserLikedPlaylists, ...fetchMoreResult.listUserLikedPlaylists],
        })
      },
    })
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // initial loading
  if (loading && !loadingMore) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listUserLikedPlaylists } = data

  // in case no playlists found
  if (!listUserLikedPlaylists || !listUserLikedPlaylists.length) {
    return (<div>no liked Playlists found (design this)</div>)
  }

  // display playlists
  return (
    <section>
      Liked Playlists
      { listUserLikedPlaylists.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist } />
      ))}

      { (loadingMore || nextPage)?
        <button onClick={ () => loadMorePlaylists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all Playlists has been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
