import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from './errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  profiles: {
    provider: "facebook",
    providerId: "4",
  },
  emails: ["test@gmail.com"],
}

const FORM_MESSAGE = "message"
const CONTACT_US_MUTATION = gql`
  mutation contactUs ($message: String!, $userId: ID!, $username: String!, $provider: String!, $handler: String!, $email: AWSEmail) {
    contactUs(message: $message, userId: $userId, username: $username, provider: $provider, handler: $handler, email: $email)
  }
`

export default function ContactUs() {
  // mutation
  const [contactUs, { loading, error, data }] = useMutation(
    CONTACT_US_MUTATION,
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
    const message = formData.get(FORM_MESSAGE).replace(/\n/g, '<br/>')
    form.reset()

    // set query variables
    const queryVariables = {
      message: message,
      userId: loggedOnUser.id,
      username: loggedOnUser.username,
      provider: loggedOnUser.profiles.provider,
      handler: loggedOnUser.profiles.providerId,
      email: loggedOnUser.emails && loggedOnUser.emails[0],
    }

    // execute contact us
    contactUs({
      variables: queryVariables,
    })
  }

  // show contact us form
  return (
    <form onSubmit={ handleSubmit }>
      <p>
        name: { loggedOnUser.username }
      </p>
      <p>
        provider: { `${ loggedOnUser.profiles.provider } ${ loggedOnUser.profiles.providerId }` }
      </p>
      {
        (loggedOnUser.emails && loggedOnUser.emails[0]) && (
          <p>
            email: { loggedOnUser.emails[0] }
          </p>
        )
      }
      <textarea name={ FORM_MESSAGE } type="text" row="3" maxLength="500" placeholder="message here" required/>
      <button type="submit" disabled={ loading || (data && data.contactUs) }>send message</button>
      { error && (<ErrorMessage/>) }
      {
        (data && data.contactUs) && (
          <div>message sent</div>
        )
      }
      <style jsx>{`
        form {
          border-bottom: 1px solid #ececec;
        }
        input {
          display: block;
        }
      `}</style>
    </form>
  )
}
