import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_FILE = "file"
const UPDATE_USER_MUTATION = gql`
  mutation updateUser ($userId: ID!, $user: UserInput!) {
    updateUser(userId: $userId, user: $user) {
      id
      imageUrl
      lastSeenDate
    }
  }
`

export default () => {
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
        userId: loggedOnUser.id,
        user: {
          // TODO: add real image file
          image: loggedOnUser.id,
          lastSeenDate: new Date(),
        }
      },
      update: (cache, { data: { updateUser } }) => {
        // update cache
        // TODO: does it even work? check after deciding on login way
        cache.modify({
          id: cache.identify(loggedOnUser),
          fields: {
            imageUrl() {
              return updateUser.imageUrl
            },
            lastSeenDate() {
              return updateUser.lastSeenDate
            },
          }
        })
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
