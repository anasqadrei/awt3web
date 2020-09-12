import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

const FORM_MESSAGE = "message"
const CONTACT_US_MUTATION = gql`
  mutation contactUs ($message: String!, $userId: ID!, $username: String!, $provider: String!, $handler: String!, $email: AWSEmail) {
    contactUs(message: $message, userId: $userId, username: $username, provider: $provider, handler: $handler, email: $email)
  }
`

export default () => {
  // mutation tuple
  const [contactUs, { loading, error, data }] = useMutation(
    CONTACT_US_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // get authenticated user
  const authUser = queryAuthUser()
  
  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const message = formData.get(FORM_MESSAGE).replace(/\n/g, '<br/>')
    form.reset()

    // TEMP remove default profiles once login is connected with firebase
    // execute mutation
    contactUs({
      variables: {
        message: message,
        userId: authUser.id,
        username: authUser.username,
        provider: authUser.profiles?.provider || 'xxx',
        handler: authUser.profiles?.providerId || '123',
        email: authUser.emails?.[0],
      }
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        <textarea name={ FORM_MESSAGE } type="text" row="3" maxLength="500" placeholder="message here" required/>
        {
          authUser && (
            <div>
              <p>name: { authUser.username }</p>
              <p>provider: { `${ authUser.profiles?.provider } ${ authUser.profiles?.providerId }` }</p>
              { authUser.emails?.[0] && <p>email: { authUser.emails[0] }</p> }

              <button type="submit" disabled={ loading || data?.contactUs }>
                Send Message
              </button>
            </div>
          ) 
        }

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.contactUs && <div>message sent</div> }
      </form>

      {
        !authUser && (
          <div>
            Log in please!
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}
