import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 10
const LIST_TOP_SEARCHES_QUERY = gql`
  query listTopSearches ($page: Int!, $pageSize: Int!, $since: AWSDateTime!) {
    listTopSearches(page: $page, pageSize: $pageSize, since: $since)
  }
`

const Comp = () => {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 12)

  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_SEARCHES_QUERY,
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
  if (!data?.listTopSearches?.length) {
    return (
      <div>
        no search terms found (design this)
      </div>
    )
  }

  // get data
  const { listTopSearches } = data

  // display data
  return (
    <section>
      { listTopSearches.map(term => (
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