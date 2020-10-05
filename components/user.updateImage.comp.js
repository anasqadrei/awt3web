import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const FORM_FILE = "file"
const UPDATE_USER_MUTATION = gql`
  mutation updateUser ($userId: ID!, $user: UserInput!) {
    updateUser(userId: $userId, user: $user) {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`

const Comp = (props) => {
  // mutation tuple
  const [updateUser, { loading, error, data }] = useMutation(
    UPDATE_USER_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const file = formData.get(FORM_FILE)
    form.reset()

    // execute mutation and update the cache
    updateUser({
      variables: {
        userId: props.user.id,
        user: {
          // TODO: add real image file
          image: `http://www.awtarika.com/x/${ props.user.id }`,
          lastSeenDate: new Date(),
        }
      },
      update: (_cache, { data: { updateUser } }) => {
        // update cache
        authUser(updateUser)
      },
    })
  }

  // display component
  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_FILE } type="file" accept="image/png, image/jpeg" required/>
      <button type="submit" disabled={ loading || data?.updateUser }>
        Add User Image
      </button>

      { loading && <div>mutating (design this)</div> }
      { error && <ErrorMessage/> }
      { data?.updateUser && <div>Image Added</div> }
    </form>
  )
}

export default Comp