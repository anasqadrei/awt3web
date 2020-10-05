import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser, postLoginAction, queryPostLoginAction } from 'lib/localState'
import { GET_SONG_QUERY } from 'lib/graphql'
import AuthUser from 'components/user.auth.comp'
import { LIST_USER_LIKED_SONGS_QUERY, SORT, PAGE_SIZE } from 'components/song.userLiked.comp'
import ErrorMessage from 'components/errorMessage'

const POST_LOGIN_ACTION = 'LIKE_SONG'
const CHECK_USER_LIKE_SONG_QUERY = gql`
  query checkUserLikeSong ($userId: ID!, $songId: ID!) {
    checkUserLikeSong(userId: $userId, songId: $songId)
  }
`
const CHECK_USER_DISLIKE_SONG_QUERY = gql`
  query checkUserDislikeSong ($userId: ID!, $songId: ID!) {
    checkUserDislikeSong(userId: $userId, songId: $songId)
  }
`
const LIKE_SONG_MUTATION = gql`
  mutation likeSong ($songId: ID!, $userId: ID!) {
    likeSong(songId: $songId, userId: $userId)
  }
`
const UNLIKE_SONG_MUTATION = gql`
  mutation unlikeSong ($songId: ID!, $userId: ID!) {
    unlikeSong(songId: $songId, userId: $userId)
  }
`
const DISLIKE_SONG_MUTATION = gql`
  mutation dislikeSong ($songId: ID!, $userId: ID!, $reason: String!) {
    dislikeSong(songId: $songId, userId: $userId, reason: $reason)
  }
`
const UNDISLIKE_SONG_MUTATION = gql`
  mutation undislikeSong ($songId: ID!, $userId: ID!) {
    undislikeSong(songId: $songId, userId: $userId)
  }
`

const Comp = (props) => {
  // mutation tuples
  const [likeSong, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikeSong, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [dislikeSong, { loading: loadingDislike, error: errorDislike }] = useMutation(
    DISLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [undislikeSong, { loading: loadingUndislike, error: errorUndislike }] = useMutation(
    UNDISLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const getAuthUser = queryAuthUser()

  // set common query variables
  const vars = {
    userId: getAuthUser?.id,
    songId: props.songId,
  }

  // check if authenticated user liked song
  const { data: dataCheckLike }  = useQuery (
    CHECK_USER_LIKE_SONG_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide like and unlike buttons
  const hideLike = dataCheckLike?.checkUserLikeSong || false

  // check if authenticated user disliked song
  const { data: dataCheckDislike }  = useQuery (
    CHECK_USER_DISLIKE_SONG_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide dislike and undislike buttons
  const hideDislike = dataCheckDislike?.checkUserDislikeSong || false

  // excute query to display data. the query will most likey use cache
  const { data: dataSong }  = useQuery (
    GET_SONG_QUERY,
    {
      variables: { id: props.songId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!dataSong?.getSong) {
    return null
  }

  // get data
  const { getSong } = dataSong

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    getAuthUser && likeSong({
      variables: vars,
      update: (cache, { data: { likeSong } }) => {
        // if a successful like (not a repeated one)
        if (likeSong) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getSong),
              fields: {
                likes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user liked song
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeSong = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_SONGS_QUERY,
        variables: {
          userId: getAuthUser?.id,
          sort: SORT,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      }],
      awaitRefetchQueries: false,
    })
  }

  // function: handle onClick event
  const handleUnlike = () => {
    // execute mutation and update the cache
    unlikeSong({
      variables: vars,
      update: (cache, { data: { unlikeSong } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikeSong) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getSong),
              fields: {
                likes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user liked song
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeSong = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_SONGS_QUERY,
        variables: {
          userId: getAuthUser?.id,
          sort: SORT,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      }],
      awaitRefetchQueries: false,
    })
  }

  // function: handle onClick event
  const handleDislike = (reason) => {
    // execute mutation and update the cache
    dislikeSong({
      variables: {
        ...vars,
        reason: reason
      },
      update: (cache, { data: { dislikeSong } }) => {
        // if a successful dislike (not a repeated one)
        if (dislikeSong) {
          // update dislikes counter
          {
            cache.modify({
              id: cache.identify(getSong),
              fields: {
                dislikes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user disliked song
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserDislikeSong = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleUndislike = () => {
    // execute mutation and update the cache
    undislikeSong({
      variables: vars,
      update: (cache, { data: { undislikeSong } }) => {
        // if a successful undislike (not a repeated one)
        if (undislikeSong) {
          // update dislikes counter
          {
            cache.modify({
              id: cache.identify(getSong),
              fields: {
                dislikes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user disliked song
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserDislikeSong = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
    })
  }

  // get post login action
  const getPostLoginAction = queryPostLoginAction()

  // if actions and properties match then reset and execute the action
  if (getAuthUser && getPostLoginAction?.action === POST_LOGIN_ACTION && getPostLoginAction?.id === props.songId && !loadingLike) {
    // reset
    postLoginAction(null)
    // execute
    handleLike()
  }

  // display component
  return (
    <section>
      {
        getAuthUser ? (
          <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
            Like
          </button>
        ) : (
          <AuthUser buttonText="Like" postLoginAction={ { action: POST_LOGIN_ACTION, id: props.songId } }/>
        )
      }

      { loadingLike && <div>mutating (design this)</div> }
      { errorLike && <ErrorMessage/> }

      <button hidden={ !hideLike } onClick={ () => handleUnlike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Unlike
      </button>

      { loadingUnlike && <div>mutating (design this)</div> }
      { errorUnlike && <ErrorMessage/> }

      <button hidden={ hideDislike } onClick={ () => handleDislike('الصوت غير واضح أو جودة الصوت رديئة') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصوت غير واضح أو جودة الصوت رديئة
      </button>
      <button hidden={ hideDislike } onClick={ () => handleDislike('خطأ في بيانات الأغنية') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - خطأ في بيانات الأغنية
      </button>
      <button hidden={ hideDislike } onClick={ () => handleDislike('الأغنية مخالفة لشروط الموقع') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الأغنية مخالفة لشروط الموقع
      </button>

      { loadingDislike && <div>mutating (design this)</div> }
      { errorDislike && <ErrorMessage/> }

      <button hidden={ !hideDislike } onClick={ () => handleUndislike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Undislike
      </button>

      { loadingUndislike && <div>mutating (design this)</div> }
      { errorUndislike && <ErrorMessage/> }

      <p>
        { getSong.likes ? `${ getSong.likes } likes` : `be the first to like` }
      </p>
      <p>
        { getSong.dislikes && `${ getSong.dislikes } dislikes` }
      </p>
    </section>
  )
}

export default Comp