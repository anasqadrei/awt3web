import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import ArtistGridItem from './artist.gridItem.comp'

const PAGE_SIZE = 5
const LIST_ARTISTS_QUERY = gql`
  query listArtists ($sort: String!, $page: Int!, $pageSize: Int!) {
    listArtists(sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
      likes
      songs
    }
  }
`

// a paging flag
let nextPage = true
export function setNextPage(flag) {
  nextPage = flag
}

export default function ArtistsGrid() {
  // set query variables
  const queryVariables = {
    sort: '-songs', // TODO:  let user choose
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching
  // more data
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_ARTISTS_QUERY,
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
        page: Math.ceil(listArtists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || (fetchMoreResult.listArtists && fetchMoreResult.listArtists.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listArtists: [...previousResult.listArtists, ...fetchMoreResult.listArtists],
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
  const { listArtists } = data

  // in case no artists found
  if (!listArtists.length) {
    return (<div>no artists found (design this)</div>)
  }

  // display artists otherwise
  return (
    <section>
      { /* // TODO: sort out the sort  */ }
      <div>sorting?? name | songs | search | liked ...?</div>
      { listArtists.map(artist => (
        <ArtistGridItem key={ artist.id } artist={ artist } />
      ))}

      { (loadingMore || nextPage)?
        <button onClick={ () => loadMoreArtists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Artists المزيد' }
        </button>
        :
        <p>all artists has been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
