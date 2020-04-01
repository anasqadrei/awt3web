import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

const PAGE_SIZE = 10
const LIST_TOP_SEARCHES_QUERY = gql`
  query listTopSearches ($page: Int!, $pageSize: Int!, $since: AWSDateTime!) {
    listTopSearches(page: $page, pageSize: $pageSize, since: $since)
  }
`

export default function TopSearchTerms() {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 12)

  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_SEARCHES_QUERY,
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
  const { listTopSearches } = data

  // in case no search terms found
  if (!listTopSearches.length) {
    return (<div>no search terms found (design this)</div>)
  }

  // display search terms otherwise
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

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
