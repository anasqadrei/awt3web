import { useState } from 'react'
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

const SORT = '-likedDate'
const PAGE_SIZE = 1
const LIST_USER_LIKED_ARTISTS_QUERY = gql`
  query listUserLikedArtists ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserLikedArtists(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
      songPlays
    }
  }
`

export default function UserLikedArtists() {
  // paging
  const [nextPage, setNextPage] = useState(true)

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_LIKED_ARTISTS_QUERY,
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
        page: Math.ceil(listUserLikedArtists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserLikedArtists || (fetchMoreResult.listUserLikedArtists && fetchMoreResult.listUserLikedArtists.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserLikedArtists: [...previousResult.listUserLikedArtists, ...fetchMoreResult.listUserLikedArtists],
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
  const { listUserLikedArtists } = data

  // in case no artists found
  if (!listUserLikedArtists || !listUserLikedArtists.length) {
    return (<div>no liked Artists found (design this)</div>)
  }

  // display artists
  return (
    <section>
      Liked Artists
      { listUserLikedArtists.map(artist => (
        <ArtistRowItem key={ artist.id } artist={ artist } />
      ))}

      { nextPage ?
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
