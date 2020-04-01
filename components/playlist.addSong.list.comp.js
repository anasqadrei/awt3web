import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { GET_PLAYLIST_QUERY } from './playlist.comp'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

export const PAGE_SIZE = 3
export const SORT = '-createdDate'
export const LIST_USER_PLAYLISTS_QUERY = gql`
  query listUserPlaylists ($userId: ID!, $private: Boolean!, $sort: String!, $page: Int!, $pageSize: Int!) {
    listUserPlaylists(userId: $userId, private: $private, sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
    }
  }
`
const ADD_SONG_TO_PLAYLIST_MUTATION = gql`
  mutation addSongToPlaylist ($playlistId: ID!, $songId: ID!) {
    addSongToPlaylist(playlistId: $playlistId, songId: $songId) {
      id
      name
      slug
      duration
      lastUpdatedDate
    }
  }
`

export default function AddSongToListedPlaylist(props) {
  // paging
  const [nextPage, setNextPage] = useState(true)

  // add song to playlist mutation
  const [addSongToPlaylist, { loading: loadingAddSong, error: errorAddSong, data: dataAddSong }] = useMutation(
    ADD_SONG_TO_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling add song click event
  const addSongHandler = (playlistId) => {
    // set add song query variables
    const addSongQueryVariables = {
      playlistId: playlistId,
      songId: props.song.id,
    }
    // execute addSongToPlaylist and update playlist in the cache
    addSongToPlaylist({
      variables: addSongQueryVariables,
      update: (proxy, { data: { addSongToPlaylist } }) => {
        // read cache
        const data = proxy.readQuery({
          query: GET_PLAYLIST_QUERY,
          variables: { id: playlistId },
        })
        // update cache
        proxy.writeQuery({
          query: GET_PLAYLIST_QUERY,
          variables: { id: playlistId },
          data: {
            ...data,
            getPlaylist: {
              ...data.getPlaylist,
              duration: addSongToPlaylist.duration,
              lastUpdatedDate: addSongToPlaylist.lastUpdatedDate,
              songs: [...data.getPlaylist.songs, props.song]
            }
          },
        })
      },
    })
  }

  // set list playlists query variables
  const listPlaylistsQueryVariables = {
    userId: loggedOnUser.id,
    private: props.private,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: SORT,
  }

  // excute query
  const { loading: loadingList, error: errorList, data: dataList, fetchMore, networkStatus } = useQuery (
    LIST_USER_PLAYLISTS_QUERY,
    {
      variables: listPlaylistsQueryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched playlists. also decide on paging
  const loadMorePlaylists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserPlaylists.length/listPlaylistsQueryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listUserPlaylists || (fetchMoreResult.listUserPlaylists && fetchMoreResult.listUserPlaylists.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listUserPlaylists: [...previousResult.listUserPlaylists, ...fetchMoreResult.listUserPlaylists],
        })
      },
    })
  }

  // error handling
  if (errorList) {
    Sentry.captureException(errorList)
    return <ErrorMessage/>
  }

  // initial loading
  if (loadingList && !loadingMore) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listUserPlaylists } = dataList

  // in case no playlists found
  if (!listUserPlaylists.length) {
    return (<div>None</div>)
  }

  // display playlists
  return (
    <section>
      { listUserPlaylists.map(playlist => (
        <div key={ playlist.id }>
          <button onClick={ () => addSongHandler(playlist.id) } disabled={ loadingAddSong || (dataAddSong && dataAddSong.addSongToPlaylist.id === playlist.id ) }>
            add
          </button>
          <img src={ playlist.imageUrl ? playlist.imageUrl : `https://via.placeholder.com/30?text=no+photo?` }/>
          <Link href="/playlist/[id]/[slug]" as={ `/playlist/${ playlist.id }/${ playlist.slug }` }>
            <a>{ playlist.name }</a>
          </Link>
        </div>
      ))}

      { nextPage ?
        <button onClick={ () => loadMorePlaylists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
        </button>
        :
        <p>all playlists has been shown</p>
      }
    </section>
  )
}
