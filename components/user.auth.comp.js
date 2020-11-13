import { useState, useEffect } from 'react'
import { gql, useQuery } from '@apollo/client'
import * as Sentry from '@sentry/node'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import Modal from 'react-modal'
import { ROOT_APP_ELEMENT } from 'lib/constants'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser, postLoginAction } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

// NOTE: don't cache this query. it doesn't use variables (argument). it uses only idToken. will mix useres if cache is used
const GET_LINKED_USER_QUERY = gql`
  query getLinkedUser {
    getLinkedUser {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`

// configure and initialize Firebase
// https://github.com/vercel/next.js/issues/1999
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  })
}

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

// function: return authenticated user's ID token to be used for graph ql security
export async function getAuthUserIdToken() {
  return await firebase?.auth()?.currentUser?.getIdToken()
}

// function: log user out from firebase and local state
export function logout() {
  firebase.auth().signOut()
  authUser(null)
}

const Comp = (props) => {
  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // state variables
  const [authModalIsOpen, setAuthModalIsOpen] = useState(false)
  const [firebaseAuthUser, setFirebaseAuthUser] = useState(null)

  // observe user sign-in and sign-out -> change firebaseAuthUser state variable -> query/mutate graphql accordingly
  useEffect(() => {
    // adds an observer for changes to the user's sign-in state
    const unsubscribe = firebase.auth().onAuthStateChanged(
      user => {
        // set state variable for re-rendering
        setFirebaseAuthUser(user)

        // if user logged in then refetch getLinkedUser
        if (user) {
          refetch()
        }        
      }
    )
    // clean up
    return () => {
      unsubscribe()
    }
  }, [])

  // query awtarika db to see if firebase user exist
  const { loading, error, refetch }  = useQuery (
    GET_LINKED_USER_QUERY,
    {
      fetchPolicy: 'no-cache',
      skip: !firebaseAuthUser,
      onCompleted: async (data) => {
        if (data?.getLinkedUser) {
          // first: refresh idToken if it doesn't contain custom claims from awtarika
          const idTokenResult = await firebaseAuthUser.getIdTokenResult()
          if (!idTokenResult?.claims?.awtarika) {
            await firebaseAuthUser.getIdToken(true)
          }

          // second: if token is all good, then set reactive variable
          authUser(data.getLinkedUser)
        } else {
          // if no user then log user out
          firebase.auth().signOut()
        }
      },
      onError: (error) => {
        firebase.auth().signOut()
        Sentry.captureException(error)
      },
    }
  )

  // StyledFirebaseAuth config
  const uiConfig = {
    signInOptions: [
      'facebook.com',
      'google.com',
      'apple.com',
      'twitter.com',
      'microsoft.com',
      'yahoo.com',
    ],
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: () => {
        // pass back the action in the reactive variable (global state)
        // this is to say that the user "clicked" login and completed the process successfully. Not just a component render
        postLoginAction(props?.postLoginAction || null)
      },
    },
  }

  // display component
  return (
    <div>
      <button onClick={ () => { setAuthModalIsOpen(true) } }>
        { props.buttonText || `Login` }
      </button>
      <Modal isOpen={ authModalIsOpen } onRequestClose={ () => { setAuthModalIsOpen(false) } } style={ modalStyles } contentLabel="auth modal">
        <button onClick={ () => { setAuthModalIsOpen(false) } }>
          Close
        </button>
        <h2>Login with...</h2>
        { !firebaseAuthUser && <StyledFirebaseAuth uiConfig={ uiConfig } firebaseAuth={ firebase.auth() }/> }

        { loading && <div>loading get linked user (design this)</div> }
        { error && <ErrorMessage/> }
      </Modal>
    </div>
  )
}

export default Comp