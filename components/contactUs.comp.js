import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

const FORM_EMAIL = "email"
const FORM_MESSAGE = "message"
const CONTACT_US_MUTATION = gql`
  mutation contactUs ($message: String!, $userId: ID!, $email: AWSEmail!) {
    contactUs(message: $message, userId: $userId, email: $email)
  }
`

const Comp = () => {
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
  const getAuthUser = queryAuthUser()
  
  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const email = formData.get(FORM_EMAIL)
    const message = formData.get(FORM_MESSAGE).replace(/\n/g, '<br/>')
    form.reset()

    // execute mutation
    contactUs({
      variables: {
        message: message,
        userId: getAuthUser?.id,
        email: email,
      }
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        <textarea name={ FORM_MESSAGE } type="text" row="3" maxLength="500" placeholder="message here" required/>
        {
          getAuthUser && (
            <div>
              <p>name: { getAuthUser.username }</p>
              {
                getAuthUser.emails?.length > 0 ? (
                  <div>
                    Email: 
                    {
                      getAuthUser.emails.length === 1 ? (
                        <input name={ FORM_EMAIL } type="email" disabled={ loading } maxLength="50" defaultValue={ getAuthUser.emails[0] } required/>
                      ) : (
                        <select name={ FORM_EMAIL } disabled={ loading } defaultValue={ getAuthUser.emails[0] } required>
                          {
                            getAuthUser.emails?.map(email => (
                              <option key={ email } value={ email }>{ email }</option>
                            ))
                          }
                        </select>
                      )
                    }                    
                  </div>
                ) : (
                  <div>
                    <input name={ FORM_EMAIL } type="email" disabled={ loading } maxLength="50" placeholder="email here" required/>
                  </div>
                )
              }

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
        !getAuthUser && (
          <div>
            Log in please!
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}

export default Comp