import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
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

export default function TopSongs() {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 60)

  // set query variables
  const queryVariables = {
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
  const { listTopSongs } = data

  // display songs
  return (
    <section>
      Top Songs
      { listTopSongs.map(song => (
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
