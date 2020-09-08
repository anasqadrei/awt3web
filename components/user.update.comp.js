import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import RemoveUserEmail from 'components/user.removeEmail.comp'
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

export default (props) => {
  // mutation tuple
  const [updateUser, { loading: loadingUpdate, error: errorUpdate, data: dataUpdate }] = useMutation (
    UPDATE_USER_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // list countries query
  const { loading: loadingCountries, data: dataCountries } = useQuery (
    LIST_COUNTRIES_QUERY,
  )

  // function: handle onSubmit event. get data from form and execute mutation
  const handleSubmit = (event) => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const username = formData.get(FORM_USERNAME)
    const birthDate = formData.get(FORM_BIRTH_DATE)
    const sex = formData.get(FORM_SEX)
    const country = formData.get(FORM_COUNTRY)

    // execute mutation and update the cache
    updateUser({
      variables: {
        userId: loggedOnUser.id,
        user: {
          username: username,
          // TODO: wait til using css and validation framework
          // birthDate: birthDate,
          sex: sex,
          country: country,
          lastSeenDate: new Date(),
        }
      },
      update: (cache, { data: { updateUser } }) => {
        // update cache
        // TODO: does it even work? check after deciding on login way
        cache.modify({
          id: cache.identify(loggedOnUser),
          fields: {
            username() {
              return updateUser.username
            },
            birthDate() {
              return updateUser.birthDate
            },
            sex() {
              return updateUser.sex
            },
            country() {
              return updateUser.country
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
      Username
      <input name={ FORM_USERNAME } type="text" disabled={ loadingUpdate } minLength="5" maxLength="50" defaultValue={ props.user.username } placeholder="username here" required/>
      <div>
        Emails:
        { props.user.emails ? props.user.emails.map(email => (
          <div key={ email }>
            { email }
            <RemoveUserEmail email={ email }/>
          </div>
        ))
        :
          `None`
        }
      </div>
      Birth Date:
      <input name={ FORM_BIRTH_DATE } type="text" disabled={ loadingUpdate } defaultValue={ props.user.birthDate } placeholder="birthDate here" required/>
      <div>
        Sex:
        <select name={ FORM_SEX } disabled={ loadingUpdate } defaultValue={ props.user.sex || "" } required>
          <option value="m">ذكر</option>
          <option value="f">أنثى</option>
          <option value=""></option>
        </select>
      </div>
      { loadingCountries && <div>loading countries</div> }
      { dataCountries?.listCountries &&
          <div>
            Country:
            <select name={ FORM_COUNTRY } disabled={ loadingUpdate } defaultValue={ props.user.country.id } required>
            { dataCountries?.listCountries?.map(country => (
                <option key={ country.id } value={ country.id }>{ country.nameAR }</option>
              ))
            }
            </select>
          </div>
      }
      <button type="submit" disabled={ loadingUpdate || dataUpdate?.updateUser }>
        UPDATE user
      </button>

      { loadingUpdate && <div>mutating (design this)</div> }
      { errorUpdate && <ErrorMessage/> }
      { dataUpdate?.updateUser && <div>User Added</div> }
    </form>
  )
}
