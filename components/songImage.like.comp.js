import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'
import { GET_SONG_QUERY } from 'components/song.comp'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

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

export default function LikeSongImage(props) {
  const router = useRouter()

  // TODO: loggedOnUser is used is not logged in?
  // set query variables (common for all)
  const queryVariables = {
    userId: loggedOnUser.id,
    songImageId: props.image.id,
  }

  // TODO: show the like always even if user wasn't logged in. direct to log them in
  // decide to either show or hide like, unlike, dislike, undislike buttons
  let hideLike = false
  let hideDislike = false
  if (loggedOnUser) {
    // check like
    {
      // check if user like song image query
      const { data }  = useQuery (
        CHECK_USER_LIKE_SONG_IMAGE_QUERY,
        {
          variables: queryVariables,
        }
      )
      // hide like button if user already liked song image
      if (data) {
        hideLike = data.checkUserLikeSongImage
      }
    }
    // check dislike
    {
      // check if user dislike song image query
      const { data }  = useQuery (
        CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
        {
          variables: queryVariables,
        }
      )
      // hide dislike button if user already disliked song image
      if (data) {
        hideDislike = data.checkUserDislikeSongImage
      }
    }
  }

  // like mutation
  const [likeSongImage, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const likeHandler = () => {
    // execute likeSongImage and update likers in the cache
    likeSongImage({
      variables: queryVariables,
      update: (proxy, { data: { likeSongImage } }) => {
        // if successful like (not a repeated one)
        if (likeSongImage) {
          // update checkUserLikeSongImage cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeSongImage: true
            proxy.writeQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeSongImage: true,
              },
            })
          }
          // update song image likers cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // find image and add user to its likers
            const imageIndex = data.getSong.imagesList.findIndex(elem => elem.id === props.image.id)
            if (!data.getSong.imagesList[imageIndex].likers) {
              data.getSong.imagesList[imageIndex].likers = []
            }
            data.getSong.imagesList[imageIndex].likers.push(loggedOnUser)
            // update cache
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: data,
            })
          }
        }
      },
    })
  }

  // unlike mutation
  const [unlikeSongImage, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const unlikeHandler = () => {
    // execute unlikeSongImage and update likers in the cache
    unlikeSongImage({
      variables: queryVariables,
      update: (proxy, { data: { unlikeSongImage } }) => {
        // if successful unlike (not a repeated one)
        if (unlikeSongImage) {
          // update checkUserLikeSongImage cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeSongImage: false
            proxy.writeQuery({
              query: CHECK_USER_LIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeSongImage: false,
              },
            })
          }
          // update song image likers cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // find image and remove user from its likers
            const imageIndex = data.getSong.imagesList.findIndex(elem => elem.id === props.image.id)
            const likerIndex = data.getSong.imagesList[imageIndex].likers.findIndex(elem => elem.id === loggedOnUser.id)
            data.getSong.imagesList[imageIndex].likers.splice(likerIndex, 1)
            // update cache
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: data,
            })
          }
        }
      },
    })
  }

  // dislike mutation
  const [dislikeSongImage, { loading: loadingDislike, error: errorDislike }] = useMutation(
    DISLIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling dislike event
  const dislikeHandler = (reason) => {
    // execute dislikeSongImage and update dislikers in the cache
    dislikeSongImage({
      variables: {
        ...queryVariables,
        reason: reason,
        songId: router.query.id,
      },
      update: (proxy, { data: { dislikeSongImage } }) => {
        // if successful dislike (not a repeated one)
        if (dislikeSongImage) {
          // update checkUserDislikeSongImage cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserDislikeSongImage: true
            proxy.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserDislikeSongImage: true,
              },
            })
          }
          // update song image dislikers cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // find image and add user to its dislikers
            const imageIndex = data.getSong.imagesList.findIndex(elem => elem.id === props.image.id)
            if (!data.getSong.imagesList[imageIndex].dislikers) {
              data.getSong.imagesList[imageIndex].dislikers = []
            }
            data.getSong.imagesList[imageIndex].dislikers.push(loggedOnUser)
            // update cache
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: data,
            })
          }
        }
      },
    })
  }

  // disunlike mutation
  const [undislikeSongImage, { loading: loadingUndislike, error: errorUndislike }] = useMutation(
    UNDISLIKE_SONG_IMAGE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling dislike event
  const undislikeHandler = () => {
    // execute undislikeSongImage and update dislikers in the cache
    undislikeSongImage({
      variables: queryVariables,
      update: (proxy, { data: { undislikeSongImage } }) => {
        // if successful undislike (not a repeated one)
        if (undislikeSongImage) {
          // update checkUserDislikeSongImage cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserDislikeSongImage: false
            proxy.writeQuery({
              query: CHECK_USER_DISLIKE_SONG_IMAGE_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserDislikeSongImage: false,
              },
            })
          }
          // update song image dislikers cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
            })
            // find image and remove user from its likers
            const imageIndex = data.getSong.imagesList.findIndex(elem => elem.id === props.image.id)
            const dislikerIndex = data.getSong.imagesList[imageIndex].dislikers.findIndex(elem => elem.id === loggedOnUser.id)
            data.getSong.imagesList[imageIndex].dislikers.splice(dislikerIndex, 1)
            // update cache
            proxy.writeQuery({
              query: GET_SONG_QUERY,
              variables: { id: router.query.id },
              data: data,
            })
          }
        }
      },
    })
  }

  // like, unlike, dislike, undislike buttons
  return (
    <section>
      <p>likes: { props.image.likers && props.image.likers.length }</p>
      <p>dislikes: { props.image.dislikers && props.image.dislikers.length }</p>
      <button hidden={ hideLike } onClick={ () => likeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Like
      </button>
      { errorLike && (<ErrorMessage/>) }
      <button hidden={ !hideLike } onClick={ () => unlikeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideDislike }>
        Unlike
      </button>
      { errorUnlike && (<ErrorMessage/>) }
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('الصورة غير واضحة') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة غير واضحة
      </button>
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('الصورة لا علاقة لها بالأغنية') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة لا علاقة لها بالأغنية
      </button>
      <button hidden={ hideDislike } onClick={ () => dislikeHandler('الصورة مخالفة لشروط الموقع') } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Dislike - الصورة مخالفة لشروط الموقع
      </button>
      { errorDislike && (<ErrorMessage/>) }
      <button hidden={ !hideDislike } onClick={ () => undislikeHandler() } disabled={ loadingLike || loadingUnlike || loadingDislike || loadingUndislike || hideLike }>
        Undislike
      </button>
      { errorUndislike && (<ErrorMessage/>) }
    </section>
  )
}
