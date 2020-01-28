import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

const PAGE_SIZE = 10
const LIST_SONG_HASHTAGS_QUERY = gql`
  query listSongHashtags ($page: Int!, $pageSize: Int!) {
    listSongHashtags(page: $page, pageSize: $pageSize)
  }
`

export default function TopHashtagsInSongs() {
  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_SONG_HASHTAGS_QUERY,
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
  const { listSongHashtags } = data

  // in case no hashtags found
  if (!listSongHashtags.length) {
    return (<div>no hashtags found (design this)</div>)
  }

  // display hashtags otherwise
  return (
    <section>
      { listSongHashtags.map(hashtag => (
          <Link key={ hashtag } href="/hashtag/[hashtag]" as={ `/hashtag/${ hashtag }` }>
            <a>#{ hashtag }</a>
          </Link>
      ))}

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
