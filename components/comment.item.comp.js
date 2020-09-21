import Link from 'next/link'
import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser, postLoginAction, queryPostLoginAction } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import { getCommentsCollectionQuery } from 'lib/commentsCollection'
import { SONGS_COLLECTION, ARTISTS_COLLECTION, PLAYLISTS_COLLECTION, BLOGPOSTS_COLLECTION } from 'lib/constants'
import { LIST_COMMENTS_QUERY, PAGE_SIZE as LIST_COMMENTS_PAGE_SIZE } from 'components/comment.list.comp'
import CommentLikers, { LIST_COMMENT_LIKERS_QUERY, PAGE_SIZE as LIST_COMMENT_LIKERS_PAGE_SIZE } from 'components/comment.Likers.comp'
import ErrorMessage from 'components/errorMessage'

const POST_LOGIN_ACTION = 'LIKE_COMMENT'
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

export default (props) => {
  // mutation tuples
  const [likeComment, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikeComment, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [flagComment, { loading: loadingFlag, error: errorFlag }] = useMutation(
    FLAG_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [deleteCommentById, { loading: loadingDelete, error: errorDelete }] = useMutation(
    DELETE_COMMENT_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set common query variables
  const varsListComments = {
    reference: {
      collection: props.comment.reference.collection,
      id: props.comment.reference.id,
    },
    page: 1,
    pageSize: LIST_COMMENTS_PAGE_SIZE,
  }
  const varsCheckUserLikeComments = {
    userId: getAuthUser?.id,
    commentIds: [props.comment.id],
  }
  const varsListCommentLikers = {
    commentId: props.comment.id,
    page: 1,
    pageSize: LIST_COMMENT_LIKERS_PAGE_SIZE,
  }

  // check if authenticated user liked comment
  const { data }  = useQuery (
    CHECK_USER_LIKE_COMMENTS_QUERY,
    {
      variables: varsCheckUserLikeComments,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide like and unlike buttons
  const hideLike = (data?.checkUserLikeComments?.[0] == props.comment.id) || false

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    getAuthUser && likeComment({
      variables: {
        commentId: props.comment.id,
        userId: getAuthUser.id,
      },
      update: (cache, { data: { likeComment } }) => {
        // if a successful like (not a repeated one)
        if (likeComment) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(props.comment),
              fields: {
                likes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user liked comment
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: varsCheckUserLikeComments,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update list of liked comments
            dataWrite.checkUserLikeComments = [...dataWrite.checkUserLikeComments || [], props.comment.id]

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: varsCheckUserLikeComments,
              data: dataWrite,
            })
          }

          // update list of likers
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: varsListCommentLikers,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update list of likers
            dataWrite.listCommentLikers = [...dataWrite.listCommentLikers || [], getAuthUser]

            // write to cache
            cache.writeQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: varsListCommentLikers,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleUnlike = () => {
    // execute mutation and update the cache
    unlikeComment({
      variables: {
        commentId: props.comment.id,
        userId: getAuthUser.id,
      },
      update: (cache, { data: { unlikeComment } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikeComment) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(props.comment),
              fields: {
                likes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user liked comment
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: varsCheckUserLikeComments,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update list of liked comments
            dataWrite.checkUserLikeComments = dataWrite.checkUserLikeComments.filter(elem => { elem === props.comment.id })

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_COMMENTS_QUERY,
              variables: varsCheckUserLikeComments,
              data: dataWrite,
            })
          }

          // update list of likers
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: varsListCommentLikers,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update list of likers
            dataWrite.listCommentLikers = dataWrite.listCommentLikers.filter(elem => elem.id != getAuthUser.id)

            // write to cache
            cache.writeQuery({
              query: LIST_COMMENT_LIKERS_QUERY,
              variables: varsListCommentLikers,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleFlag = (reason) => {
    // execute mutation
    flagComment({
      variables: {
        commentId: props.comment.id,
        userId: getAuthUser.id,
        reason: reason,
      },
    })
  }

  // function: handle onClick event
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      // execute mutation and update the cache
      // only update the number of comments in the cache
      // refetch listComments because updating them in cache is a hassle. paging becomes complicated.
      deleteCommentById({
        variables: {
          id: props.comment.id,
        },
        update: (cache) => {
          // read from cache
          const query = getCommentsCollectionQuery(props.comment.reference.collection)
          const dataRead = cache.readQuery({
            query: query,
            variables: { id: props.comment.reference.id },
          })

          // deep clone since dataRead is read only
          let dataWrite = JSON.parse(JSON.stringify(dataRead))

          // update the number of comments
          const replies = props.comment.children?.length || 0
          switch (props.comment.reference.collection) {
            case SONGS_COLLECTION:
              dataWrite.getSong.comments = dataWrite.getSong.comments - 1 - replies
              break
            case ARTISTS_COLLECTION:
              dataWrite.getArtist.comments = dataWrite.getArtist.comments - 1 - replies
              break
            case PLAYLISTS_COLLECTION:
              dataWrite.getPlaylist.comments = dataWrite.getPlaylist.comments - 1 - replies
              break
            case BLOGPOSTS_COLLECTION:
              dataWrite.getBlogpost.comments = dataWrite.getBlogpost.comments - 1 - replies
              break
          }

          // write to cache
          cache.writeQuery({
            query: query,
            variables: { id: props.comment.reference.id },
            data: dataWrite,
          })
        },
        refetchQueries: () => [{
          query: LIST_COMMENTS_QUERY,
          variables: varsListComments
        }],
        awaitRefetchQueries: true,
      })
    }
  }

  // get post login action
  const getPostLoginAction = queryPostLoginAction()

  // if actions and properties match then reset and execute the action
  if (getAuthUser && getPostLoginAction?.action === POST_LOGIN_ACTION && getPostLoginAction?.id === props.comment.id && !loadingLike) {
    //reset
    postLoginAction(null)
    //execute
    handleLike()
  }

  // display component
  return (
    <div>
      <Link href="/user/[id]/[slug]" as={ `/user/${ props.comment.user.id }/${ props.comment.user.slug }` }>
        <img src={ props.comment.user.imageUrl ? props.comment.user.imageUrl : `https://via.placeholder.com/100?text=No+Photo` } alt={ props.comment.user.imageUrl && props.comment.user.username }/>
      </Link>
      <Link href="/user/[id]/[slug]" as={ `/user/${ props.comment.user.id }/${ props.comment.user.slug }` }>
        <a>{ props.comment.user.username }</a>
      </Link>

      <p>Date { props.comment.createdDate }</p>
      <div dangerouslySetInnerHTML={{ __html: props.comment.text }}/>

      <CommentLikers commentId={ props.comment.id }/>
      <div>
        {
          getAuthUser ? (
            <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike }>
              Like
            </button>
          ) : (
            <AuthUser buttonText="Like" postLoginAction={ { action: POST_LOGIN_ACTION, id: props.comment.id } }/>
          )
        }

        { loadingLike && <div>mutating (design this)</div> }
        { errorLike && <ErrorMessage/> }
      </div>

      <div>
        <button hidden={ !hideLike } onClick={ () => handleUnlike() } disabled={ loadingUnlike }>
          Unlike
        </button>

        { loadingUnlike && <div>mutating (design this)</div> }
        { errorUnlike && <ErrorMessage/> }
      </div>

      <div hidden={ !getAuthUser }>
        <button onClick={ () => handleFlag('قلة ادب') } disabled={ loadingFlag }>
          flag - قلة ادب
        </button>
        <button onClick={ () => handleFlag('temp reason') } disabled={ loadingFlag }>
          flag - temp reason
        </button>

        { loadingFlag && <div>mutating (design this)</div> }
        { errorFlag && <ErrorMessage/> }
      </div>

      <div hidden={ !(getAuthUser?.id === props.comment.user.id || getAuthUser?.admin) }>
        <button onClick={ () => handleDelete() } disabled={ loadingDelete }>
          X delete
        </button>

        { loadingDelete && <div>mutating (design this)</div> }
        { errorDelete && <ErrorMessage/> }
      </div>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </div>
  )
}
