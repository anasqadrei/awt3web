import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import PlaylistItem from 'components/playlist.item.comp'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 5
const LIST_TOP_PLAYLISTS_QUERY = gql`
  query listTopPlaylistsInClickedSearchResult ($page: Int!, $pageSize: Int!, $since: AWSDateTime!) {
    listTopPlaylistsInClickedSearchResult(page: $page, pageSize: $pageSize, since: $since) {
      id
      name
      slug
      plays
      duration
      imageUrl
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
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_TOP_PLAYLISTS_QUERY,
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
  if (!data?.listTopPlaylistsInClickedSearchResult?.length) {
    return (
      <div>
        no playlists found (design this)
      </div>
    )
  }

  // get data
  const { listTopPlaylistsInClickedSearchResult } = data

  // display data
  return (
    <section>
      Top playlists in clicked search results
      { listTopPlaylistsInClickedSearchResult.map(playlist => (
        <PlaylistItem key={ playlist.id } playlist={ playlist } />
      ))}
      
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
