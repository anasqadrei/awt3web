import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import { LIST_COMMENTS_QUERY, PAGE_SIZE, setNextPage } from './comment.list.comp'
import ErrorMessage from './errorMessage'

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
      userId: "1",
    }
    const listCommentsQueryVariables = {
      reference: {
        collection: props.comment.reference.collection,
        id: props.comment.reference.id,
      },
      page: 1,
      pageSize: PAGE_SIZE,
    }

    // execute likeComment and update likes in the cache
    likeComment({
      variables: likeCommentQueryVariables,
      update: (proxy, { data: { likeComment } }) => {
        // find the comment or reply(child) that was liked and update its likes counter
        if (likeComment) {
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

  // handling like event
  const unlikeCommentHandler = (commentId) => {
    // set query variables
    const unlikeCommentQueryVariables = {
      commentId: commentId,
      userId: "1",
    }
    const listCommentsQueryVariables = {
      reference: {
        collection: props.comment.reference.collection,
        id: props.comment.reference.id,
      },
      page: 1,
      pageSize: PAGE_SIZE,
    }

    // execute unlikeComment and update likes in the cache
    unlikeComment({
      variables: unlikeCommentQueryVariables,
      update: (proxy, { data: { unlikeComment } }) => {
        // find the comment or reply(child) that was unliked and update its likes counter
        if (unlikeComment) {
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
      const listCommentsQueryVariables = {
        reference: {
          collection: props.comment.reference.collection,
          id: props.comment.reference.id,
        },
        page: 1,
        pageSize: PAGE_SIZE,
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

      <p>
        <button onClick={ () => likeCommentHandler(props.comment.id) } disabled={ loadingLike }>
          Like
        </button>
        { !!(props.comment.likes) && <Link href="#"><a>{ props.comment.likes } liked it</a></Link> }
        { errorLike && (<ErrorMessage message='حدث خطأ ما. الرجاء إعادة المحاولة.' />) }
      </p>
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
      <div>
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
