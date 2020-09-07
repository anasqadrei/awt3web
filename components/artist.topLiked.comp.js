import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ArtistGridItem from 'components/artist.gridItem.comp'
import ErrorMessage from 'components/errorMessage'

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

export default () => {
  // set since date
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setMonth(since.getMonth() - 6)

  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
    since: since.toISOString(),
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_LIKED_ARTISTS_QUERY,
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
  if (!data?.listTopLikedArtists?.length) {
    return (
      <div>
        no artists found (design this)
      </div>
    )
  }

  // get data
  const { listTopLikedArtists } = data

  // display data
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
