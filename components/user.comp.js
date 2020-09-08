import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import Modal from 'react-modal'
import { validateUrl } from 'lib/validateUrl'
import { ROOT_APP_ELEMENT } from 'lib/constants'
import Head from 'components/head'
import UpdateUser from 'components/user.update.comp'
import UpdateUserImage from 'components/user.updateImage.comp'
import UserSongs from 'components/song.user.comp'
import UserSongImages from 'components/songImage.user.comp'
import UserLyrics from 'components/lyrics.user.comp'
import ErrorMessage from 'components/errorMessage'

// TODO: scrolling overflow?
// https://github.com/reactjs/react-modal/issues/283
const modalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

const GET_USER_QUERY = gql`
  query getUser ($id: ID!) {
    getUser(id: $id) {
      id
      username
      slug
      imageUrl
      emails
      profiles {
        provider
        providerId
      }
      birthDate
      sex
      country {
        id
        nameAR
      }
      createdDate
      lastSeenDate
      premium
    }
  }
`

export default () => {
  const router = useRouter()

  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // state variables
  const [updateUserModalIsOpen, setUpdateUserModalIsOpen] = useState(false)
  const [updateUserImageModalIsOpen, setUpdateUserImageModalIsOpen] = useState(false)

  // set query variables
  const vars = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_USER_QUERY,
    {
      variables: vars,
    }
  )

  // initial loading
  if (loading) {
    return (
      <div>
        Loading... (design this)
      </div>
    )
  }

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // in case no data found
  if (!data?.getUser) {
    return (
      <div>
        User doesn't exist (design this)
      </div>
    )
  }

  // get data
  const { getUser } = data

  // fix url in case it doesn't match the slug
  validateUrl(router, 'user', getUser.id, getUser.slug)

  // display data
  return (
    <section>
      <Head title={ getUser.username }/>

      <p>User Profile</p>
      <div>
        <img src={ getUser.imageUrl ? getUser.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
        <button onClick={ () => { setUpdateUserImageModalIsOpen(true) } }>
          Update User Image
        </button>
        <Modal isOpen={ updateUserImageModalIsOpen } onRequestClose={ () => { setUpdateUserImageModalIsOpen(false) } } style={ modalStyles } contentLabel="update user image modal">
          <button onClick={ () => { setUpdateUserImageModalIsOpen(false) } }>
            Close
          </button>
          <h2>Update User Image</h2>
          <UpdateUserImage/>
        </Modal>
        <h1 className="title">{ getUser.username }</h1>
      </div>

      <div>
        emails:{ getUser.emails ? getUser.emails.map(email => <p key={ email }>{ email }</p>) : `None` }
      </div>
      <p>social media: { getUser.profiles?.map(elem => elem.provider).join() }</p>
      <p>birthDate: { getUser.birthDate }</p>
      <p>Sex: { getUser.sex }</p>
      <p>country: { getUser.country?.nameAR }</p>
      <p>last seen: { getUser.lastSeenDate }</p>
      <p>joined: { getUser.createdDate }</p>
      <p>premium: { getUser.premium || 'No'}</p>
      <div>
        <button onClick={ () => { setUpdateUserModalIsOpen(true) } }>
          Update User
        </button>
        <Modal isOpen={ updateUserModalIsOpen } onRequestClose={ () => { setUpdateUserModalIsOpen(false) } } style={ modalStyles } contentLabel="update user modal">
          <button onClick={ () => { setUpdateUserModalIsOpen(false) } }>
            Close
          </button>
          <h2>Update User</h2>
          <UpdateUser user={ getUser }/>
        </Modal>
      </div>
      <Link href="/user/playlists-list">
        <a>Library</a>
      </Link>
      <p>song uploads:</p>
      <UserSongs userId={ getUser.id } snippet={ true }/>
      <p>song images uploads:</p>
      <UserSongImages userId={ getUser.id } snippet={ true }/>
      <p>lyrics added:</p>
      <UserLyrics userId={ getUser.id } snippet={ true }/>
      <p>
        <Link href="/user/[id]/[slug]/uploads" as={`/user/${ getUser.id }/${ getUser.slug }/uploads`}>
          <a>more uploads</a>
        </Link>
      </p>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
