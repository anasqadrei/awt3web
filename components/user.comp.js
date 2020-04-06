import { useState } from 'react'
import Modal from 'react-modal'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import Head from './head'
import UpdateUser from './user.update.comp'
import UpdateUserImage from './user.updateImage.comp'
import UserSongs from './song.user.comp'
import UserSongImages from './songImage.user.comp'
import UserLyrics from './lyrics.user.comp'
import ErrorMessage from './errorMessage'
import { ROOT_APP_ELEMENT } from '../lib/constants'

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

export const GET_USER_QUERY = gql`
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

export default function User() {
  const router = useRouter()

  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // state variables
  const [updateUserModalIsOpen, setUpdateUserModalIsOpen] = useState(false)
  const [updateUserImageModalIsOpen, setUpdateUserImageModalIsOpen] = useState(false)

  // set query variables
  const queryVariables = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_USER_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage/>
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getUser } = data

  // in case user not found
  if (!getUser) {
    return (<div>User doesn't exist (design this)</div>)
  }

  // fix url in case it doesn't match the slug
  const regExp = new RegExp (`^/user/${ router.query.id }/${ getUser.slug }([?].*|[#].*|/)?$`)
  if (!decodeURIComponent(router.asPath).match(regExp)) {
    const href = `/user/[id]/[slug]`
    const as = `/user/${ router.query.id }/${ getUser.slug }`
    router.replace(href, as)
  }

  // display user
  return (
    <section>
      <Head title={ getUser.username } description={ getUser.username } asPath={ decodeURIComponent(router.asPath) } ogImage={ getUser.imageUrl } />
      <p>User Profile</p>
      <div>
        <img src={ getUser.imageUrl ? getUser.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
        <button onClick={ () => { setUpdateUserImageModalIsOpen(true) } }>Update User Image</button>
        <Modal isOpen={ updateUserImageModalIsOpen } onRequestClose={ () => { setUpdateUserImageModalIsOpen(false) } } style={ modalStyles } contentLabel="update user image modal">
          <button onClick={ () => { setUpdateUserImageModalIsOpen(false) } }>close</button>
          <h2>Update User Image</h2>
          <UpdateUserImage/>
        </Modal>
        <h1 className="title">{ getUser.username }</h1>
      </div>

      <div>
        emails:
        { getUser.emails && getUser.emails.map(email => (
          <p key={ email }>{ email }</p>
        )) }
      </div>
      <p>social media: { getUser.profiles && getUser.profiles.length && getUser.profiles.map(elem => elem.provider).join()  }</p>
      <p>birthDate: { getUser.birthDate }</p>
      <p>Sex: { getUser.sex }</p>
      <p>country: { getUser.country.nameAR }</p>
      <p>last seen: { getUser.lastSeenDate }</p>
      <p>joined: { getUser.createdDate }</p>
      <p>premium: { getUser.premium || 'No'}</p>
      <div>
        <button onClick={ () => { setUpdateUserModalIsOpen(true) } }>Update User</button>
        <Modal isOpen={ updateUserModalIsOpen } onRequestClose={ () => { setUpdateUserModalIsOpen(false) } } style={ modalStyles } contentLabel="update user modal">
          <button onClick={ () => { setUpdateUserModalIsOpen(false) } }>close</button>
          <h2>Update User</h2>
          <UpdateUser user={ getUser }/>
        </Modal>
      </div>
      <Link href="/user/playlists-list">
        <a>Library</a>
      </Link>
      <p>song uploads:</p>
      <UserSongs snippet={ true }/>
      <p>song images uploads:</p>
      <UserSongImages snippet={ true }/>
      <p>lyrics added:</p>
      <UserLyrics snippet={ true }/>
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
