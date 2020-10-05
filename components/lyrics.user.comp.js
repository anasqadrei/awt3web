import { useState } from 'react'
import Link from 'next/link'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

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

const Comp = (props) => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // set query variables
  const vars = {
    userId: props.userId,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_LYRICS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserLyrics?.length ?? 0;

        // if there are no new items in the list then stop paging.
        if (newListLength == currentListLength) {
          setNextPage(false)
        }

        // update currentListLength to be newListLength
        setCurrentListLength(newListLength)
      },
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // initial loading
  if (loading && !loadingMore) {
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
  if (!data?.listUserLyrics?.length) {
    return (
      <div>
        no Lyrics found (design this)
      </div>
    )
  }

  // get data
  const { listUserLyrics } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserLyrics.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      { listUserLyrics.map(lyrics => (
        <div key={ lyrics.id }>
          <div dangerouslySetInnerHTML={{ __html: lyrics.content }}/>
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
          nextPage ?
          <button onClick={ () => loadMore() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Lyrics المزيد' }
          </button>
          :
          <p>all lyrics has been shown</p>
        )
      }
    </section>
  )
}

export default Comp