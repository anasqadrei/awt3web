import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'
import { GET_ARTIST_QUERY } from './artist.comp'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  __typename: "User",
}

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

export default function LikeArtist() {
  const router = useRouter()

  // set query variables (common for all)
  const queryVariables = {
    userId: loggedOnUser.id,
    artistId: router.query.id,
  }

  // TODO: show the like always even if user wasn't logged in. direct to log them in
  // decide to either show or hide like and unlike buttons
  let hideLike = false
  if (loggedOnUser) {
    // check if user like artist query
    const { data }  = useQuery (
      CHECK_USER_LIKE_ARTIST_QUERY,
      {
        variables: queryVariables,
      }
    )
    // hide like button if user already liked artist
    if (data) {
      hideLike = data.checkUserLikeArtist
    }
  }

  // like mutation
  const [likeArtist, { loading: loadingLike, error: errorLike }] = useMutation(
    LIKE_ARTIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const likeHandler = () => {
    // execute likeArtist and update likes in the cache
    likeArtist({
      variables: queryVariables,
      update: (proxy, { data: { likeArtist } }) => {
        // if successful like (not a repeated one)
        if (likeArtist) {
          // update checkUserLikeArtist cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeArtist: true
            proxy.writeQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeArtist: true,
              },
            })
          }
          // update artist likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_ARTIST_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by incrementing getArtist.likes
            proxy.writeQuery({
              query: GET_ARTIST_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getArtist: {
                  ...data.getArtist,
                  likes: data.getArtist.likes + 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // unlike mutation
  const [unlikeArtist, { loading: loadingUnlike, error: errorUnlike }] = useMutation(
    UNLIKE_ARTIST_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling like event
  const unlikeHandler = () => {
    // execute unlikeArtist and update likes in the cache
    unlikeArtist({
      variables: queryVariables,
      update: (proxy, { data: { unlikeArtist } }) => {
        // if successful unlike (not a repeated one)
        if (unlikeArtist) {
          // update checkUserLikeArtist cache
          {
            // read cache
            const data = proxy.readQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: queryVariables,
            })
            // update cache by making checkUserLikeArtist: false
            proxy.writeQuery({
              query: CHECK_USER_LIKE_ARTIST_QUERY,
              variables: queryVariables,
              data: {
                ...data,
                checkUserLikeArtist: false,
              },
            })
          }
          // update artist likes cache
          {
            // read cache
            const data = proxy.readQuery({
              query: GET_ARTIST_QUERY,
              variables: { id: router.query.id },
            })
            // update cache by decrementing getArtist.likes
            proxy.writeQuery({
              query: GET_ARTIST_QUERY,
              variables: { id: router.query.id },
              data: {
                ...data,
                getArtist: {
                  ...data.getArtist,
                  likes: data.getArtist.likes - 1,
                }
              },
            })
          }
        }
      },
    })
  }

  // like and unlike buttons
  return (
    <section>
      <button hidden={ hideLike } onClick={ () => likeHandler() } disabled={ loadingLike }>
        Like
      </button>
      { errorLike && (<ErrorMessage/>) }
      <button hidden={ !hideLike } onClick={ () => unlikeHandler() } disabled={ loadingUnlike }>
        Unlike
      </button>
      { errorUnlike && (<ErrorMessage/>) }
    </section>
  )
}
