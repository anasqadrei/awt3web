import { useState } from 'react'
import Link from 'next/link'
import { gql, useQuery, useMutation, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import { LIST_USER_PLAYLISTS_QUERY, DEFAULT_SORT, PAGE_SIZE } from 'components/playlist.user.comp'
import ErrorMessage from 'components/errorMessage'

const ADD_SONG_TO_PLAYLIST_MUTATION = gql`
  mutation addSongToPlaylist ($playlistId: ID!, $songId: ID!, $userId: ID!) {
    addSongToPlaylist(playlistId: $playlistId, songId: $songId, userId: $userId) {
      id
      name
      slug
      url
      imageUrl
      desc
      hashtags
      private
      duration
      createdDate
      lastUpdatedDate
      user {
        id
        username
        slug
      }
      songs {
        id
        title
        slug
        artist {
          id
          name
          slug
        }
        duration
        defaultImage {
          url
        }
      }
      comments
      plays
      usersPlayed
      likes
      shares
    }
  }
`

const Comp = (props) => {
  // mutation tuple
  const [addSongToPlaylist, { loading: loadingAddSong, error: errorAddSong, data: dataAddSong }] = useMutation(
    ADD_SONG_TO_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set list playlists query variables
  const vars = {
    userId: getAuthUser?.id,
    private: props.private,
    page: 1,
    pageSize: PAGE_SIZE,
    sort: DEFAULT_SORT,
  }

  // excute query
  //
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching more data.
  //
  // onCompleted() decides paging. it compares currentListLength with the newListLength.
  // if they're equal, then it means no more items which is an indication to stop paging.
  const { loading: loadingList, error: errorList, data: dataList, fetchMore, networkStatus } = useQuery (
    LIST_USER_PLAYLISTS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      skip: !getAuthUser,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listUserPlaylists?.length ?? 0;

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
  if (loadingList && !loadingMore) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (errorList) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!dataList?.listUserPlaylists?.length) {
    return (
      <div>
        None
      </div>
    )
  }

  // get data
  const { listUserPlaylists } = dataList

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listUserPlaylists.length / vars.pageSize) + 1
      },
    })
  }

  // function: handle onClick event
  const handleAdd = (playlistId) => {
    // execute mutation and update the cache
    addSongToPlaylist({
      variables: {
        playlistId: playlistId,
        songId: props.song.id,
        userId: getAuthUser?.id,
      },
      update: (cache, { data: { addSongToPlaylist } }) => {
        // write to cache
        cache.writeQuery({
          query: GET_PLAYLIST_QUERY,
          variables: { id: playlistId },
          data: addSongToPlaylist,
        })
      },
    })
  }

  // display component
  return (
    <section>
      {
        listUserPlaylists.map(playlist => (
          <div key={ playlist.id }>
            <button onClick={ () => handleAdd(playlist.id) } disabled={ loadingAddSong || dataAddSong?.addSongToPlaylist.id === playlist.id }>
              Add
            </button>
            <img src={ playlist.imageUrl ? playlist.imageUrl : `https://via.placeholder.com/30?text=no+photo?` }/>
            <Link href="/playlist/[id]/[slug]" as={ `/playlist/${ playlist.id }/${ playlist.slug }` }>
              <a>{ playlist.name }</a>
            </Link>
          </div>
        ))
      }

      {
        nextPage ? (
          <button onClick={ () => loadMore() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Playlists المزيد' }
          </button>
        ) : (
          <p>all playlists has been shown</p>
        )
      }

      { errorAddSong && <ErrorMessage/> }
    </section>
  )
}

export default Comp