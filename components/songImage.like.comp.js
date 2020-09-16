import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import { queryAuthUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const CHECK_USER_LIKE_SONG_IMAGE_QUERY = gql`
  query checkUserLikeSongImage ($userId: ID!, $songImageId: ID!) {
    checkUserLikeSongImage(userId: $userId, songImageId: $songImageId)
  }
`
const CHECK_USER_DISLIKE_SONG_IMAGE_QUERY = gql`
  query checkUserDislikeSongImage ($userId: ID!, $songImageId: ID!) {
    checkUserDislikeSongImage(userId: $userId, songImageId: $songImageId)
  }
`
const LIKE_SONG_IMAGE_MUTATION = gql`
  mutation likeSongImage ($songImageId: ID!, $userId: ID!) {
    likeSongImage(songImageId: $songImageId, userId: $userId)
  }
`
const UNLIKE_SONG_IMAGE_MUTATION = gql`
  mutation unlikeSongImage ($songImageId: ID!, $userId: ID!) {
    unlikeSongImage(songImageId: $songImageId, userId: $userId)
  }
`
const DISLIKE_SONG_IMAGE_MUTATION = gql`
  mutation dislikeSongImage ($songImageId: ID!, $userId: ID!, $reason: String!, $songId: ID) {
    dislikeSongImage(songImageId: $songImageId, userId: $userId, reason: $reason, songId: $songId)
  }
`
const UNDISLIKE_SONG_IMAGE_MUTATION = gql`
  mutation undislikeSongImage ($songImageId: ID!, $userId: ID!) {
    undislikeSongImage(songImageId: $songImageId, userId: $userId)
  }
`

export default (props) => {
  // mutation tuples
  const [likeSongImage, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [unlikeSongImage, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [dislikeSongImage, { loading: loadingDislike, error: errorDislike }] = useMutation(
    DISLIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )
  const [undislikeSongImage, { loading: loadingUndislike, error: errorUndislike }] = useMutation(
    UNDISLIKE_SONG_IMAGE_MUTATION,
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
    songImageId: props.imageId,
  }

  // TODO: show the like always even if user wasn't logged in. then direct to log them in

  // check if authenticated user liked song image
  const { data: dataLike }  = useQuery (
    CHECK_USER_LIKE_SONG_IMAGE_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide like and unlike buttons
  let hideLike = dataLike?.checkUserLikeSongImage || false

  // check if authenticated user disliked song image
  const { data: dataDislike }  = useQuery (
    CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
    {
      variables: vars,
      skip: !getAuthUser,
    }
  )

  // decide to either show or hide dislike and undislike buttons
  let hideDislike = dataDislike?.checkUserDislikeSongImage || false

  // excute query to display data. the query will most likey use cache
  const { data: dataSong }  = useQuery (
    GET_SONG_QUERY,
    {
      variables: { id: props.songId },
    }
  )

  // get data
  const songImage = dataSong?.getSong?.imagesList?.find(elem => elem.id === props.imageId)

  // in case of initial loading or after delete (or the highly unlikely case of no data found)
  if (!songImage) {
    return null
  }

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    likeSongImage({
      variables: vars,
      update: (cache, { data: { likeSongImage } }) => {
        // if a successful like (not a repeated one)
        if (likeSongImage) {
          // update if user liked song image
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeSongImage = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }

          // update list of likers by reference (since they're objects not scalars)
          {
            cache.modify({
              id: cache.identify(songImage),
              fields: {
                likers(currentValue) {
                  const authUserRef = cache.writeFragment({
                    data: getAuthUser,
                    fragment: gql`
                      fragment UserId on User {
                        id
                      }
                    `
                  })
                  return [...currentValue || [], authUserRef]
                },
              }
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleUnlike = () => {
    // execute mutation and update the cache
    unlikeSongImage({
      variables: vars,
      update: (cache, { data: { unlikeSongImage } }) => {
        // if a successful unlike (not a repeated one)
        if (unlikeSongImage) {
          // update if user liked song image
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserLikeSongImage = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }

          // update list of likers by reference (since they're objects not scalars)
          {
            cache.modify({
              id: cache.identify(songImage),
              fields: {
                likers(currentValue, { readField }) {
                  return currentValue.filter(elem => readField('id', elem) !== getAuthUser.id)
                },
              }
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleDislike = (reason) => {
    // execute mutation and update the cache
    dislikeSongImage({
      variables: {
        ...vars,
        reason: reason,
        songId: props.songId,
      },
      update: (cache, { data: { dislikeSongImage } }) => {
        // if a successful dislike (not a repeated one)
        if (dislikeSongImage) {
          // update if user disliked song image
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserDislikeSongImage = true

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }

          // update list of dislikers by reference (since they're objects not scalars)
          {
            cache.modify({
              id: cache.identify(songImage),
              fields: {
                dislikers(currentValue) {
                  const authUserRef = cache.writeFragment({
                    data: getAuthUser,
                    fragment: gql`
                      fragment UserId on User {
                        id
                      }
                    `
                  })
                  return [...currentValue || [], authUserRef]
                },
              }
            })
          }
        }
      },
    })
  }

  // function: handle onClick event
  const handleUndislike = () => {
    // execute mutation and update the cache
    undislikeSongImage({
      variables: vars,
      update: (cache, { data: { undislikeSongImage } }) => {
        // if a successful undislike (not a repeated one)
        if (undislikeSongImage) {
          // update if user disliked song image
          {
            // read from cache
            const dataRead = cache.readQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: vars,
            })

            // deep clone since dataRead is read only
            let dataWrite = JSON.parse(JSON.stringify(dataRead))

            // update values
            dataWrite.checkUserDislikeSongImage = false

            // write to cache
            cache.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: vars,
              data: dataWrite,
            })
          }

          // update list of dislikers by reference (since they're objects not scalars)
          {
            cache.modify({
              id: cache.identify(songImage),
              fields: {
                dislikers(currentValue, { readField }) {
                  return currentValue.filter(elem => readField('id', elem) !== getAuthUser.id)
                },
              }
            })
          }
        }
      },
    })
  }

  // display component
  return (
    <section>
      <p>likes: { songImage.likers?.length }</p>
      <p>dislikes: { songImage.dislikers?.length }</p>

      {
        // TODO show login comp if not logged in then like after login
      }

      <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Like
      </button>

      { loadingLike && <div>mutating (design this)</div> }
      { errorLike && <ErrorMessage/> }

      <button hidden={ !hideLike } onClick={ () => handleUnlike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Unlike
      </button>

      { loadingUnlike && <div>mutating (design this)</div> }
      { errorUnlike && <ErrorMessage/> }

      <button hidden={ hideDislike } onClick={ () => handleDislike('الصورة غير واضحة') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة غير واضحة
      </button>
      <button hidden={ hideDislike } onClick={ () => handleDislike('الصورة لا علاقة لها بالأغنية') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة لا علاقة لها بالأغنية
      </button>
      <button hidden={ hideDislike } onClick={ () => handleDislike('الصورة مخالفة لشروط الموقع') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة مخالفة لشروط الموقع
      </button>

      { loadingDislike && <div>mutating (design this)</div> }
      { errorDislike && <ErrorMessage/> }

      <button hidden={ !hideDislike } onClick={ () => handleUndislike() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Undislike
      </button>

      { loadingUndislike && <div>mutating (design this)</div> }
      { errorUndislike && <ErrorMessage/> }
    </section>
  )
}
