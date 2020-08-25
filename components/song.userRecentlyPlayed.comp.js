import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-lastPlayedDate'
const PAGE_SIZE = 1
const LIST_USER_PLAYED_SONGS_QUERY = gql`
  query listUserPlayedSongs ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserPlayedSongs(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
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

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
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
    LIST_USER_PLAYED_SONGS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserPlayedSongs?.length ?? 0;

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
  if (!data?.listUserPlayedSongs?.length) {
    return (
      <div>
        no recently played songs found (design this)
      </div>
    )
  }

  // get data
  const { listUserPlayedSongs } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserPlayedSongs.length / queryVariables.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      My Recently Played
      { listUserPlayedSongs.map(song => (
        <SongItem key={ song.id } song={ song } />
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
