import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

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

export default function UserSongs(props) {
  // SortMenu component
  const SortMenu = (props) => {
    return (
      <div>
        <button onClick={ () => setNewSort('likes') } hidden={ sort != '-likes' } disabled={ props.disableAll }>
          likes
        </button>
        <button onClick={ () => setNewSort('-likes') } hidden={ sort === '-likes' } disabled={ props.disableAll }>
          -likes
        </button>
        <button onClick={ () => setNewSort('plays') } hidden={ sort != '-plays' } disabled={ props.disableAll }>
          plays
        </button>
        <button onClick={ () => setNewSort('-plays') } hidden={ sort === '-plays' } disabled={ props.disableAll }>
          -plays
        </button>
        <button onClick={ () => setNewSort('createdDate') } hidden={ sort != '-createdDate' } disabled={ props.disableAll }>
          createdDate
        </button>
        <button onClick={ () => setNewSort('-createdDate') } hidden={ sort === '-createdDate' } disabled={ props.disableAll }>
          -createdDate
        </button>
        <button onClick={ () => setNewSort('title') } hidden={ sort != '-title' } disabled={ props.disableAll }>
          title
        </button>
        <button onClick={ () => setNewSort('-title') } hidden={ sort === '-title' } disabled={ props.disableAll }>
          -title
        </button>
      </div>
    )
  }

  const router = useRouter()

  // paging
  const [nextPage, setNextPage] = useState(true)

  // sorting
  const [sort, setSort] = useState('-createdDate')

  // set query variables
  const queryVariables = {
    userId: router.query.id,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: sort,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_USER_SONGS_QUERY,
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
        page: Math.ceil(listUserSongs.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserSongs || (fetchMoreResult.listUserSongs && fetchMoreResult.listUserSongs.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserSongs: [...previousResult.listUserSongs, ...fetchMoreResult.listUserSongs],
        })
      },
    })
  }

  // set new sort and refetch data
  const setNewSort = (newSort) => {
    setNextPage(true)
    setSort(newSort)
    refetch({
      sort: newSort,
    })
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // initial loading
  if (loading && !loadingMore) {
    return (
      <div>
        { !props.snippet && (<SortMenu disableAll={ true }/>)}
        Loading... (design this)
      </div>
    )
  }

  // get data
  const { listUserSongs } = data

  // in case no songs found
  if (!listUserSongs.length) {
    return (
      <div>
        { !props.snippet && (<SortMenu disableAll={ false }/>)}
        no songs found (design this)
      </div>
    )
  }

  // display songs
  return (
    <section>
      { !props.snippet && (<SortMenu disableAll={ false }/>)}

      { listUserSongs.map(song => (
        <SongItem key={ song.id } song={ song } />
      ))}

      { !props.snippet && (
          nextPage ?
          <button onClick={ () => loadMoreSongs() } disabled={ loadingMore }>
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
