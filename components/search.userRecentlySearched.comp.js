import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-lastSearchedDate'
const PAGE_SIZE = 10
const LIST_USER_SEARCHES_QUERY = gql`
  query listUserSearches ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserSearches(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize)
  }
`

export default function UserRecentlySearched() {
  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_USER_SEARCHES_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listUserSearches } = data

  // in case no search terms found
  if (!listUserSearches.length) {
    return (<div>no search terms found (design this)</div>)
  }

  // display search terms otherwise
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

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
