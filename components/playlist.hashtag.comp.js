import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import PlaylistItem from './playlist.item.comp'
import ErrorMessage from './errorMessage'

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

// a paging flag
let nextPage = true

export default function HashtagPlaylists() {
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
    LIST_HASHTAG_PLAYLISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched comments. also decide on paging
  const loadMoreHashtagPlaylists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listHashtagPlaylists.length/PAGE_SIZE)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listHashtagPlaylists || (fetchMoreResult.listHashtagPlaylists && fetchMoreResult.listHashtagPlaylists.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listHashtagPlaylists: [...previousResult.listHashtagPlaylists, ...fetchMoreResult.listHashtagPlaylists],
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
  const { listHashtagPlaylists } = data

  // in case no playlists found
  if (!listHashtagPlaylists.length) {
    return (<div>no playlists found for this hashtag (design this)</div>)
  }

  // display playlists
  return (
    <section>
      Hashtag Playlists
      
      { listHashtagPlaylists.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist } />
      ))}

      { (loadingMore || nextPage) ?
        <button onClick={ () => loadMoreHashtagPlaylists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading... جاري عرض المزيد من الاغاني ' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all playlists has been shown تم عرض جميع الاغاني</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
