import { gql, makeVar, useQuery } from '@apollo/client'

// local schema
export const TYPE_DEFS = gql`
  extend type Query {
    getAuthUser: User!
  }
`

// reactive variable
export const authUser = makeVar(null)

// local query
const GET_AUTH_USER_QUERY = gql`
  query {
    getAuthUser {
      id
      username
      admin
    }
  }
`

// query from local state
export function queryAuthUser() {
  const { data: { getAuthUser } } = useQuery (GET_AUTH_USER_QUERY)
  return getAuthUser
}