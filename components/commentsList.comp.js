import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { NetworkStatus } from 'apollo-client'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import ErrorMessage from './errorMessage'

const PAGE_SIZE = 25
const LIST_COMMENTS_QUERY = gql`
  query listComments ($reference: CommentReferenceInput!, $page: Int!, $pageSize: Int!) {
    listComments(reference: $reference, page: $page, pageSize: $pageSize) {
      id
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

let nonEmptyList = true

export default function CommentsList(props) {
  // set query variables
  const queryVariables = {
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
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    }
  )

  // loading more network status. fetchMore: query is currently in flight
  const loadingMore = (networkStatus === NetworkStatus.fetchMore)

  // get and append new fetched comments
  const loadMoreComments = () => {
    fetchMore({
      variables: {
        page: (listComments.length/queryVariables.pageSize)+1
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult
        }
        if (fetchMoreResult.listComments && fetchMoreResult.listComments.length === 0) {
          nonEmptyList = false
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

  // get data and decide on paging
  const { listComments } = data

  // * listComments.length % queryVariables.pageSize is > 0 means it is definitely the last page.
  // e.g. length = 35, pageSize 10
  // * if nonEmptyList is set to false, it means page requested returned an emptylist.
  // e.g. length = 30, pageSize 10
  // There is no next page in the above two cases
  const nextPage = !(listComments.length%queryVariables.pageSize) && nonEmptyList

  // in case no comments found
  if (!listComments.length) {
    return (<div>no comments found (design this)</div>)
  }

  // display comments
  return (
    <section>
      { props.total && `${ props.total } commented` }
      { listComments.map(comment => (
        <div key={ comment.id }>
          <Link as={ `/user/${ comment.user.id }/${ comment.user.slug }` } href={`/user?id=${ comment.user.id }`}>
            <img src={ comment.user.imageUrl?comment.user.imageUrl:`https://via.placeholder.com/100?text=No+Photo` } alt={ comment.user.imageUrl && comment.user.username }/>
          </Link>
          <Link as={ `/user/${ comment.user.id }/${ comment.user.slug }` } href={`/user?id=${ comment.user.id }`}>
            <a>{ comment.user.username }</a>
          </Link>

          <p>Date { comment.createdDate }</p>
          <div dangerouslySetInnerHTML={{ __html: comment.text }} />

          <p>
            <Link href="#">
              <a>Like</a>
            </Link>
            { comment.likes &&
              <Link href="#"><a>{ comment.likes } liked it</a></Link>
            }
          </p>
          <p>
            <Link href="#">
              <a>Unlike</a>
            </Link>
          </p>
          <p>
            <Link href="#">
              <a>X delete</a>
            </Link>
          </p>
          <div>
            { comment.children && comment.children.map( reply => (
              <div key={ reply.id }>
                <Link as={ `/user/${ comment.user.id }/${ comment.user.slug }` } href={`/user?id=${ comment.user.id }`}>
                  <img src={ reply.user.imageUrl?reply.user.imageUrl:`https://via.placeholder.com/100?text=No+Photo` } alt={ reply.user.imageUrl && reply.user.username }/>
                </Link>
                <Link as={ `/user/${ comment.user.id }/${ comment.user.slug }` } href={`/user?id=${ comment.user.id }`}>
                  <a>{ reply.user.username }</a>
                </Link>

                <p>Date { reply.createdDate }</p>
                <div dangerouslySetInnerHTML={{ __html: reply.text }} />

                <p>
                  <Link href="#">
                    <a>Like</a>
                  </Link>
                  { reply.likes &&
                    <Link href="#"><a>{ reply.likes } liked it</a></Link>
                  }
                </p>
                <p>
                  <Link href="#">
                    <a>Unlike</a>
                  </Link>
                </p>
                <p>
                  <Link href="#">
                    <a>X delete</a>
                  </Link>
                </p>
              </div>
            ))}
            Reply
            <textarea row="2"/>
            <Link href="#">
              <a>Post Reply</a>
            </Link>
          </div>
        </div>
      ))}

      { props.total && (
          (loadingMore || nextPage)?
          <button onClick={ () => loadMoreComments() } disabled={ loadingMore }>
            { loadingMore ? 'Loading...' : 'Show More Comments' }
          </button>
          :
          <p>all comments has been shown</p>
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
