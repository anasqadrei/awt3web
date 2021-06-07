import { useState } from 'react'
import { useRouter } from 'next/router'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 2
const SEARCH_SONGS_QUERY = gql`
  query searchSongs ($query: String!, $page: Int!, $pageSize: Int!, $userId: ID) {
    searchSongs(query: $query, page: $page, pageSize: $pageSize, userId: $userId) {
      id
      title
      slug
      artist {
        id
        name
        slug
      }
      plays
      duration
      defaultImage {
        url
      }
    }
  }
`

const Comp = () => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set query variables
  const vars = {
    query: useRouter().query.q,
    page: 1,
    pageSize: PAGE_SIZE,
    userId: getAuthUser?.id,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    SEARCH_SONGS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      ssr: false,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.searchSongs?.length ?? 0

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
  if (!data?.searchSongs?.length) {
    return (
      <div>
        no songs found in searchSongs results (design this)
      </div>
    )
  }

  // get data
  const { searchSongs } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(searchSongs.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Songs in searchSongs results
      { searchSongs.map(song => (
        <SongItem key={ song.id } song={ song } search={ true }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Songs المزيد' }
        </button>
        :
        <p>all songs in searchSongs results have been shown</p>
      }
    </section>
  )
}

export default Comp