import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import SongItem from 'components/song.item.comp'
import ErrorMessage from 'components/errorMessage'

const SORT = '-createdDate'
const PAGE_SIZE = 5
const LIST_SONGS_QUERY = gql`
  query listSongs ($sort: String!, $page: Int!, $pageSize: Int!) {
    listSongs(sort: $sort, page: $page, pageSize: $pageSize) {
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
  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_SONGS_QUERY,
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
  if (!data?.listSongs?.length) {
    return (
      <div>
        no songs found (design this)
      </div>
    )
  }

  // get data
  const { listSongs } = data

  // display data
  return (
    <section>
      NewSongs
      { listSongs.map(song => (
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
