import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { GET_USER_QUERY } from 'components/user.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  admin: true,
}

const REMOVE_USER_EMAIL_MUTATION = gql`
  mutation removeUserEmail ($userId: ID!, $email: AWSEmail!) {
    removeUserEmail(userId: $userId, email: $email) {
      id
      emails
    }
  }
`

export default (props) => {
  // mutation tuple
  const [removeUserEmail, { loading, error }] = useMutation(
    REMOVE_USER_EMAIL_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onClick event
  const handleRemoveEmail = (event) => {
    event.preventDefault()

    if (confirm("Are you sure?")) {
      // execute mutation and update the cache
      removeUserEmail({
        variables: {
          userId: loggedOnUser.id,
          email: props.email,
        },
        update: (cache, { data: { removeUserEmail } }) => {
          // update cache
          // TODO: does it even work? check after deciding on login way
          cache.modify({
            id: cache.identify(loggedOnUser),
            fields: {
              emails() {
                return removeUserEmail.emails
              },
            }
          })
        },
      })
    }
  }

  // display component
  return (
    <div>
      <button hidden={ !loggedOnUser.admin } onClick={ (event) => handleRemoveEmail(event) } disabled={ loading }>
        Remove Email
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}
