import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 3
const LIST_TOP_SONGS_QUERY = gql`
  query listTopSongs ($page: Int!, $pageSize: Int!, $since: AWSDateTime!, $played: Boolean!, $liked: Boolean!, $downloaded: Boolean!, $shared: Boolean!) {
    listTopSongs(page: $page, pageSize: $pageSize, since: $since, played: $played, liked: $liked, downloaded: $downloaded, shared: $shared) {
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

export default () => {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 60)

  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
    played: true,
    liked: false,
    downloaded: false,
    shared: false,
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
  if (!data?.listTopSongs?.length) {
    return (
      <div>
        no songs found (design this)
      </div>
    )
  }

  // get data
  const { listTopSongs } = data

  // display data
  return (
    <section>
      Top Songs
      { listTopSongs.map(song => (
        <SongItem key={ song.id } song={ song }/>
      ))}
    </section>
  )
}
