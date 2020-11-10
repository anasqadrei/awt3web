import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const SORT = '-lastSearchedDate'
const PAGE_SIZE = 10
const LIST_USER_SEARCHES_QUERY = gql`
  query listUserSearches ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserSearches(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize)
  }
`

const Comp = () => {
  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set query variables
  const vars = {
    userId: getAuthUser?.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  // cache-and-network fetch policy is to update the list of recent searches
  const { loading, error, data } = useQuery (
    LIST_USER_SEARCHES_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
      fetchPolicy: "cache-and-network",
    }
  )

  // initial loading
  if (loading) {
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
  if (!data?.listUserSearches?.length) {
    return (
      <div>
        no search terms found (design this)
      </div>
    )
  }

  // get data
  const { listUserSearches } = data

  // display data
  return (
    <section>
      { listUserSearches.map(term => (
        <span key={ term }>
          <Link href={ `/search-results?q=${ term }` }>
            <a>{ term }</a>
          </Link>
          {` `}
        </span>
      ))}
    </section>
  )
}

export default Comp