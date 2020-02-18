import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from './song.item.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-lastDownloadedDate'
const PAGE_SIZE = 1
const LIST_USER_DOWNLOADED_SONGS_QUERY = gql`
  query listUserDownloadedSongs ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserDownloadedSongs(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
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

// defaults
let nextPage = true

export default function UserSavedSongs() {
  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_DOWNLOADED_SONGS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched songs. also decide on paging
  const loadMoreSongs = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserDownloadedSongs.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserDownloadedSongs || (fetchMoreResult.listUserDownloadedSongs && fetchMoreResult.listUserDownloadedSongs.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserDownloadedSongs: [...previousResult.listUserDownloadedSongs, ...fetchMoreResult.listUserDownloadedSongs],
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
  const { listUserDownloadedSongs } = data

  // in case no songs found
  if (!listUserDownloadedSongs || !listUserDownloadedSongs.length) {
    return (<div>no saved songs found (design this)</div>)
  }

  // display songs
  return (
    <section>
      Saved Songs
      { listUserDownloadedSongs.map(song => (
        <SongItem key={ song.id } song={ song } />
      ))}

      { (loadingMore || nextPage)?
        <button onClick={ () => loadMoreSongs() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Songs المزيد' }
        </button>
        :
        <p>all songs has been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}