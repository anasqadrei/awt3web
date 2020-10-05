import { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import * as Sentry from '@sentry/node'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import Modal from 'react-modal'
import { ROOT_APP_ELEMENT } from 'lib/constants'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'
import { authUser, postLoginAction } from 'lib/localState'
import ErrorMessage from 'components/errorMessage'

const GET_USER_BY_PROVIDER_ID_OR_EMAIL_QUERY = gql`
  query getUserByProviderIdOrEmail ($provider: String!, $providerId: ID!, $email: AWSEmail) {
    getUserByProviderIdOrEmail(provider: $provider, providerId: $providerId, email: $email) {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`
const CREATE_USER_MUTATION = gql`
  mutation createUser ($username: String!, $emails: [AWSEmail], $user: UserInput, $provider: String!, $providerId: ID!, $providerData: AWSJSON) {
    createUser(username: $username, emails: $emails, user: $user, provider: $provider, providerId: $providerId, providerData: $providerData) {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`

// provider names mapping
// key: firebase provider name
// value: awtarika provider name
const PROVIDERS = new Map([
  [firebase.auth.FacebookAuthProvider.PROVIDER_ID, 'facebook'],
  [firebase.auth.GoogleAuthProvider.PROVIDER_ID, 'google'],
  ['apple.com', 'apple'],
  [firebase.auth.TwitterAuthProvider.PROVIDER_ID, 'twitter'],
  ['microsoft.com', 'microsoft'],
  ['yahoo.com', 'yahoo'],
])

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
      user => setFirebaseAuthUser(user)
    )
    // clean up
    return () => {
      unsubscribe()
    }
  }, [])

  // mutation tuple
  const [createUser, { loading: loadingCreateUser, error: errorCreateUser }] = useMutation(
    CREATE_USER_MUTATION,
    {
      onCompleted: (data) => {
        // set reactive variable
        authUser(data?.createUser) 
      },
      onError: (error) => {
        Sentry.captureException(error)
      },
    }
  )

  // query awtarika db to see if firebase user exist
  const { loading: loadingGetUser, error: errorGetUser }  = useQuery (
    GET_USER_BY_PROVIDER_ID_OR_EMAIL_QUERY,
    {
      variables: {
        provider: PROVIDERS.get(firebaseAuthUser?.providerData?.[0]?.providerId),
        providerId: firebaseAuthUser?.providerData?.[0]?.uid,
        email: firebaseAuthUser?.providerData?.[0]?.email,
      },
      skip: !firebaseAuthUser,
      onCompleted: (data) => {
        if (data?.getUserByProviderIdOrEmail) {
          // set reactive variable
          authUser(data?.getUserByProviderIdOrEmail) 
        } else {
          // create user otherwise
          createUser({
            variables: {
              username: firebaseAuthUser.providerData?.[0]?.displayName, 
              emails: firebaseAuthUser.providerData?.[0]?.email, 
              user: { 
                image: firebaseAuthUser.providerData?.[0]?.photoURL, 
              }, 
              provider: PROVIDERS.get(firebaseAuthUser.providerData?.[0]?.providerId), 
              providerId: firebaseAuthUser.providerData?.[0]?.uid, 
            },
          })
        }
      },
    }
  )

  // StyledFirebaseAuth config
  const uiConfig = {
    signInOptions: Array.from(PROVIDERS.keys()),
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

        { loadingGetUser && <div>loading get user (design this)</div> }
        { loadingCreateUser && <div>loading create user (design this)</div> }

        { (errorGetUser || errorCreateUser) && <ErrorMessage/> }
      </Modal>
    </div>
  )
}

export default Comp