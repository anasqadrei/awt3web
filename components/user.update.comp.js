import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import RemoveUserEmail from 'components/user.removeEmail.comp'
import { GET_USER_QUERY } from 'components/user.comp'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
}

const FORM_USERNAME = "username"
const FORM_BIRTH_DATE = "birthDate"
const FORM_SEX = "sex"
const FORM_COUNTRY = "country"
const LIST_COUNTRIES_QUERY = gql`
  query listCountries {
    listCountries {
      id
      nameAR
    }
  }
`
const UPDATE_USER_MUTATION = gql`
  mutation updateUser ($userId: ID!, $user: UserInput!) {
    updateUser(userId: $userId, user: $user) {
      id
      username
      slug
      birthDate
      sex
      country {
        id
        nameAR
      }
      lastSeenDate
    }
  }
`

export default function UpdateUser(props) {
  // list countries query
  const { loading: loadingCountries, error: errorCountries, data: dataCountries } = useQuery (
    LIST_COUNTRIES_QUERY,
  )

  // update user mutation
  const [updateUser, { loading: loadingUpdate, error: errorUpdate, data: dataUpdate }] = useMutation (
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
    const username = formData.get(FORM_USERNAME)
    const birthDate = formData.get(FORM_BIRTH_DATE)
    const sex = formData.get(FORM_SEX)
    const country = formData.get(FORM_COUNTRY)

    // set query variables
    const queryVariables = {
      userId: loggedOnUser.id,
      user: {
        username: username,
        // TODO: wait til using css and validation framework
        // birthDate: birthDate,
        sex: sex,
        country: country,
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
              username: updateUser.username,
              birthDate: updateUser.birthDate,
              sex: updateUser.sex,
              country: updateUser.country,
              lastSeenDate: updateUser.lastSeenDate,
            },
          },
        })
      },
    })
  }

  // show update user form
  return (
    <form onSubmit={ handleSubmit }>
      <input name={ FORM_USERNAME } type="text" disabled={ loadingUpdate } minLength="5" maxLength="50" defaultValue={ props.user.username } placeholder="username here" required/>
      <div>
        emails:
        { props.user.emails && props.user.emails.map(email => (
          <div key={ email }>
            { email }
            <RemoveUserEmail email={ email }/>
          </div>
        )) }
      </div>
      <input name={ FORM_BIRTH_DATE } type="text" disabled={ loadingUpdate } defaultValue={ props.user.birthDate } placeholder="birthDate here" required/>
      <div>
        <select name={ FORM_SEX } disabled={ loadingUpdate } defaultValue={ props.user.sex || "" } required>
          <option value="m">ذكر</option>
          <option value="f">أنثى</option>
          <option value=""></option>
        </select>
      </div>
      {
        loadingCountries && (<div>loading countries</div>)
      }
      {
        (dataCountries && dataCountries.listCountries) && (
          <div>
            <select name={ FORM_COUNTRY } disabled={ loadingUpdate } defaultValue={ props.user.country.id } required>
            {
              dataCountries.listCountries.map(country => (
                <option key={ country.id } value={ country.id }>{ country.nameAR }</option>
              ))
            }
            </select>
          </div>
        )
      }
      <button type="submit" disabled={ loadingUpdate || (dataUpdate && dataUpdate.updateUser) }>UPDATE user</button>
      { errorUpdate && (<ErrorMessage/>) }
      {
        (dataUpdate && dataUpdate.updateUser) && (
          <div>User Updated</div>
        )
      }
    </form>
  )
}
