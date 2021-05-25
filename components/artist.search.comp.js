import { useState } from 'react'
import { useRouter } from 'next/router'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ArtistRowItem from 'components/artist.rowItem.comp'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 2
const SEARCH_ARTISTS_QUERY = gql`
  query searchArtists ($query: String!, $page: Int!, $pageSize: Int!) {
    searchArtists(query: $query, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
      songPlays
    }
  }
`

const Comp = () => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // set query variables
  const vars = {
    query: useRouter().query.q,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    SEARCH_ARTISTS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      ssr: false,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.searchArtists?.length ?? 0

        // if there are no new items in the list then stop paging.
        if (newListLength == currentListLength) {
          setNextPage(false)
        }

        // update currentListLength to be newListLength
        setCurrentListLength(newListLength)
      },
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // initial loading
  if (loading && !loadingMore) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!data?.searchArtists?.length) {
    return (
      <div>
        no artists found in searchArtists results (design this)
      </div>
    )
  }

  // get data
  const { searchArtists } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(searchArtists.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Artists in searchArtists results
      { searchArtists.map(artist => (
        <ArtistRowItem key={ artist.id } artist={ artist } search={ true }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Artists المزيد' }
        </button>
        :
        <p>all artists in searchArtists results have been shown</p>
      }
    </section>
  )
}

export default Comp