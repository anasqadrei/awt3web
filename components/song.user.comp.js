import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import Sort from 'components/sort.comp'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

const SORT_OPTIONS = [
  { sort: 'likes', label: 'LIKES' },
  { sort: '-likes', label: '-LIKES' },
  { sort: 'plays', label: 'PLAYS' },
  { sort: '-plays', label: '-PLAYS' },
  { sort: 'createdDate', label: 'CREATEDDATE' },
  { sort: '-createdDate', label: '-CREATEDDATE' },
  { sort: 'title', label: 'TITLE' },
  { sort: '-title', label: '-TITLE' },
]
const PAGE_SIZE = 3
const LIST_USER_SONGS_QUERY = gql`
  query listUserSongs ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserSongs(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
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

export default (props) => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // sorting
  const [sort, setSort] = useState('-createdDate')

  // set query variables
  const vars = {
    userId: props.userId,
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
    LIST_USER_SONGS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserSongs?.length ?? 0;

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
        { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/> }
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
  if (!data?.listUserSongs?.length) {
    return (
      <div>
        { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/> }
        no songs found (design this)
      </div>
    )
  }

  // get data
  const { listUserSongs } = data

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
        page: Math.ceil(listUserSongs.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ false } onClick={ changeSort }/> }

      { listUserSongs.map(song => (
        <SongItem key={ song.id } song={ song }/>
      ))}

      { !props.snippet && (
          nextPage ?
          <button onClick={ () => loadMore() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Songs المزيد' }
          </button>
          :
          <p>all songs has been shown</p>
        )
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
