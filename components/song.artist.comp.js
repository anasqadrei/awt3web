import { useState } from 'react'
import Link from 'next/link'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { DISPLAY } from 'lib/constants'
import Sort from 'components/sort.comp'
import ErrorMessage from 'components/errorMessage'

const SORT_OPTIONS = [
  { sort: 'likes', label: 'LIKES' },
  { sort: '-likes', label: '-LIKES' },
  { sort: 'plays', label: 'PLAYS' },
  { sort: '-plays', label: '-PLAYS' },
  { sort: 'createdDate', label: 'CREATEDDATE' },
  { sort: '-createdDate', label: '-CREATEDDATE' },
  { sort: 'title', label: 'TITLE' },
  { sort: '-title', label: '-TITLE' },
]
const PAGE_SIZE = 2
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

export default (props) => {
  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // sorting
  const [sort, setSort] = useState('-createdDate')

  // set query variables
  const vars = {
    artistId: props.artistId,
    sort: props.sort || sort,
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
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_ARTIST_SONGS_QUERY,
    {
      variables: vars,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listArtistSongs?.length ?? 0;

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
        { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/> }
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
  if (!data?.listArtistSongs?.length) {
    return (
      <div>
        { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ true }/> }
        no songs found (design this)
      </div>
    )
  }

  // get data
  const { listArtistSongs } = data

  // function: change sort option
  const changeSort = (newSort) => {
    // reset paging
    setNextPage(true)
    setCurrentListLength(0)
    // set new sort and refetch data
    setSort(newSort)
    refetch({ sort: newSort })
  }

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listArtistSongs.length / vars.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      { !props.snippet && <Sort optionsList={ SORT_OPTIONS } sort={ sort } disableAll={ false } onClick={ changeSort }/> }

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
          <button onClick={ () => loadMore() } disabled={ loadingMore }>
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
