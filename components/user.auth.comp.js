import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createApolloClient } from 'lib/withApollo'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import Modal from 'react-modal'
import ErrorMessage from 'components/errorMessage'
import { ROOT_APP_ELEMENT } from 'lib/constants'

const GET_USER_BY_PROVIDER_ID_OR_EMAIL_QUERY = gql`
  query getUserByProviderIdOrEmail ($provider: String!, $providerId: ID!, $email: AWSEmail) {
    getUserByProviderIdOrEmail(provider: $provider, providerId: $providerId, email: $email) {
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
const CREATE_USER_MUTATION = gql`
  mutation createUser ($username: String!, $emails: [AWSEmail], $user: UserInput, $provider: String!, $providerId: ID!, $providerData: AWSJSON) {
    createUser(username: $username, emails: $emails, user: $user, provider: $provider, providerId: $providerId, providerData: $providerData) {
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

const FIREBASE_PROVIDER_ID = {
  FACEBOOK: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  GOOGLE: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  APPLE: 'apple.com',
  TWITTER: firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  MICROSOFT: 'microsoft.com',
  YAHOO: 'yahoo.com',
}

const AWTARIKA_PROVIDER = {
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  APPLE: 'apple',
  TWITTER: 'twitter',
  MICROSOFT: 'microsoft',
  YAHOO: 'yahoo',
}

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

// TODO: upgrade apollo first
// StyledFirebaseAuth config.
const uiConfig = {
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      console.log(authResult);

      // try {
      //   let queryVariables = {}
      //   switch (authResult.credential.providerId) {
      //     case FIREBASE_PROVIDER_ID.FACEBOOK:
      //       queryVariables.provider = AWTARIKA_PROVIDER.FACEBOOK
      //       queryVariables.providerId = 'twitter'
      //       break
      //     case FIREBASE_PROVIDER_ID.GOOGLE:
      //       queryVariables.provider = AWTARIKA_PROVIDER.GOOGLE
      //       queryVariables.providerId = 'twitter'
      //       queryVariables.email = 'twitter'
      //       break
      //     case FIREBASE_PROVIDER_ID.APPLE:
      //       queryVariables.provider = AWTARIKA_PROVIDER.APPLE
      //       queryVariables.providerId = 'twitter'
      //       break
      //     case FIREBASE_PROVIDER_ID.TWITTER:
      //       queryVariables.provider = AWTARIKA_PROVIDER.TWITTER
      //       queryVariables.providerId = authResult.additionalUserInfo?.profile?.id_str
      //       break
      //     case FIREBASE_PROVIDER_ID.MICROSOFT:
      //       queryVariables.provider = AWTARIKA_PROVIDER.MICROSOFT
      //       queryVariables.providerId = 'twitter'
      //       break
      //     case FIREBASE_PROVIDER_ID.YAHOO:
      //       queryVariables.provider = AWTARIKA_PROVIDER.YAHOO
      //       queryVariables.providerId = 'twitter'
      //       queryVariables.email = 'twitter'
      //       break
      //   }
      //
      //   console.log(`about to createApolloClient`);
      //   // TODO: reuse client instead of creating a new one. fix when upgrading to apollo 3.0
      //   const client = createApolloClient()
      //   console.log(client);
      //   const R = client.query({
      //     query: GET_USER_BY_PROVIDER_ID_OR_EMAIL_QUERY,
      //     variables: queryVariables,
      //   })
      //   // .then((R) => {
      //     console.log(R);
      //   // })


        //check first if user in mongodb
        //if not, add them
        //if yes, check if data match with custom attribute, email in case of inconsistency

      // } catch (error) {
      //   // TODO: email and show error?
      //   // also email? it means the user is in firebase but not in db
      //   // show error comp or not?
      //   Sentry.captureException(error)
      // }

      // avoid redirects after sign-in.
      // return false
    }
  },
  signInOptions: [
    FIREBASE_PROVIDER_ID.FACEBOOK,
    FIREBASE_PROVIDER_ID.GOOGLE,
    FIREBASE_PROVIDER_ID.APPLE,
    FIREBASE_PROVIDER_ID.TWITTER,
    FIREBASE_PROVIDER_ID.MICROSOFT,
    FIREBASE_PROVIDER_ID.YAHOO,
  ],
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

export default () => {
  // for accessibility
  Modal.setAppElement(ROOT_APP_ELEMENT)

  // state variables
  const [authModalIsOpen, setAuthModalIsOpen] = useState(false)
  const [authUser, setAuthUser] = useState(null)

  useEffect(() => {
    //
    const unsubscribe = firebase.auth().onAuthStateChanged(
      authUser => {
        // TODO: remove
        console.log(authUser);
        authUser ? setAuthUser(authUser) : setAuthUser(null)
      },
    )
    // clean up
    return () => {
      unsubscribe()
    }
  }, [authUser])
  // TODO: authUser is only for useEffect optimazation? check please

  return (
    <div>
      {
        !!firebase.auth().currentUser ?
        <div>
          <Link href="/user/[id]/[slug]" as={ `/user/1/xxx` }>
            <a>{ firebase.auth().currentUser.displayName } (fix link)</a>
          </Link>
          <button onClick={ () => { firebase.auth().signOut(); setAuthModalIsOpen(false) } }>Logout</button>
        </div>
        :
        <div>
          <button onClick={ () => { setAuthModalIsOpen(true) } }>Login</button>
          <Modal isOpen={ authModalIsOpen } onRequestClose={ () => { setAuthModalIsOpen(false) } } style={ modalStyles } contentLabel="auth modal">
            <button onClick={ () => { setAuthModalIsOpen(false) } }>close</button>
            <h2>Login with...</h2>
            <StyledFirebaseAuth uiConfig={ uiConfig } firebaseAuth={ firebase.auth() }/>
          </Modal>
        </div>
      }
    </div>
  )
}