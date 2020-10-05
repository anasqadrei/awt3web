import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser, postLoginAction, queryPostLoginAction } from 'lib/localState'
import { GET_ARTIST_QUERY } from 'lib/graphql'
import AuthUser from 'components/user.auth.comp'
import { LIST_USER_LIKED_ARTISTS_QUERY, SORT, PAGE_SIZE } from 'components/artist.userLiked.comp'
import ErrorMessage from 'components/errorMessage'

const POST_LOGIN_ACTION = 'LIKE_ARTIST'
const CHECK_USER_LIKE_ARTIST_QUERY = gql`
  query checkUserLikeArtist ($userId: ID!, $artistId: ID!) {
    checkUserLikeArtist(userId: $userId, artistId: $artistId)
  }
`
const LIKE_ARTIST_MUTATION = gql`
  mutation likeArtist ($artistId: ID!, $userId: ID!) {
    likeArtist(artistId: $artistId, userId: $userId)
  }
`
const UNLIKE_ARTIST_MUTATION = gql`
  mutation unlikeArtist ($artistId: ID!, $userId: ID!) {
    unlikeArtist(artistId: $artistId, userId: $userId)
  }
`

const Comp = (props) => {
  // mutation tuples
  const [likeArtist, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_ARTIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikeArtist, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_ARTIST_MUTATION,
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
    artistId: props.artistId,
  }
  
  // check if authenticated user liked artist
  const { data: dataCheckLike }  = useQuery (
    CHECK_USER_LIKE_ARTIST_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide like and unlike buttons
  const hideLike = dataCheckLike?.checkUserLikeArtist || false

  // excute query to display data. the query will most likey use cache
  const { data: dataArtist }  = useQuery (
    GET_ARTIST_QUERY,
    {
      variables: { id: props.artistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!dataArtist?.getArtist) {
    return null
  }

  // get data
  const { getArtist } = dataArtist

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    getAuthUser && likeArtist({
      variables: vars,
      update: (cache, { data: { likeArtist } }) => {
        // if a successful like (not a repeated one)
        if (likeArtist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getArtist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue + 1
                },
              }
            })
          }

          // update if user liked artist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeArtist = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_ARTISTS_QUERY,
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
    unlikeArtist({
      variables: vars,
      update: (cache, { data: { unlikeArtist } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikeArtist) {
          // update likes counter
          {
            cache.modify({
              id: cache.identify(getArtist),
              fields: {
                likes(currentValue = 0) {
                  return currentValue - 1
                },
              }
            })
          }

          // update if user liked artist
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeArtist = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }
        }
      },
      refetchQueries: () => [{
        query: LIST_USER_LIKED_ARTISTS_QUERY,
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
  if (getAuthUser && getPostLoginAction?.action === POST_LOGIN_ACTION && getPostLoginAction?.id === props.artistId && !loadingLike) {
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
            <AuthUser buttonText="Like" postLoginAction={ { action: POST_LOGIN_ACTION, id: props.artistId } }/>
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
        { getArtist.likes ? `${ getArtist.likes } liked them` : `be the first to like? or empty?` }
      </div>
    </section>
  )
}

export default Comp