import { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-plays'
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

export default function UserMostPlayedSongs() {
  // paging
  const [nextPage, setNextPage] = useState(true)

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_PLAYED_SONGS_QUERY,
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
        page: Math.ceil(listUserPlayedSongs.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserPlayedSongs || (fetchMoreResult.listUserPlayedSongs && fetchMoreResult.listUserPlayedSongs.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserPlayedSongs: [...previousResult.listUserPlayedSongs, ...fetchMoreResult.listUserPlayedSongs],
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
  const { listUserPlayedSongs } = data

  // in case no songs found
  if (!listUserPlayedSongs || !listUserPlayedSongs.length) {
    return (<div>no most played songs found (design this)</div>)
  }

  // display songs
  return (
    <section>
      My Most Played
      { listUserPlayedSongs.map(song => (
        <SongItem key={ song.id } song={ song } />
      ))}

      { nextPage ?
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
