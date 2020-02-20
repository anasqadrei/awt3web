import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ArtistRowItem from './artist.rowItem.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-plays'
const PAGE_SIZE = 1
const LIST_USER_PLAYED_ARTISTS_QUERY = gql`
  query listUserPlayedArtists ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserPlayedArtists(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
      songPlays
    }
  }
`

// defaults
let nextPage = true

export default function UserMostPlayedArtists() {
  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_PLAYED_ARTISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched artists. also decide on paging
  const loadMoreArtists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserPlayedArtists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserPlayedArtists || (fetchMoreResult.listUserPlayedArtists && fetchMoreResult.listUserPlayedArtists.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserPlayedArtists: [...previousResult.listUserPlayedArtists, ...fetchMoreResult.listUserPlayedArtists],
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
  const { listUserPlayedArtists } = data

  // in case no artists found
  if (!listUserPlayedArtists || !listUserPlayedArtists.length) {
    return (<div>no most played Artists found (design this)</div>)
  }

  // display artists
  return (
    <section>
      My Most Played Artists
      { listUserPlayedArtists.map(artist => (
        <ArtistRowItem key={ artist.id } artist={ artist } />
      ))}

      { (loadingMore || nextPage)?
        <button onClick={ () => loadMoreArtists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Artists المزيد' }
        </button>
        :
        <p>all Artists has been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
