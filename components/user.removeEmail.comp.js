import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const REMOVE_USER_EMAIL_MUTATION = gql`
  mutation removeUserEmail ($userId: ID!, $email: AWSEmail!) {
    removeUserEmail(userId: $userId, email: $email) {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
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
          userId: props.user.id,
          email: props.email,
        },
        update: (_cache, { data: { removeUserEmail } }) => {
          // update cache
          authUser(removeUserEmail)
        },
      })
    }
  }

  // display component
  return (
    <div>
      <button hidden={ !props.user.admin } onClick={ (event) => handleRemoveEmail(event) } disabled={ loading }>
        Remove Email
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}
