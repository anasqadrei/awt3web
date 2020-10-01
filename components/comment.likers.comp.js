import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

export const PAGE_SIZE = 10
export const LIST_COMMENT_LIKERS_QUERY = gql`
  query listCommentLikers ($commentId: ID!, $page: Int!, $pageSize: Int!) {
    listCommentLikers(commentId: $commentId, page: $page, pageSize: $pageSize) {
      id
      username
    }
  }
`

export default (props) => {
  // set query variables
  const listCommentLikersQueryVariables = {
    commentId: props.commentId,
    page: 1,
    pageSize: PAGE_SIZE,
  }

  // excute query
  const { loading, error, data }  = useQuery (
    LIST_COMMENT_LIKERS_QUERY,
    {
      variables: listCommentLikersQueryVariables,
      ssr: false,
    }
  )

  // initial loading
  if (loading) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return (<ErrorMessage/>)
  }

  // in case no data found
  if (!data?.listCommentLikers?.length) {
    return null
  }

  // get data
  const { listCommentLikers } = data

  // display data
  return (
    <div>
      { listCommentLikers.length } liked it

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
