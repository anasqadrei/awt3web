import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import CommentItem from './commentItem.comp'
import ErrorMessage from './errorMessage'

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

// a paging flag
let nextPage = true
export function setNextPage(flag) {
  nextPage = flag
}

export default function CommentsList(props) {
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
  // setting notifyOnNetworkStatusChange to true will make the component rerender when
  // the "networkStatus" changes, so we are able to know if it is fetching
  // more data
  const { loading, error, data, fetchMore, networkStatus } = useQuery (
    LIST_COMMENTS_QUERY,
    {
      variables: listCommentsQueryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched comments. also decide on paging
  const loadMoreComments = () => {
    fetchMore({
      variables: {
        page: Math.ceil(listComments.length/listCommentsQueryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || (fetchMoreResult.listComments && fetchMoreResult.listComments.length === 0)) {
          nextPage = false
          return previousResult
        }
        return Object.assign({}, previousResult, {
          listComments: [...previousResult.listComments, ...fetchMoreResult.listComments],
        })
      },
    })
  }

  // error handling
  if (error) {
    Raven.captureException(error.message, { extra: error })
    return <ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />
  }

  // initial loading
  if (loading && !loadingMore) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listComments } = data

  // in case no comments found
  if (!listComments.length) {
    return (<div>no comments found (design this)</div>)
  }

  // display comments otherwise
  return (
    <section>
      { props.total && `${ props.total } commented` }

      { listComments.map(comment => (
        <div key={ comment.id }>
          <CommentItem comment={ comment } />
          { comment.children && comment.children.map( reply => (
            <div key={ reply.id }>
              <CommentItem comment={ reply } />
            </div>
          ))}
          Reply
          <textarea row="2"/>
          <Link href="#">
            <a>Post Reply</a>
          </Link>
        </div>
      ))}

      { props.total && (
          (loadingMore || nextPage)?
          <button onClick={ () => loadMoreComments() } disabled={ loadingMore }>
            { loadingMore ? 'Loading... جاري عرض المزيد من التعليقات ' : 'Show More Comments المزيد' }
          </button>
          :
          <p>all comments has been shown تم عرض جميع التعليقات</p>
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
