import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
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

export default function TopPlaylistsInClickedSearchResults() {
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
    LIST_TOP_PLAYLISTS_QUERY,
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
  const { listTopPlaylistsInClickedSearchResult } = data

  // in case no playlists found
  if (!listTopPlaylistsInClickedSearchResult || !listTopPlaylistsInClickedSearchResult.length) {
    return (<div>no playlists found (design this)</div>)
  }

  // display playlists
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
