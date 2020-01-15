import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from './song.item.comp'
import ErrorMessage from './errorMessage'

const SORT = '-createdDate'
const PAGE_SIZE = 3
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

export default function NewSongs(props) {
  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_SONGS_QUERY,
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
  const { listSongs } = data

  // display songs
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
