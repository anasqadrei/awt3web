import { useState } from 'react'
import Link from 'next/link'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

const PAGE_SIZE = 1
const LIST_USER_SONG_IMAGES_QUERY = gql`
  query listUserSongImages ($userId: ID!, $page: Int!, $pageSize: Int!) {
    listUserSongImages(userId: $userId, page: $page, pageSize: $pageSize) {
      id
      url
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

export default (props) => {
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
    LIST_USER_SONG_IMAGES_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserSongImages?.length ?? 0;

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
  if (!data?.listUserSongImages?.length) {
    return (
      <div>
        no song images found (design this)
      </div>
    )
  }

  // get data
  const { listUserSongImages } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserSongImages.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      { listUserSongImages.map(songImage => (
        <div key={ songImage.id }>
          <img src={ songImage.url }/>
          <Link href="/song/[id]/[slug]" as={ `/song/${ songImage.song.id }/${ songImage.song.slug }` }>
            <a>{ songImage.song.title }</a>
          </Link>
          -
          <Link href="/artist/[id]/[slug]" as={ `/artist/${ songImage.song.artist.id }/${ songImage.song.artist.slug }` }>
            <a>{ songImage.song.artist.name }</a>
          </Link>
        </div>
      ))}

      { !props.snippet && (
          nextPage ?
          <button onClick={ () => loadMore() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Song Images المزيد' }
          </button>
          :
          <p>all song images has been shown</p>
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
