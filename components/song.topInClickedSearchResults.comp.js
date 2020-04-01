import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from './song.item.comp'
import ErrorMessage from './errorMessage'

const PAGE_SIZE = 5
const LIST_TOP_SONGS_QUERY = gql`
  query listTopSongsInClickedSearchResult ($page: Int!, $pageSize: Int!, $since: AWSDateTime!) {
    listTopSongsInClickedSearchResult(page: $page, pageSize: $pageSize, since: $since) {
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

export default function TopSongsInClickedSearchResults() {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 60)

  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_SONGS_QUERY,
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
  const { listTopSongsInClickedSearchResult } = data

  // in case no songs found
  if (!listTopSongsInClickedSearchResult || !listTopSongsInClickedSearchResult.length) {
    return (<div>no songs found (design this)</div>)
  }

  // display songs
  return (
    <section>
      Top songs in clicked search results
      { listTopSongsInClickedSearchResult.map(song => (
        <SongItem key={ song.id } song={ song } />
      ))}
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
