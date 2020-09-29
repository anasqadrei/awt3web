import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import Modal from 'react-modal'
import { validateUrl } from 'lib/validateUrl'
import { ROOT_APP_ELEMENT } from 'lib/constants'
import { queryAuthUser } from 'lib/localState'
import Head from 'components/head'
import UpdateUser from 'components/user.update.comp'
import UpdateUserImage from 'components/user.updateImage.comp'
import UserSongs from 'components/song.user.comp'
import UserSongImages from 'components/songImage.user.comp'
import UserLyrics from 'components/lyrics.user.comp'
import Playlists from 'components/playlist.user.comp'
import DeleteUser from 'components/user.delete.comp'
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

  // get authenticated user from local state
  const getAuthUser = queryAuthUser() 

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

      <h1 className="title">{ getUser.username }</h1>
      <img src={ getUser.imageUrl ? getUser.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>

      {
        getAuthUser?.id === getUser.id && (
          <div>
            <p>User Profile</p>
            <div>
              <button onClick={ () => { setUpdateUserImageModalIsOpen(true) } }>
                Update User Image
              </button>
              <Modal isOpen={ updateUserImageModalIsOpen } onRequestClose={ () => { setUpdateUserImageModalIsOpen(false) } } style={ modalStyles } contentLabel="update user image modal">
                <button onClick={ () => { setUpdateUserImageModalIsOpen(false) } }>
                  Close
                </button>
                <h2>Update User Image</h2>
                <UpdateUserImage user={ getAuthUser }/>
              </Modal>
            </div>
            <div>
              emails:{ getAuthUser.emails ? getAuthUser.emails.map(email => <p key={ email }>{ email }</p>) : `X` }
            </div>
            <p>social media: { getAuthUser.profiles?.map(elem => elem.provider).join() }</p>
            <p>birthDate: { getAuthUser.birthDate || `X` }</p>
            <p>Sex: { getAuthUser.sex || `X` }</p>
            <p>country: { getAuthUser.country?.nameAR || `X` }</p>
            <p>last seen: { getAuthUser.lastSeenDate || getAuthUser.createdDate }</p>
            <p>joined: { getAuthUser.createdDate }</p>
            <p>premium: { getAuthUser.premium || 'No'}</p>
            <Link href="/user/playlists-list">
              <a>My Library</a>
            </Link>
            <div>
              <button onClick={ () => { setUpdateUserModalIsOpen(true) } }>
                Update User
              </button>
              <Modal isOpen={ updateUserModalIsOpen } onRequestClose={ () => { setUpdateUserModalIsOpen(false) } } style={ modalStyles } contentLabel="update user modal">
                <button onClick={ () => { setUpdateUserModalIsOpen(false) } }>
                  Close
                </button>
                <h2>Update User</h2>
                <UpdateUser user={ getAuthUser }/>
              </Modal>
            </div>
            <DeleteUser user={ getAuthUser }/>
          </div>
        )
      }

      <p>Uploads:</p>
      <p>song uploads:</p>
      <UserSongs userId={ getUser.id } snippet={ true }/>
      <p>song images uploads:</p>
      <UserSongImages userId={ getUser.id } snippet={ true }/>
      <p>lyrics added:</p>
      <UserLyrics userId={ getUser.id } snippet={ true }/>
      <p>Public Playlists added:</p>
      <Playlists userId={ getUser.id } snippet={ true } private={ false }/>
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
