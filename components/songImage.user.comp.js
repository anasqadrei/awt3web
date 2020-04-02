import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

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

export default function UserSongImages(props) {
  const router = useRouter()

  // paging
  const [nextPage, setNextPage] = useState(true)

  // set query variables
  const queryVariables = {
    userId: router.query.id,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_USER_SONG_IMAGES_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched song images. also decide on paging
  const loadMoreSongImages = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserSongImages.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserSongImages || (fetchMoreResult.listUserSongImages && fetchMoreResult.listUserSongImages.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserSongImages: [...previousResult.listUserSongImages, ...fetchMoreResult.listUserSongImages],
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
  const { listUserSongImages } = data

  // in case no song images found
  if (!listUserSongImages.length) {
    return (
      <div>
        no song images found (design this)
      </div>
    )
  }

  // display song images
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
          <button onClick={ () => loadMoreSongImages() } disabled={ loadingMore }>
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
