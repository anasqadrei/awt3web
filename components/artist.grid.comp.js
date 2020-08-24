import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import Sort from 'components/sort.comp'
import ArtistGridItem from 'components/artist.gridItem.comp'
import ErrorMessage from 'components/errorMessage'

const SORT_OPTIONS = [
  { sort: 'likes', label: 'LIKES' },
  { sort: '-likes', label: '-LIKES' },
  { sort: 'songs', label: 'SONGS' },
  { sort: '-songs', label: '-SONGS' },
]
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

export default () => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // sorting
  const [sort, setSort] = useState('-likes')

  // set query variables
  const queryVariables = {
    sort: sort,
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
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_ARTISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get newListLength with default = 0
        const newListLength = data?.listArtists?.length ?? 0;

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
    return (<div><Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/>Loading... (design this)</div>)
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!data?.listArtists?.length) {
    return (<div><Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/>no artists found (design this)</div>)
  }

  // get data
  const { listArtists } = data

  // function: change sort option
  const changeSort = (newSort) => {
    // reset paging
    setNextPage(true)
    setCurrentListLength(0)
    // set new sort and refetch data
    setSort(newSort)
    refetch({ sort: newSort })
  }

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listArtists.length / queryVariables.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ false } onClick={ changeSort }/>
      { listArtists.map(artist => (
        <ArtistGridItem key={ artist.id } artist={ artist } />
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
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
