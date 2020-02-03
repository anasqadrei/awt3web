import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import SongItem from './song.item.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const SORT = '-lastPlayedDate'
const PAGE_SIZE = 3
const LIST_USER_PLAYED_SONGS_QUERY = gql`
  query listUserPlayedSongs ($userId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserPlayedSongs(userId: $userId, sort: $sort, page: $page, pageSize: $pageSize) {
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

export default function UserRecentlyPlayedSongsSummery() {
  // set query variables
  const queryVariables = {
    userId: loggedOnUser.id,
    sort: SORT,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_USER_PLAYED_SONGS_QUERY,
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
  const { listUserPlayedSongs } = data

  // in case no songs found
  if (!listUserPlayedSongs || !listUserPlayedSongs.length) {
    return (<div>no recently played songs found (design this or don't show anything)</div>)
  }

  // display songs
  return (
    <section>
      My Recently Played
      { listUserPlayedSongs.map(song => (
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
