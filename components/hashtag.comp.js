import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from './song.item.comp'
import ErrorMessage from './errorMessage'

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

// a paging flag
let nextPage = true

export default function HashtagSongs() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    hashtag: router.query.hashtag,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching
  // more data
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_HASHTAG_SONGS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched comments. also decide on paging
  const loadMoreHashtagSongs = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listHashtagSongs.length/PAGE_SIZE)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listHashtagSongs || (fetchMoreResult.listHashtagSongs && fetchMoreResult.listHashtagSongs.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listHashtagSongs: [...previousResult.listHashtagSongs, ...fetchMoreResult.listHashtagSongs],
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
  const { listHashtagSongs } = data

  // in case no songs found
  if (!listHashtagSongs.length) {
    return (<div>no songs found for this hashtag (design this)</div>)
  }

  // display songs
  return (
    <section>
      Hashtag Songs
      <h1 dir="ltr">#{ router.query.hashtag }</h1>

      { listHashtagSongs.map(song => (
        <SongItem key={ song.id } song={ song } />
      ))}

      { (loadingMore || nextPage) ?
        <button onClick={ () => loadMoreHashtagSongs() } disabled={ loadingMore }>
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
