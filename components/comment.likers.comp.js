import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import ErrorMessage from './errorMessage'

export const PAGE_SIZE = 10
export const LIST_COMMENT_LIKERS_QUERY = gql`
  query listCommentLikers ($commentId: ID!, $page: Int!, $pageSize: Int!) {
    listCommentLikers(commentId: $commentId, page: $page, pageSize: $pageSize) {
      id
      username
    }
  }
`

export default function CommentLikers(props) {
  // set query variables
  const listCommentLikersQueryVariables = {
    commentId: props.comment.id,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data }  = useQuery (
    LIST_COMMENT_LIKERS_QUERY,
    {
      variables: listCommentLikersQueryVariables,
    }
  )

  // error handling
  if (error) {
    Raven.captureException(error.message, { extra: error })
    return (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />)
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { listCommentLikers } = data

  return (
    <div>
      { props.comment.likes } liked it
      { listCommentLikers.map(user => (
        <div key={ user.id }>{ user.username }</div>
      ))}
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </div>
  )
}