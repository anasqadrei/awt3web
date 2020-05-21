import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import { GET_USER_QUERY } from 'components/user.comp'
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

export default function UpdateUserImage() {
  // mutation
  const [updateUser, { loading, error, data }] = useMutation(
    UPDATE_USER_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling submit event
  const handleSubmit = event => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const file = formData.get(FORM_FILE)
    form.reset()

    // set query variables
    const queryVariables = {
      userId: loggedOnUser.id,
      user: {
        image: loggedOnUser.id,
        lastSeenDate: new Date(),
      }
    }

    // execute updateUser and update the cache
    updateUser({
      variables: queryVariables,
      update: (proxy, { data: { updateUser } }) => {
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
              imageUrl: updateUser.imageUrl,
              lastSeenDate: updateUser.lastSeenDate,
            },
          },
        })
      },
    })
  }

  // show add a user image form
  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_FILE } type="file" accept="image/png, image/jpeg" required/>
      <button type="submit" disabled={ loading || (data && data.updateUser) }>add a user image</button>
      { error && (<ErrorMessage/>) }
      {
        (data && data.updateUser) && (
          <div>Image Added</div>
        )
      }
    </form>
  )
}
