import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import ArtistGridItem from './artist.gridItem.comp'

const PAGE_SIZE = 5
const LIST_TOP_LIKED_ARTISTS_QUERY = gql`
  query listTopLikedArtists ($page: Int!, $pageSize: Int!, $since: AWSDateTime!) {
    listTopLikedArtists(page: $page, pageSize: $pageSize, since: $since) {
      id
      name
      slug
      imageUrl
      likes
      songs
    }
  }
`

export default function TopLikedArtists() {
  // set since date
  const since = new Date()
  since.setMilliseconds(0)
  since.setSeconds(0)
  since.setMinutes(0)
  since.setHours(0)
  since.setMonth(since.getMonth() - 6)

  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_LIKED_ARTISTS_QUERY,
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
  const { listTopLikedArtists } = data

  // in case no artists found
  if (!listTopLikedArtists.length) {
    return (<div>no artists found (design this)</div>)
  }

  // display artists otherwise
  return (
    <section>
      { listTopLikedArtists.map(artist => (
        <ArtistGridItem key={ artist.id } artist={ artist } />
      ))}

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
