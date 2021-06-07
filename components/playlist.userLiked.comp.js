import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser } from 'lib/localState'
import PlaylistItem from 'components/playlist.item.comp'
import ErrorMessage from 'components/errorMessage'

export const SORT = '-likedDate'
export const PAGE_SIZE = 1
export const LIST_USER_LIKED_PLAYLISTS_QUERY = gql`
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

const Comp = () => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set query variables
  const vars = {
    userId: getAuthUser?.id,
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
    LIST_USER_LIKED_PLAYLISTS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      skip: !getAuthUser,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserLikedPlaylists?.length ?? 0;

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
  if (!data?.listUserLikedPlaylists?.length) {
    return (
      <div>
        no liked Playlists found (design this)
      </div>
    )
  }

  // get data
  const { listUserLikedPlaylists } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserLikedPlaylists.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Liked Playlists
      { listUserLikedPlaylists.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all Playlists has been shown</p>
      }
    </section>
  )
}

export default Comp