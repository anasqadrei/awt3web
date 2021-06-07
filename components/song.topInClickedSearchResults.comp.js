import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

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

const Comp = () => {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 60)

  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_SONGS_QUERY,
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
  if (!data?.listTopSongsInClickedSearchResult?.length) {
    return (
      <div>
        no songs found (design this)
      </div>
    )
  }

  // get data
  const { listTopSongsInClickedSearchResult } = data

  // display data
  return (
    <section>
      Top songs in clicked search results
      { listTopSongsInClickedSearchResult.map(song => (
        <SongItem key={ song.id } song={ song }/>
      ))}
    </section>
  )
}

export default Comp