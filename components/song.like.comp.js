import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { GET_SONG_QUERY } from './song.comp'

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

export default function LikeSong() {
  const router = useRouter()

  // TODO: loggedOnUser is used is not logged in?
  // set query variables (common for all)
  const queryVariables = {
    userId: loggedOnUser.id,
    songId: router.query.id,
  }

  // TODO: show the like always even if user wasn't logged in. direct to log them in
  // decide to either show or hide like, unlike, dislike, undislike buttons
  let hideLike = false
  let hideDislike = false
  if (loggedOnUser) {
    // check like
    {
      // check if user like song query
      const { data }  = useQuery (
        CHECK_USER_LIKE_SONG_QUERY,
        {
          variables: queryVariables,
        }
      )
      // hide like button if user already liked song
      if (data) {
        hideLike = data.checkUserLikeSong
      }
    }
    // check dislike
    {
      // check if user dislike song query
      const { data }  = useQuery (
        CHECK_USER_DISLIKE_SONG_QUERY,
        {
          variables: queryVariables,
        }
      )
      // hide dislike button if user already disliked song
      if (data) {
        hideDislike = data.checkUserDislikeSong
      }
    }
  }

  // like mutation
  const [likeSong, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const likeHandler = () => {
    // execute likeSong and update likes in the cache
    likeSong({
      variables: queryVariables,
      update: (proxy, { data: { likeSong } }) => {
        // if successful like (not a repeated one)
        if (likeSong) {
          // update checkUserLikeSong cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeSong: true
            proxy.writeQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeSong: true,
              },
            })
          }
          // update song likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by incrementing getSong.likes
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getSong: {
                  ...data.getSong,
                  likes: data.getSong.likes + 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // unlike mutation
  const [unlikeSong, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const unlikeHandler = () => {
    // execute unlikeSong and update likes in the cache
    unlikeSong({
      variables: queryVariables,
      update: (proxy, { data: { unlikeSong } }) => {
        // if successful unlike (not a repeated one)
        if (unlikeSong) {
          // update checkUserLikeSong cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeSong: false
            proxy.writeQuery({
              query: CHECK_USER_LIKE_SONG_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeSong: false,
              },
            })
          }
          // update song likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by decrementing getSong.likes
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getSong: {
                  ...data.getSong,
                  likes: data.getSong.likes - 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // dislike mutation
  const [dislikeSong, { loading: loadingDislike, error: errorDislike }] = useMutation(
    DISLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling dislike event
  const dislikeHandler = (reason) => {
    // execute dislikeSong and update likes in the cache
    dislikeSong({
      variables: {
        ...queryVariables,
        reason: reason
      },
      update: (proxy, { data: { dislikeSong } }) => {
        // if successful dislike (not a repeated one)
        if (dislikeSong) {
          // update checkUserDislikeSong cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserDislikeSong: true
            proxy.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserDislikeSong: true,
              },
            })
          }
          // update song dislikes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by incrementing getSong.dislikes
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getSong: {
                  ...data.getSong,
                  dislikes: data.getSong.dislikes + 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // disunlike mutation
  const [undislikeSong, { loading: loadingUndislike, error: errorUndislike }] = useMutation(
    UNDISLIKE_SONG_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling dislike event
  const undislikeHandler = () => {
    // execute undislikeSong and update dislikes in the cache
    undislikeSong({
      variables: queryVariables,
      update: (proxy, { data: { undislikeSong } }) => {
        // if successful undislike (not a repeated one)
        if (undislikeSong) {
          // update checkUserDislikeSong cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserDislikeSong: false
            proxy.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserDislikeSong: false,
              },
            })
          }
          // update song dislikes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by decrementing getSong.dislikes
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getSong: {
                  ...data.getSong,
                  dislikes: data.getSong.dislikes - 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // like, unlike, dislike, undislike buttons
  return (
    <section>
      <button hidden={ hideLike } onClick={ () => likeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Like
      </button>
      { errorLike && (<ErrorMessage/>) }
      <button hidden={ !hideLike } onClick={ () => unlikeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Unlike
      </button>
      { errorUnlike && (<ErrorMessage/>) }
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('الصوت غير واضح أو جودة الصوت رديئة') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصوت غير واضح أو جودة الصوت رديئة
      </button>
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('خطأ في بيانات الأغنية') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - خطأ في بيانات الأغنية
      </button>
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('الأغنية مخالفة لشروط الموقع') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الأغنية مخالفة لشروط الموقع
      </button>
      { errorDislike && (<ErrorMessage/>) }
      <button hidden={ !hideDislike } onClick={ () => undislikeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Undislike
      </button>
      { errorUndislike && (<ErrorMessage/>) }
    </section>
  )
}
