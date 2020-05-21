import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import ErrorMessage from 'components/errorMessage'

// TEMP: until we decide on the login mechanism
const loggedOnUser = {
  id: "1",
  username: "Admin",
  email: "ome@zarzoor.lol",
  __typename: "User",
}

const FORM_NAME = "name"
const FORM_COMPANY = "company"
const FORM_ADDRESS = "address"
const FORM_PHONE = "phone"
const FORM_EMAIL = "email"
const FORM_SONG_ID = "songId"
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

export default function SendNoticeRegardingSong(props) {
  const router = useRouter()

  // mutation
  const [sendCopyrightInfringementNotice, { loading, error, data }] = useMutation(
    SEND_COPYRIGHT_INFRINGEMENT_NOTICE_MUTATION,
    {
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // handling event
  const sendNoticeHandler = () => {
    // get data from form and set its behaviour
    event.preventDefault()
    const form = event.target
    const formData = new window.FormData(form)
    const name = formData.get(FORM_NAME)
    const company = formData.get(FORM_COMPANY)
    const address = formData.get(FORM_ADDRESS)
    const phone = formData.get(FORM_PHONE)
    const email = formData.get(FORM_EMAIL)
    const songId = formData.get(FORM_SONG_ID)
    const songTitle = formData.get(FORM_SONG_TITLE)
    const artistName = formData.get(FORM_ARTIST_NAME)
    const songUrl = formData.get(FORM_SONG_URL)
    const songDesc = formData.get(FORM_SONG_DESC)
    const message = formData.get(FORM_MESSAGE)
    form.reset()

    // set query variables
    const queryVariables = {
      songId: router.query.id,
      notice: {
        name,
        company,
        address,
        phone,
        email,
        songId: router.query.id,
        songTitle,
        artistName,
        songUrl: encodeURI(songUrl),
        songDesc,
        message,
      }
    }

    // execute mutation
    sendCopyrightInfringementNotice({
      variables: queryVariables,
    })
  }

  // Send Notice Form
  return (
    <section>
      <form onSubmit={ sendNoticeHandler }>
        الإسم: <input name={ FORM_NAME } type="text" maxLength="100" placeholder="الإسم" required /><br/>
        الشركة: <input name={ FORM_COMPANY } type="text" maxLength="100" placeholder="الشركة" /><br/>
        العنوان: <textarea name={ FORM_ADDRESS } type="text" row="3" maxLength="200" placeholder="العنوان" required /><br/>
        الهاتف: <input name={ FORM_PHONE } type="text" maxLength="100" placeholder="الهاتف" required /><br/>
        البريد الالكتروني: <input name={ FORM_EMAIL } type="email" maxLength="100" placeholder="البريد الالكتروني" required /><br/>
        الآغنية: <input name={ FORM_SONG_TITLE } type="text" value={ props.song.title } readOnly /><br/>
        الفنان: <input name={ FORM_ARTIST_NAME } type="text" value={ props.song.artist.name } readOnly /><br/>
        العنوان الالكتروني: <input name={ FORM_SONG_URL } type="text" value={ props.song.url } readOnly /><br/>
        song description: <textarea name={ FORM_SONG_DESC } type="text" row="3" maxLength="200" value={ props.song.desc } readOnly /><br/>
        message: <textarea name={ FORM_MESSAGE } type="text" row="5" minLength="50" maxLength="500" placeholder="اكتب الرسالة" required /><br/>
        <button type="submit" disabled={ loading || (data && data.sendCopyrightInfringementNotice) }>Send Notice</button>
        { error && (<ErrorMessage/>) }
        {
          (data && data.sendCopyrightInfringementNotice) && (
            <div>
              report sent
            </div>
          )
        }
      </form>
    </section>
  )
}
