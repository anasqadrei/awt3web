import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { DISPLAY } from '../lib/constants'

const PAGE_SIZE = 5
const LIST_ARTIST_SONGS_QUERY = gql`
  query listArtistSongs ($artistId: ID!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listArtistSongs(artistId: $artistId, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      title
      slug
      plays
      likes
      duration
      defaultImage {
        url
      }
    }
  }
`

export default function ArtistSongs(props) {
  // SortMenu component
  const SortMenu = (props) => {
    return (
      <div>
        <button onClick={ () => setNewSort('likes') } hidden={ sort != '-likes' } disabled={ props.disableAll }>
          likes
        </button>
        <button onClick={ () => setNewSort('-likes') } hidden={ sort === '-likes' } disabled={ props.disableAll }>
          -likes
        </button>
        <button onClick={ () => setNewSort('plays') } hidden={ sort != '-plays' } disabled={ props.disableAll }>
          plays
        </button>
        <button onClick={ () => setNewSort('-plays') } hidden={ sort === '-plays' } disabled={ props.disableAll }>
          -plays
        </button>
        <button onClick={ () => setNewSort('createdDate') } hidden={ sort != '-createdDate' } disabled={ props.disableAll }>
          createdDate
        </button>
        <button onClick={ () => setNewSort('-createdDate') } hidden={ sort === '-createdDate' } disabled={ props.disableAll }>
          -createdDate
        </button>
        <button onClick={ () => setNewSort('title') } hidden={ sort != '-title' } disabled={ props.disableAll }>
          title
        </button>
        <button onClick={ () => setNewSort('-title') } hidden={ sort === '-title' } disabled={ props.disableAll }>
          -title
        </button>
      </div>
    )
  }

  // paging
  const [nextPage, setNextPage] = useState(true)

  // sorting
  const [sort, setSort] = useState('-createdDate')

  // set query variables
  const queryVariables = {
    artistId: props.artistId,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: props.sort || sort,
  }

  // excute query
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_ARTIST_SONGS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched songs. also decide on paging
  const loadMoreSongs = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listArtistSongs.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listArtistSongs || (fetchMoreResult.listArtistSongs && fetchMoreResult.listArtistSongs.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listArtistSongs: [...previousResult.listArtistSongs, ...fetchMoreResult.listArtistSongs],
        })
      },
    })
  }

  // set new sort and refetch data
  const setNewSort = (newSort) => {
    setNextPage(true)
    setSort(newSort)
    refetch({
      sort: newSort,
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
        { !props.snippet && (<SortMenu disableAll={ true }/>)}
        Loading... (design this)
      </div>
    )
  }

  // get data
  const { listArtistSongs } = data

  // in case no songs found
  if (!listArtistSongs.length) {
    return (
      <div>
        { !props.snippet && (<SortMenu disableAll={ false }/>)}
        no songs found (design this)
      </div>
    )
  }

  // display songs
  return (
    <section>
      { !props.snippet && (<SortMenu disableAll={ false }/>)}

      { props.display === DISPLAY.LIST && listArtistSongs.map(song => (
          <section key={ song.id }>
            <img src={ song.defaultImage ? song.defaultImage.url : `https://via.placeholder.com/30?text=no+photo?` }/>
            <Link href="/song/[id]/[slug]" as={ `/song/${ song.id }/${ song.slug }` }>
              <a>{ song.title }</a>
            </Link>
            <img src="https://via.placeholder.com/30?text=duration"/> { song.duration }
            <img src="https://via.placeholder.com/30?text=plays"/> { song.plays }
            <img src="https://via.placeholder.com/30?text=likes"/> { song.likes }
            <img src="https://via.placeholder.com/30?text=More+Actions"/>
          </section>
      ))}

      { props.display === DISPLAY.TEXT && listArtistSongs.map(song => (
          <span key={ song.id }>
            <Link href="/song/[id]/[slug]" as={ `/song/${ song.id }/${ song.slug }` }>
              <a>{ song.title }</a>
            </Link>{' '}
          </span>
      ))}

      { !props.snippet && (
          nextPage ?
          <button onClick={ () => loadMoreSongs() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Songs المزيد' }
          </button>
          :
          <p>all songs has been shown</p>
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
