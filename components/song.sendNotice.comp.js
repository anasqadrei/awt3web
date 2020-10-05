import { gql, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import { queryAuthUser } from 'lib/localState'
import AuthUser from 'components/user.auth.comp'
import ErrorMessage from 'components/errorMessage'

const FORM_NAME = "name"
const FORM_COMPANY = "company"
const FORM_ADDRESS = "address"
const FORM_PHONE = "phone"
const FORM_EMAIL = "email"
const FORM_SONG_TITLE = "songTitle"
const FORM_ARTIST_NAME = "artistName"
const FORM_SONG_URL = "songUrl"
const FORM_SONG_DESC = "songDesc"
const FORM_MESSAGE = "message"
const SEND_COPYRIGHT_INFRINGEMENT_NOTICE_MUTATION = gql`
  mutation sendCopyrightInfringementNotice ($songId: ID!, $notice: CopyrightInfringementNotice!) {
    sendCopyrightInfringementNotice(songId: $songId, notice: $notice)
  }
`

// TODO: add form validation

const Comp = (props) => {
  // mutation tuple
  const [sendCopyrightInfringementNotice, { loading, error, data }] = useMutation(
    SEND_COPYRIGHT_INFRINGEMENT_NOTICE_MUTATION,
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
    const name = formData.get(FORM_NAME)
    const company = formData.get(FORM_COMPANY)
    const address = formData.get(FORM_ADDRESS)
    const phone = formData.get(FORM_PHONE)
    const email = formData.get(FORM_EMAIL)
    const songTitle = formData.get(FORM_SONG_TITLE)
    const artistName = formData.get(FORM_ARTIST_NAME)
    const songUrl = formData.get(FORM_SONG_URL)
    const songDesc = formData.get(FORM_SONG_DESC)
    const message = formData.get(FORM_MESSAGE)
    form.reset()

    // execute mutation
    sendCopyrightInfringementNotice({
      variables: {
        songId: props.song.id,
        notice: {
          name,
          company,
          address,
          phone,
          email,
          userId: getAuthUser?.id,
          songId: props.song.id,
          songTitle,
          artistName,
          songUrl: encodeURI(songUrl),
          songDesc,
          message,
        }
      },
    })
  }

  // display component
  return (
    <div>
      <form onSubmit={ handleSubmit }>
        الإسم: <input name={ FORM_NAME } type="text" maxLength="100" defaultValue={ getAuthUser?.username } placeholder="الإسم" required/><br/>
        الشركة: <input name={ FORM_COMPANY } type="text" maxLength="100" placeholder="الشركة"/><br/>
        العنوان: <textarea name={ FORM_ADDRESS } type="text" row="3" maxLength="200" placeholder="العنوان" required/><br/>
        الهاتف: <input name={ FORM_PHONE } type="text" maxLength="100" placeholder="الهاتف" required/><br/>
        البريد الالكتروني: <input name={ FORM_EMAIL } type="email" maxLength="100" defaultValue={ getAuthUser?.emails?.[0] } placeholder="البريد الالكتروني" required/><br/>
        الآغنية: <input name={ FORM_SONG_TITLE } type="text" value={ props.song.title } readOnly/><br/>
        الفنان: <input name={ FORM_ARTIST_NAME } type="text" value={ props.song.artist.name } readOnly/><br/>
        العنوان الالكتروني: <input name={ FORM_SONG_URL } type="text" value={ props.song.url } readOnly/><br/>
        song description: <textarea name={ FORM_SONG_DESC } type="text" row="3" maxLength="200" value={ props.song.desc.replace(/<br\/>/g, '\n') } readOnly/><br/>
        message: <textarea name={ FORM_MESSAGE } type="text" row="5" minLength="50" maxLength="500" placeholder="اكتب الرسالة" required/><br/>
        <button type="submit" disabled={ !getAuthUser || loading || data?.sendCopyrightInfringementNotice }>
          Send Notice
        </button>

        { loading && <div>mutating (design this)</div> }
        { error && <ErrorMessage/> }
        { data?.sendCopyrightInfringementNotice && <div>report sent</div> }
      </form>

      {
        !getAuthUser && (
          <div>
            يرجى تسجيل الدخول أولا
            <AuthUser/>
          </div>
        )
      }
    </div>
  )
}

export default Comp