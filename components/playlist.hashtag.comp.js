import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import PlaylistItem from 'components/playlist.item.comp'
import ErrorMessage from 'components/errorMessage'

const SORT = '-createdDate'
const PAGE_SIZE = 5
const LIST_HASHTAG_PLAYLISTS_QUERY = gql`
  query listHashtagPlaylists ($hashtag: String!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listHashtagPlaylists(hashtag: $hashtag, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      plays
      duration
      imageUrl
    }
  }
`

const Comp = (props) => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // set query variables
  const vars = {
    hashtag: props.hashtag,
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
    LIST_HASHTAG_PLAYLISTS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listHashtagPlaylists?.length ?? 0;

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
  if (!data?.listHashtagPlaylists?.length) {
    return (
      <div>
        no playlists found for this hashtag (design this)
      </div>
    )
  }

  // get data
  const { listHashtagPlaylists } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listHashtagPlaylists.length / PAGE_SIZE) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Hashtag Playlists

      { listHashtagPlaylists.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading... جاري عرض المزيد من الاغاني ' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all playlists has been shown تم عرض جميع الاغاني</p>
      }
    </section>
  )
}

export default Comp