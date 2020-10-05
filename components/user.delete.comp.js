import Router from 'next/router'
import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { logout } from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

const DELETE_USER_MUTATION = gql`
  mutation deleteUser ($userId: ID!) {
    deleteUser(userId: $userId)
  }
`

const Comp = (props) => {
	// mutation tuble
  const [deleteUser, { loading, error }] = useMutation(
    DELETE_USER_MUTATION,
    {
			onCompleted: () => {
        Router.push(`/`)
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
	)

	// function: handle onClick event
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
			// logs out from firebase and update cache
			logout()

			// execute mutation
      deleteUser({
        variables: {
          userId: props.user.id,
				},
				update: (cache) => {
					// remove user form cache
					cache.evict({ id: cache.identify(props.user) })
					cache.gc()
				},
			})
    }
	}

	// display component
  return (
    <div>
      <button onClick={ () => handleDelete() } disabled={ loading }>
        Delete User
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
    </div>
  )
}

export default Comp