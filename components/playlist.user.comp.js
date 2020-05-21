import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import PlaylistItem from 'components/playlist.item.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

export const DEFAULT_SORT = '-createdDate'
export const PAGE_SIZE = 3
export const LIST_USER_PLAYLISTS_QUERY = gql`
  query listUserPlaylists ($userId: ID!, $private: Boolean!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserPlaylists(userId: $userId, private: $private, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      plays
      duration
      imageUrl
    }
  }
`

export default function UserPlaylists(props) {
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
        <button onClick={ () => setNewSort('name') } hidden={ sort != '-name' } disabled={ props.disableAll }>
          name
        </button>
        <button onClick={ () => setNewSort('-name') } hidden={ sort === '-name' } disabled={ props.disableAll }>
          -name
        </button>
      </div>
    )
  }

  // paging
  const [nextPage, setNextPage] = useState(true)

  // sorting
  const [sort, setSort] = useState(DEFAULT_SORT)

  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    private: props.private,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: sort,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_USER_PLAYLISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched playlists. also decide on paging
  const loadMorePlaylists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserPlaylists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserPlaylists || (fetchMoreResult.listUserPlaylists && fetchMoreResult.listUserPlaylists.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserPlaylists: [...previousResult.listUserPlaylists, ...fetchMoreResult.listUserPlaylists],
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
  const { listUserPlaylists } = data

  // in case no playlists found
  if (!listUserPlaylists.length) {
    return (
      <div>
        { !props.snippet && (<SortMenu disableAll={ false }/>)}
        no playlists found (design this)
      </div>
    )
  }

  // display playlists
  return (
    <section>
      { !props.snippet && (<SortMenu disableAll={ false }/>)}

      { listUserPlaylists.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist } />
      ))}

      { !props.snippet && (
          nextPage ?
          <button onClick={ () => loadMorePlaylists() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
          </button>
          :
          <p>all playlists has been shown</p>
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
