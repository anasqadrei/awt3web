import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_USER_QUERY } from './user.comp'
import ErrorMessage from './errorMessage'

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

export default function RemoveUserEmail(props) {
  // mutation
  const [removeUserEmail, { loading, error }] = useMutation(
    REMOVE_USER_EMAIL_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling remove email event
  const removeEmailHandler = event => {
    event.preventDefault()

    if (confirm("Are you sure?")) {
      // set query variables
      const queryVariables = {
        userId: loggedOnUser.id,
        email: props.email,
      }

      // execute removeUserEmail and update the cache
      removeUserEmail({
        variables: queryVariables,
        update: (proxy, { data: { removeUserEmail } }) => {
          // read cache
          const data = proxy.readQuery({
            query: GET_USER_QUERY,
            variables: { id: loggedOnUser.id },
          })
          // update cache
          proxy.writeQuery({
            query: GET_USER_QUERY,
            variables: { id: loggedOnUser.id },
            data: {
              ...data,
              getUser: {
                ...data.getUser,
                emails: removeUserEmail.emails,
              },
            },
          })
        },
      })
    }
  }

  // show remove email button
  return (
    <div>
      <button hidden={ !loggedOnUser.admin } onClick={ removeEmailHandler } disabled={ loading }>
        remove email
      </button>
      { error && (<ErrorMessage/>) }
    </div>
  )
}
