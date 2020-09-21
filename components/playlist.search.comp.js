import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

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
    }
  }
`

export default () => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set query variables
  const vars = {
    query: useRouter().query.q,
    indexes: ['playlists'],
    page: 1,
    pageSize: PAGE_SIZE,
    userId: getAuthUser?.id,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    SEARCH_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.search?.length ?? 0;

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
  if (!data?.search?.length) {
    return (
      <div>
        no playlists found in search results (design this)
      </div>
    )
  }

  // get data
  const { search } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(search.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      Playlists in search results
      { search.map(searchResult => (
        <div key={ searchResult.id }>
          <img src={ searchResult.imageUrl ? searchResult.imageUrl : `https://via.placeholder.com/30?text=no+photo?` }/>
          <Link href="/playlist/[id]/[slug]" as={ `/playlist/${ searchResult.id }/${ searchResult.title.toLowerCase().replace(/[\s]+/g, '-') }` }>
            <a>{ searchResult.title }</a>
          </Link>
          <img src="https://via.placeholder.com/30?text=duration"/> { searchResult.durationDesc }
        </div>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all playlists in search results have been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
