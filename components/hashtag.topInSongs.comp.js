import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 10
const LIST_SONG_HASHTAGS_QUERY = gql`
  query listSongHashtags ($page: Int!, $pageSize: Int!) {
    listSongHashtags(page: $page, pageSize: $pageSize)
  }
`

export default () => {
  // set query variables
  const vars = {
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data } = useQuery (
    LIST_SONG_HASHTAGS_QUERY,
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
  if (!data?.listSongHashtags?.length) {
    return (
      <div>
        no hashtags found (design this)
      </div>
    )
  }

  // get data
  const { listSongHashtags } = data

  // display data
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
