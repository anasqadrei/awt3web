import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

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

export default () => {
  // set query variables
  const vars = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_USER_SEARCHES_QUERY,
    {
      variables: vars,
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

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
