import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_SONG_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

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

export default (props) => {
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

  // TODO: what if user is not logged on
  // set common query variables
  const vars = {
    userId: loggedOnUser.id,
    songId: props.songId,
  }

  // TODO: show the like always even if user wasn't logged in. then direct to log them in. use skip??
  // decide to either show or hide like, unlike, dislike and undislike buttons
  let hideLike = false
  let hideDislike = false
  if (loggedOnUser) {
    // check if user like song query
    {
      const { data }  = useQuery (
        CHECK_USER_LIKE_SONG_QUERY,
        {
          variables: vars,
          // skip: false,
        }
      )
      // hide like button if user already liked song
      hideLike = data?.checkUserLikeSong || false
    }
    // check if user dislike song query
    {
      const { data }  = useQuery (
        CHECK_USER_DISLIKE_SONG_QUERY,
        {
          variables: vars,
          // skip: false,
        }
      )
      // hide dislike button if user already disliked song
      hideDislike = data?.checkUserDislikeSong || false
    }
  }

  // excute query to display data. the query will most likey use cache
  const { data }  = useQuery (
    GET_SONG_QUERY,
    {
      variables: { id: props.songId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getSong) {
    return null
  }

  // get data
  const { getSong } = data

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    likeSong({
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

  // display component
  return (
    <section>
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
