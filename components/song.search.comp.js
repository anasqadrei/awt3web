import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  // id: "1",
  // username: "Admin",
  // __typename: "User",
}

const PAGE_SIZE = 1
const SEARCH_QUERY = gql`
  query search ($query: String!, $indexes: [String], $page: Int!, $pageSize: Int!, $, userId: ID) {
    search(query: $query, indexes: $indexes, page: $page, pageSize: $pageSize, userId: $userId) {
      index
      id
      title
      imageUrl
      desc
      username
      durationDesc
      lyrics
    }
  }
`

// defaults
let nextPage = true
export function setNextPage(flag) {
  nextPage = flag
}

export default function SearchSongs() {
  // search in case there is a query otherwise return nothing
  if (useRouter().query.q) {
    // set query variables
    const queryVariables = {
      query: useRouter().query.q,
      indexes: ['songs'],
      page: 1,
      pageSize: PAGE_SIZE,
      userId: loggedOnUser.id && loggedOnUser.id,
    }

    // excute query
    const { loading, error, data, fetchMore, networkStatus } = useQuery (
      SEARCH_QUERY,
      {
        variables: queryVariables,
        notifyOnNetworkStatusChange: true,
      }
    )

    // loading more network status. fetchMore: query is currently in flight
    const loadingMore = (networkStatus === NetworkStatus.fetchMore)

    // get and append new fetched search results. also decide on paging
    const loadMoreSearchResults = () => {
      fetchMore({
        variables: {
          page: Math.ceil(search.length/queryVariables.pageSize)+1
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || !fetchMoreResult.search || (fetchMoreResult.search && fetchMoreResult.search.length === 0)) {
            nextPage = false
            return previousResult
          }
          return Object.assign({}, previousResult, {
            search: [...previousResult.search, ...fetchMoreResult.search],
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
    const { search } = data

    // in case no songs found
    if (!search || !search.length) {
      return (<div>no songs found in search results (design this)</div>)
    }

    // display songs
    return (
      <section>
        Songs in search results
        { search.map(searchResult => (
          <div key={ searchResult.id }>
            <img src={ searchResult.imageUrl ? searchResult.imageUrl : `https://via.placeholder.com/30?text=no+photo?` }/>
            <Link href="/song/[id]/[slug]" as={ `/song/${ searchResult.id }/${ searchResult.title.toLowerCase().replace(/[\s]+/g, '-') }` }>
              <a>{ searchResult.title }</a>
            </Link>
            <img src="https://via.placeholder.com/30?text=duration"/> { searchResult.durationDesc }
          </div>
        ))}

        { (loadingMore || nextPage) ?
          <button onClick={ () => loadMoreSearchResults() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Songs المزيد' }
          </button>
          :
          <p>all songs in search results have been shown</p>
        }

        <style jsx>{`
          .title, .description {
            text-align: center;
          }
        `}</style>
      </section>
    )
  } else {
    return (
      <section></section>
    )
  }
}
