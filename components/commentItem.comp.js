import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import { LIST_COMMENTS_QUERY, PAGE_SIZE, setNextPage } from './commentsList.comp'
import ErrorMessage from './errorMessage'

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteCommentById ($id: ID!) {
    deleteCommentById(id: $id)
  }
`

export default function CommentItem(props) {
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
        <Link href="#">
          <a>Like</a>
        </Link>
        { props.comment.likes &&
          <Link href="#"><a>{ props.comment.likes } liked it</a></Link>
        }
      </p>
      <p>
        <Link href="#">
          <a>Unlike</a>
        </Link>
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
