import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { queryAuthUser, postLoginAction, queryPostLoginAction } from 'lib/localState'
import { GET_PLAYLIST_QUERY } from 'lib/graphql'
import AuthUser from 'components/user.auth.comp'
import { LIST_USER_LIKED_PLAYLISTS_QUERY, SORT, PAGE_SIZE } from './playlist.userLiked.comp'
import ErrorMessage from 'components/errorMessage'

const POST_LOGIN_ACTION = 'LIKE_PLAYLIST'
const CHECK_USER_LIKE_PLAYLIST_QUERY = gql`
  query checkUserLikePlaylist ($userId: ID!, $playlistId: ID!) {
    checkUserLikePlaylist(userId: $userId, playlistId: $playlistId)
  }
`
const LIKE_PLAYLIST_MUTATION = gql`
  mutation likePlaylist ($playlistId: ID!, $userId: ID!) {
    likePlaylist(playlistId: $playlistId, userId: $userId)
  }
`
const UNLIKE_PLAYLIST_MUTATION = gql`
  mutation unlikePlaylist ($playlistId: ID!, $userId: ID!) {
    unlikePlaylist(playlistId: $playlistId, userId: $userId)
  }
`

const Comp = (props) => {
  // mutation tuples
  const [likePlaylist, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_PLAYLIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikePlaylist, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_PLAYLIST_MUTATION,
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
    playlistId: props.playlistId,
  }

  // check if authenticated user liked playlist
  const { data: dataCheckLike }  = useQuery (
    CHECK_USER_LIKE_PLAYLIST_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide like and unlike buttons
  const hideLike = dataCheckLike?.checkUserLikePlaylist || false

  // excute query to display data. the query will most likey use cache
  const { data: dataPlaylist }  = useQuery (
    GET_PLAYLIST_QUERY,
    {
      variables: { id: props.playlistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!dataPlaylist?.getPlaylist) {
    return null
  }

  // get data
  const { getPlaylist } = dataPlaylist

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    getAuthUser && likePlaylist({
      variables: vars,
      update: (cache, { data: { likePlaylist } }) => {
        // if a successful like (not a repeated one)
        if (likePlaylist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getPlaylist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user liked playlist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikePlaylist = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_PLAYLISTS_QUERY,
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
    unlikePlaylist({
      variables: vars,
      update: (cache, { data: { unlikePlaylist } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikePlaylist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getPlaylist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user liked playlist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikePlaylist = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_PLAYLIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_PLAYLISTS_QUERY,
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

  // get post login action
  const getPostLoginAction = queryPostLoginAction()

  // if actions and properties match then reset and execute the action
  if (getAuthUser && getPostLoginAction?.action === POST_LOGIN_ACTION && getPostLoginAction?.id === props.playlistId && !loadingLike) {
    // reset
    postLoginAction(null)
    // execute
    handleLike()
  }

  // display component
  return (
    <section>
      <div>
        {
          getAuthUser ? (
            <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike }>
              Like
            </button>
          ) : (
            <AuthUser buttonText="Like" postLoginAction={ { action: POST_LOGIN_ACTION, id: props.playlistId } }/>
          )
        }

        { loadingLike && <div>mutating (design this)</div> }
        { errorLike && <ErrorMessage/> }

        <button hidden={ !hideLike } onClick={ () => handleUnlike() } disabled={ loadingUnlike }>
          Unlike
        </button>

        { loadingUnlike && <div>mutating (design this)</div> }
        { errorUnlike && <ErrorMessage/> }
      </div>

      <div>
        { getPlaylist.likes ? `${ getPlaylist.likes } liked them` : `be the first to like? or empty?` }
      </div>
    </section>
  )
}

export default Comp