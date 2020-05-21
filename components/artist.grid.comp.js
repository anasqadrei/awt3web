import { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'
import ArtistGridItem from 'components/artist.gridItem.comp'

const PAGE_SIZE = 5
const LIST_ARTISTS_QUERY = gql`
  query listArtists ($sort: String!, $page: Int!, $pageSize: Int!) {
    listArtists(sort: $sort, page: $page, pageSize: $pageSize) {
      id
      name
      slug
      imageUrl
      likes
      songs
    }
  }
`

export default function ArtistsGrid() {
  // SortMenu component
  const SortMenu = (props) => {
    return (
      <div>
        <button onClick={ () => setNewSort('likes') } hidden={ sort != '-likes' } disabled={ props.disableAll }>likes</button>
        <button onClick={ () => setNewSort('-likes') } hidden={ sort === '-likes' } disabled={ props.disableAll }>-likes</button>
        <button onClick={ () => setNewSort('songs') } hidden={ sort != '-songs' } disabled={ props.disableAll }>songs</button>
        <button onClick={ () => setNewSort('-songs') } hidden={ sort === '-songs' } disabled={ props.disableAll }>-songs</button>
      </div>
    )
  }

  // paging
  const [nextPage, setNextPage] = useState(true)

  // sorting
  const [sort, setSort] = useState('-likes')

  // set query variables
  const queryVariables = {
    sort: sort,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching
  // more data
  const { loading, error, data, fetchMore, networkStatus, refetch } = useQuery (
    LIST_ARTISTS_QUERY,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched artists. also decide on paging
  const loadMoreArtists = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listArtists.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.listArtists || (fetchMoreResult.listArtists && fetchMoreResult.listArtists.length === 0)) {
          setNextPage(false)
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listArtists: [...previousResult.listArtists, ...fetchMoreResult.listArtists],
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
    return (<div><SortMenu disableAll={ true }/>Loading... (design this)</div>)
  }

  // get data
  const { listArtists } = data

  // in case no artists found
  if (!listArtists.length) {
    return (<div><SortMenu disableAll={ false }/>no artists found (design this)</div>)
  }

  // display artists otherwise
  return (
    <section>
      <SortMenu disableAll={ false }/>
      { listArtists.map(artist => (
        <ArtistGridItem key={ artist.id } artist={ artist } />
      ))}

      { nextPage ?
        <button onClick={ () => loadMoreArtists() } disabled={ loadingMore }>
          { loadingMore ? 'Loading...' : 'Show More Artists المزيد' }
        </button>
        :
        <p>all artists has been shown</p>
      }

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
