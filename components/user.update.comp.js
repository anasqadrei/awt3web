import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser } from 'lib/localState'
import RemoveUserEmail from 'components/user.removeEmail.comp'
import ErrorMessage from 'components/errorMessage'

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
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`

const Comp = (props) => {
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
        userId: props.user.id,
        user: {
          username: username,
          birthDate: birthDate,
          sex: sex,
          country: country,
          lastSeenDate: new Date(),
        },
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
      Username
      <input name={ FORM_USERNAME } type="text" disabled={ loadingUpdate } minLength="5" maxLength="50" defaultValue={ props.user.username } placeholder="username here" required/>
      <div>
        Emails:
        { props.user.emails ? props.user.emails.map(email => (
            <div key={ email }>
              { email }
            </div>
          ))
        :
          `X`
        }
      </div>
      Birth Date:
      {/* TODO: find a proper date picker. keep pattern? */}
      <input name={ FORM_BIRTH_DATE } type="date" disabled={ loadingUpdate } defaultValue={ props.user.birthDate } placeholder="yyyy-mm-dd" pattern="\d{4}-\d{2}-\d{2}" required/>
      <div>
        Sex:
        {/* validate this not empty */}
        <select name={ FORM_SEX } disabled={ loadingUpdate } defaultValue={ props.user.sex || "" } required>
          <option key="m" value="m">ذكر</option>
          <option key="f" value="f">أنثى</option>
          <option value=""></option>
        </select>
      </div>
      { loadingCountries && <div>loading countries</div> }
      { dataCountries?.listCountries &&
          <div>
            Country:
            <select name={ FORM_COUNTRY } disabled={ loadingUpdate } defaultValue={ props.user.country?.id || "" } required>
              <option value=""></option>
              { dataCountries.listCountries?.map(country => (
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
      { dataUpdate?.updateUser && <div>User Updated</div> }
    </form>
  )
}

export default Comp