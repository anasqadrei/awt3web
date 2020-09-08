import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

const SORT = '-createdDate'
const PAGE_SIZE = 5
const LIST_HASHTAG_SONGS_QUERY = gql`
  query listHashtagSongs ($hashtag: String!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listHashtagSongs(hashtag: $hashtag, sort: $sort, page: $page, pageSize: $pageSize) {
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
    LIST_HASHTAG_SONGS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listHashtagSongs?.length ?? 0;

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
  if (!data?.listHashtagSongs?.length) {
    return (
      <div>
        no songs found for this hashtag (design this)
      </div>
    )
  }

  // get data
  const { listHashtagSongs } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listHashtagSongs.length / PAGE_SIZE) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Hashtag Songs

      { listHashtagSongs.map(song => (
        <SongItem key={ song.id } song={ song }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading... جاري عرض المزيد من الاغاني ' : 'Show More Songs المزيد' }
        </button>
        :
        <p>all songs has been shown تم عرض جميع الاغاني</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
