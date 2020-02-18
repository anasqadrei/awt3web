import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

const PAGE_SIZE = 1
const LIST_USER_LYRICS_QUERY = gql`
  query listUserLyrics ($userId: ID!, $page: Int!, $pageSize: Int!) {
    listUserLyrics(userId: $userId, page: $page, pageSize: $pageSize) {
      id
      content
      song {
        id
        title
        slug
        artist {
          id
          name
          slug
        }
      }
    }
  }
`

// defaults
let nextPage = true

export default function UserLyrics(props) {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    userId: router.query.id,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_LYRICS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched lyrics. also decide on paging
  const loadMoreLyrics = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserLyrics.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserLyrics || (fetchMoreResult.listUserLyrics && fetchMoreResult.listUserLyrics.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserLyrics: [...previousResult.listUserLyrics, ...fetchMoreResult.listUserLyrics],
        })
      },
    })
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // initial loading
  if (loading && !loadingMore) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // get data
  const { listUserLyrics } = data

  // in case no lyrics found
  if (!listUserLyrics.length) {
    return (
      <div>
        no Lyrics found (design this)
      </div>
    )
  }

  // display lyrics
  return (
    <section>

      { listUserLyrics.map(lyrics => (
        <div key={ lyrics.id }>
          <div dangerouslySetInnerHTML={{ __html: lyrics.content }} />
          <Link href="/song/[id]/[slug]" as={ `/song/${ lyrics.song.id }/${ lyrics.song.slug }` }>
            <a>{ lyrics.song.title }</a>
          </Link>
          -
          <Link href="/artist/[id]/[slug]" as={ `/artist/${ lyrics.song.artist.id }/${ lyrics.song.artist.slug }` }>
            <a>{ lyrics.song.artist.name }</a>
          </Link>
        </div>
      ))}

      { !props.snippet && (
          (loadingMore || nextPage) ?
          <button onClick={ () => loadMoreLyrics() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Lyrics المزيد' }
          </button>
          :
          <p>all lyrics has been shown</p>
        )
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
