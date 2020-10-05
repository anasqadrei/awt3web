import { useState } from 'react'
import { gql, useQuery, NetworkStatus } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { validateCommentsCollection, getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import ParentComment from 'components/comment.parent.comp'
import ErrorMessage from 'components/errorMessage'

export const PAGE_SIZE = 25
export const LIST_COMMENTS_QUERY = gql`
  query listComments ($reference: CommentReferenceInput!, $page: Int!, $pageSize: Int!) {
    listComments(reference: $reference, page: $page, pageSize: $pageSize) {
      id
      reference {
        collection
        id
      }
      text
      createdDate
      likes
      children {
        id
        reference {
          collection
          id
        }
        text
        createdDate
        likes
        user {
          id
          username
          slug
          imageUrl
        }
      }
      user {
        id
        username
        slug
        imageUrl
      }
    }
  }
`

export default (props) => {
  // validate collection name
  if (!validateCommentsCollection(props.collection)) {
    return <ErrorMessage message='invalid collection name'/>
  }

  // paging
  const [nextPage, setNextPage] = useState(true)
  const [currentListLength, setCurrentListLength] = useState(0)

  // this is to get number of comments
  // the query will most likey use cache
  // 1. query
  const query = getCommentsCollectionQuery(props.collection)
  const { data: dataCollection }  = useQuery (
    query,
    {
      variables: { id: props.id },
    }
  )
  // 2. decide total based on collection and query data
  let total
  switch (props.collection) {
    case SONGS_COLLECTION:
      total = dataCollection?.getSong?.comments ?? 0
      break
    case ARTISTS_COLLECTION:
      total = dataCollection?.getArtist?.comments ?? 0
      break
    case PLAYLISTS_COLLECTION:
      total = dataCollection?.getPlaylist?.comments ?? 0
      break
    case BLOGPOSTS_COLLECTION:
      total = dataCollection?.getBlogpost?.comments ?? 0
      break
  }

  // set query variables
  const listCommentsQueryVariables = {
    reference: {
      collection: props.collection,
      id: props.id
    },
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
    LIST_COMMENTS_QUERY,
    {
      variables: listCommentsQueryVariables,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        // get new length of data (cached + newly fetched) with default = 0
        const newListLength = data?.listComments?.length ?? 0;

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
  if (!data?.listComments?.length) {
    return (
      <div>
        no comments found (design this)
      </div>
    )
  }

  // get data
  const { listComments } = data

  // function: get (and append at cache) new fetched data
  const loadMore = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listComments.length / listCommentsQueryVariables.pageSize) + 1
      },
    })
  }

  // display data
  return (
    <section>
      { total && `${ total } commented` }

      { listComments.map(comment => (
        <ParentComment key={ comment.id } comment={ comment }/>
      ))}

      { nextPage ?
        <button onClick={ () => loadMore() } disabled={ loadingMore }>
          { loadingMore ? 'Loading... جاري عرض المزيد من التعليقات ' : 'Show More Comments المزيد' }
        </button>
        :
        <p>all comments has been shown تم عرض جميع التعليقات</p>
      }
    </section>
  )
}
