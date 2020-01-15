import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
// import { GET_SONG_QUERY, SONGS_COLLECTION } from './song.comp'
import { GET_ARTIST_QUERY, ARTISTS_COLLECTION } from './artist.comp'
import { GET_BLOGPOST_QUERY, BLOGPOSTS_COLLECTION } from './blogpost.comp'
import { LIST_COMMENTS_QUERY, PAGE_SIZE as LIST_COMMENTS_PAGE_SIZE, setNextPage } from './comment.list.comp'
import CommentLikers, { LIST_COMMENT_LIKERS_QUERY, PAGE_SIZE as LIST_COMMENT_LIKERS_PAGE_SIZE } from './comment.Likers.comp'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}
// const loggedOnUser = {
//   id: "2",
//   username: "Anas",
//   __typename: "User",
// }
// const loggedOnUser = null

const CHECK_USER_LIKE_COMMENTS_QUERY = gql`
  query checkUserLikeComments ($userId: ID!, $commentIds: [ID]!) {
    checkUserLikeComments(userId: $userId, commentIds: $commentIds)
  }
`
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
const FLAG_COMMENT_MUTATION = gql`
  mutation flagComment ($commentId: ID!, $userId: ID!, $reason: String!) {
    flagComment(commentId: $commentId, userId: $userId, reason: $reason)
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
  const checkUserLikeCommentsQueryVariables = {
    userId: loggedOnUser && loggedOnUser.id,
    commentIds: [props.comment.id],
  }
  const listCommentLikersQueryVariables = {
    commentId: props.comment.id,
    page: 1,
    pageSize: LIST_COMMENT_LIKERS_PAGE_SIZE,
  }

  // decide to either show or hide like and unlike buttons
  let hideLike = false
  if (loggedOnUser) {
    // check if user like comment query
    const { data }  = useQuery (
      CHECK_USER_LIKE_COMMENTS_QUERY,
      {
        variables: checkUserLikeCommentsQueryVariables,
      }
    )
    // hide like button if user already liked comment
    if (data) {
      const { checkUserLikeComments } = data
      if (checkUserLikeComments && checkUserLikeComments.length > 0 && checkUserLikeComments[0] === props.comment.id) {
        hideLike = true
      }
    }
  }

  // like comment mutation
  const [likeComment, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const likeCommentHandler = () => {
    // set query variables
    const likeCommentQueryVariables = {
      commentId: props.comment.id,
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
            const parentIndex = data.listComments.findIndex(elem => elem.id === props.comment.id)
            if (parentIndex >= 0) {
              data.listComments[parentIndex].likes++
            } else {
              // if not found in parents, search in the children
              for (let i = 0; i < data.listComments.length; i++) {
                if (data.listComments[i].children) {
                  const childIndex = data.listComments[i].children.findIndex(elem => elem.id === props.comment.id)
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

          // update checkUserLikeComments cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: checkUserLikeCommentsQueryVariables,
            })
            // update cache by adding comment id
            proxy.writeQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: checkUserLikeCommentsQueryVariables,
              data: {
                ...data,
                checkUserLikeComments: [...data.checkUserLikeComments, props.comment.id],
              },
            })
          }

          // update listCommentLikers in case if they're > 1
          // in case if they're = 1 then CommentLikers component will render correctly
          if (props.comment.likes > 1) {
            // read cache
            const data = proxy.readQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
            })
            // update cache by adding loggedOnUser
            proxy.writeQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: listCommentLikersQueryVariables,
              data: {
                listCommentLikers: [...data.listCommentLikers, loggedOnUser],
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
        Sentry.captureException(error)
      },
    }
  )

  // handling unlike event
  const unlikeCommentHandler = () => {
    // set query variables
    const unlikeCommentQueryVariables = {
      commentId: props.comment.id,
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
            const parentIndex = data.listComments.findIndex(elem => elem.id === props.comment.id)
            if (parentIndex >= 0) {
              data.listComments[parentIndex].likes--
            } else {
              // if not found in parents, search in the children
              for (let i = 0; i < data.listComments.length; i++) {
                if (data.listComments[i].children) {
                  const childIndex = data.listComments[i].children.findIndex(elem => elem.id === props.comment.id)
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

          // update checkUserLikeComments cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: checkUserLikeCommentsQueryVariables,
            })
            // update cache by removing comment id
            proxy.writeQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: checkUserLikeCommentsQueryVariables,
              data: {
                ...data,
                checkUserLikeComments: data.checkUserLikeComments.filter(elem => { elem === props.comment.id }),
              },
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

  // flag comment mutation
  const [flagComment, { loading: loadingFlag }] = useMutation(
    FLAG_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling flag event
  const flagCommentHandler = () => {
    // TODO: reasons
    // set query variables
    const flagCommentQueryVariables = {
      commentId: props.comment.id,
      userId: loggedOnUser.id,
      reason: "temp reason",
    }

    // execute flagComment
    flagComment({
      variables: flagCommentQueryVariables,
    })
  }

  // delete comment mutation
  const [deleteCommentById, { loading: loadingDelete, error: errorDelete }] = useMutation(
    DELETE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling delete event
  const deleteCommentHandler = () => {
    if (confirm("Are you sure?")) {
      // set query variables
      const deleteCommentQueryVariables = {
        id: props.comment.id,
      }

      // execute deleteComment and refetch listComments from the start for the deleted comment not to be shown
      // updating the cache is a hassle. paging becomes complicated.
      setNextPage(true)
      deleteCommentById({
        variables: deleteCommentQueryVariables,
        update: (proxy) => {
          // read cache
          let query
          switch (props.comment.reference.collection) {
            // TODO: uncomment
            // case SONGS_COLLECTION:
            //   query = GET_SONG_QUERY
            //   break
            case ARTISTS_COLLECTION:
              query = GET_ARTIST_QUERY
              break
            case BLOGPOSTS_COLLECTION:
              query = GET_BLOGPOST_QUERY
              break
            default:
              return
          }
          const data = proxy.readQuery({
            query: query,
            variables: { id: props.comment.reference.id },
          })

          // update the number of comments in the cache
          let update = { ...data }
          const replies = props.comment.children?props.comment.children.length:0
          switch (props.comment.reference.collection) {
            // TODO: uncomment
            // case SONGS_COLLECTION:
            //   update.getSong = {
            //     ...data.getSong,
            //     comments: data.getSong.comments - 1 - replies,
            //   }
            //   break
            case ARTISTS_COLLECTION:
              update.getArtist = {
                ...data.getArtist,
                comments: data.getArtist.comments - 1 - replies,
              }
              break
            case BLOGPOSTS_COLLECTION:
              update.getBlogpost = {
                ...data.getBlogpost,
                comments: data.getBlogpost.comments - 1 - replies,
              }
              break
            default:
              return
          }
          proxy.writeQuery({
            query: query,
            variables: { id: props.comment.reference.id },
            data: update,
          })
        },
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
        <button hidden={ hideLike } onClick={ () => likeCommentHandler() } disabled={ loadingLike }>
          Like
        </button>
        { !!(props.comment.likes) &&
          <CommentLikers comment={ props.comment } />
        }
        { errorLike && (<ErrorMessage/>) }
      </div>
      <p>
        <button hidden={ !hideLike } onClick={ () => unlikeCommentHandler() } disabled={ loadingUnlike }>
          Unlike
        </button>
        { errorUnlike && (<ErrorMessage/>) }
      </p>
      <div hidden={ !loggedOnUser }>
        <button onClick={ () => flagCommentHandler() } disabled={ loadingFlag }>
          flag
        </button>
      </div>
      <div hidden={ !loggedOnUser || loggedOnUser.id != props.comment.user.id }>
        <button onClick={ () => deleteCommentHandler() } disabled={ loadingDelete }>
          X delete
        </button>
        { errorDelete && (<ErrorMessage/>) }
      </div>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </div>
  )
}
