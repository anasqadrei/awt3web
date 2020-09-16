import { gql, makeVar, useQuery } from '@apollo/client'
import { AUTH_USER_FRAGMENT } from 'lib/graphql'

// NOTE: link between reactive variables and local queries are defined in apolloCache.js

// local schema
export const TYPE_DEFS = gql`
  extend type Query {
    getAuthUser: User!
    getPostLoginAction: PostLoginAction!
  }

  extend type PostLoginAction {
    action: String!
    id: ID
  }
`

// reactive variables
export const authUser = makeVar(null)
export const postLoginAction = makeVar(null)

// local queries
const GET_AUTH_USER_QUERY = gql`
  query {
    getAuthUser {
      ...AuthUser
    }
  }
  ${ AUTH_USER_FRAGMENT }
`
const GET_POST_LOGIN_ACTION = gql`
  query {
    getPostLoginAction {
      action
      id
    }
  }
`

// query from local state
export function queryAuthUser() {
  const { data: { getAuthUser } } = useQuery (GET_AUTH_USER_QUERY)
  return getAuthUser
}
export function queryPostLoginAction() {
  const { data: { getPostLoginAction } } = useQuery (GET_POST_LOGIN_ACTION)
  return getPostLoginAction
}