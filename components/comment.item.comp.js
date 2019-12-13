import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import { LIST_COMMENTS_QUERY, PAGE_SIZE as LIST_COMMENTS_PAGE_SIZE, setNextPage } from './comment.list.comp'
import CommentLikers, { LIST_COMMENT_LIKERS_QUERY, PAGE_SIZE as LIST_COMMENT_LIKERS_PAGE_SIZE } from './comment.Likers.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

const LIKE_COMMENT_MUTATION = gql`
  mutation likeComment ($commentId: ID!, $userId: ID!) {
    likeComment(commentId: $commentId, userId: $userId)
  }
`
const UNLIKE_COMMENT_MUTATION = gql`
  mutation unlikeComment ($commentId: ID!, $userId: ID!) {
    unlikeComment(commentId: $commentId, userId: $userId)
  }
`
const DELETE_COMMENT_MUTATION = gql`
  mutation deleteCommentById ($id: ID!) {
    deleteCommentById(id: $id)
  }
`

export default function CommentItem(props) {
  // set common query variables
  const listCommentsQueryVariables = {
    reference: {
      collection: props.comment.reference.collection,
      id: props.comment.reference.id,
    },
    page: 1,
    pageSize: LIST_COMMENTS_PAGE_SIZE,
  }
  const listCommentLikersQueryVariables = {
    commentId: props.comment.id,
    page: 1,
    pageSize: LIST_COMMENT_LIKERS_PAGE_SIZE,
  }

  // like comment mutation
  const [likeComment, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Raven.captureException(error.message, { extra: error })
      },
    }
  )

  // handling like event
  const likeCommentHandler = (commentId) => {
    // set query variables
    const likeCommentQueryVariables = {
      commentId: commentId,
      userId: loggedOnUser.id,
    }

    // execute likeComment and update likes in the cache
    likeComment({
      variables: likeCommentQueryVariables,
      update: (proxy, { data: { likeComment } }) => {
        // if successful like (not a repeated one)
        if (likeComment) {
          // find the comment or reply(child) that was liked and update its likes counter
          {
            // read cache
            const data = proxy.readQuery({
              query: LIST_COMMENTS_QUERY,
              variables: listCommentsQueryVariables,
            })
            // loop the parent comments first
            const parentIndex = data.listComments.findIndex(elem => elem.id === commentId)
            if (parentIndex >= 0) {
              data.listComments[parentIndex].likes++
            } else {
              // if not found in parents, search in the children
              for (let i = 0; i < data.listComments.length; i++) {
                if (data.listComments[i].children) {
                  const childIndex = data.listComments[i].children.findIndex(elem => elem.id === commentId)
                  if (childIndex >= 0) {
                    data.listComments[i].children[childIndex].likes++
                  }
                }
              }
            }
            // update cache
            proxy.writeQuery({
              query: LIST_COMMENTS_QUERY,
              variables: listCommentsQueryVariables,
              data: data,
            })
          }

          // update listCommentLikers in case if they're > 1
          // in case if they're = 1 then CommentLikers component will render correctly
          if (props.comment.likes > 1) {
            // read cache
            const listCommentLikersData = proxy.readQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
            })
            // update cache by adding loggedOnUser
            proxy.writeQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
              data: {
                listCommentLikers: [...listCommentLikersData.listCommentLikers, loggedOnUser],
              },
            })
          }
        }
      },
    })
  }

  // unlike comment mutation
  const [unlikeComment, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Raven.captureException(error.message, { extra: error })
      },
    }
  )

  // handling unlike event
  const unlikeCommentHandler = (commentId) => {
    // set query variables
    const unlikeCommentQueryVariables = {
      commentId: commentId,
      userId: loggedOnUser.id,
    }

    // execute unlikeComment and update likes in the cache
    unlikeComment({
      variables: unlikeCommentQueryVariables,
      update: (proxy, { data: { unlikeComment } }) => {
        // if successful unlike (not a repeated one)
        if (unlikeComment) {
          // find the comment or reply(child) that was unliked and update its likes counter
          {
            // read cache
            const data = proxy.readQuery({
              query: LIST_COMMENTS_QUERY,
              variables: listCommentsQueryVariables,
            })
            // loop the parent comments first
            const parentIndex = data.listComments.findIndex(elem => elem.id === commentId)
            if (parentIndex >= 0) {
              data.listComments[parentIndex].likes--
            } else {
              // if not found in parents, search in the children
              for (let i = 0; i < data.listComments.length; i++) {
                if (data.listComments[i].children) {
                  const childIndex = data.listComments[i].children.findIndex(elem => elem.id === commentId)
                  if (childIndex >= 0) {
                    data.listComments[i].children[childIndex].likes--
                  }
                }
              }
            }
            // update cache
            proxy.writeQuery({
              query: LIST_COMMENTS_QUERY,
              variables: listCommentsQueryVariables,
              data: data,
            })
          }

          // update listCommentLikers in case if they're = 1
          // in case if they're > 1 then CommentLikers component will render correctly
          if (props.comment.likes > 0) {
            // read cache
            const data = proxy.readQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
            })
            // update cache by removing loggedOnUser
            proxy.writeQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
              data: {
                listCommentLikers: data.listCommentLikers.filter(elem => elem.id != loggedOnUser.id),
              },
            })
          }
        }
      },
    })
  }

  // delete comment mutation
  const [deleteCommentById, { loading: loadingDelete, error: errorDelete }] = useMutation(
    DELETE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Raven.captureException(error.message, { extra: error })
      },
    }
  )

  // handling delete event
  const deleteComment = (commentId) => {
    if (confirm("Are you sure?")) {
      // set query variables
      const deleteCommentQueryVariables = {
        id: commentId,
      }

      // execute deleteComment and refetch listComments from the start for the deleted comment not to be shown
      // updating the cache is a hassle. paging becomes complicated.
      setNextPage(true)
      deleteCommentById({
        variables: deleteCommentQueryVariables,
        refetchQueries: () => [{
          query: LIST_COMMENTS_QUERY,
          variables: listCommentsQueryVariables
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  return (
    <div>
      <Link as={ `/user/${ props.comment.user.id }/${ props.comment.user.slug }` } href={`/user?id=${ props.comment.user.id }`}>
        <img src={ props.comment.user.imageUrl?props.comment.user.imageUrl:`https://via.placeholder.com/100?text=No+Photo` } alt={ props.comment.user.imageUrl && props.comment.user.username }/>
      </Link>
      <Link as={ `/user/${ props.comment.user.id }/${ props.comment.user.slug }` } href={`/user?id=${ props.comment.user.id }`}>
        <a>{ props.comment.user.username }</a>
      </Link>

      <p>Date { props.comment.createdDate }</p>
      <div dangerouslySetInnerHTML={{ __html: props.comment.text }} />

      <div>
        <button onClick={ () => likeCommentHandler(props.comment.id) } disabled={ loadingLike }>
          Like
        </button>
        { !!(props.comment.likes) &&
          <CommentLikers comment={ props.comment } />
        }
        { errorLike && (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />) }
      </div>
      <p>
        <button onClick={ () => unlikeCommentHandler(props.comment.id) } disabled={ loadingUnlike }>
          Unlike
        </button>
        { errorUnlike && (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />) }
      </p>
      <p>
        <Link href="#">
          <a>flag</a>
        </Link>
      </p>
      <div hidden={ props.comment.user.id != loggedOnUser.id }>
        <button onClick={ () => deleteComment(props.comment.id) } disabled={ loadingDelete }>
          X delete
        </button>
        { errorDelete && (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />) }
      </div>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </div>
  )
}
