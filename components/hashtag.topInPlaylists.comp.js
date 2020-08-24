import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 10
const LIST_PLAYLIST_HASHTAGS_QUERY = gql`
  query listPlaylistHashtags ($page: Int!, $pageSize: Int!) {
    listPlaylistHashtags(page: $page, pageSize: $pageSize)
  }
`

export default () => {
  // set query variables
  const queryVariables = {
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_PLAYLIST_HASHTAGS_QUERY,
    {
      variables: queryVariables,
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
  if (!data?.listPlaylistHashtags?.length) {
    return (
      <div>
        no hashtags found (design this)
      </div>
    )
  }

  // get data
  const { listPlaylistHashtags } = data

  // display data
  return (
    <section>
      { listPlaylistHashtags.map(hashtag => (
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
