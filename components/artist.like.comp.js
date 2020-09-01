import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_ARTIST_QUERY } from 'lib/graphql'
import ErrorMessage from 'components/errorMessage'

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

export default (props) => {
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

  // TODO: what if user is not logged on
  // set common query variables
  const vars = {
    userId: loggedOnUser?.id,
    artistId: props.artistId,
  }

  // TODO: show the like always even if user wasn't logged in. then direct to log them in. use skip??

  // decide to either show or hide like and unlike buttons
  let hideLike = false
  if (loggedOnUser) {
    // check if user like artist query
    const { data }  = useQuery (
      CHECK_USER_LIKE_ARTIST_QUERY,
      {
        variables: vars,
        // skip: false,
      }
    )
    // hide like button if user already liked artist
    hideLike = data?.checkUserLikeArtist || false
  }

  // excute query to display data. the query will most likey use cache
  const { data }  = useQuery (
    GET_ARTIST_QUERY,
    {
      variables: { id: props.artistId },
    }
  )

  // in case of initial loading (or the highly unlikely case of no data found)
  if (!data?.getArtist) {
    return null
  }

  // get data
  const { getArtist } = data

  // function: handle onClick event
  const handleLike = () => {
    // execute mutation and update the cache
    likeArtist({
      variables: vars,
      update: (cache, { data: { likeArtist } }) => {
        // if a successful like (not a repeated one)
        if (likeArtist) {
          // update artist likes
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

          // update if user liked comment
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
          // update artist likes
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

          // update if user liked comment
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
    })
  }

  // display component
  return (
    <section>
      <div>
        <button hidden={ hideLike } onClick={ () => handleLike() } disabled={ loadingLike }>
          Like
        </button>

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
