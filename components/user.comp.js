import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import Head from './head'
import ErrorMessage from './errorMessage'

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
      sex
      country {
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
        <h1 className="title">{ getUser.username }</h1>
      </div>

      <p>emails: { getUser.emails }</p>
      <p>social media: { getUser.profiles[0].provider }</p>
      <p>Sex: { getUser.sex }</p>
      <p>country: { getUser.country.nameAR }</p>
      <p>last login: { getUser.lastSeenDate }</p>
      <p>joined: { getUser.createdDate }</p>
      <p>premium: { getUser.premium || 'No'}</p>
      <Link href="/playlists-list">
        <a>Library</a>
      </Link>
      <p>uploads snippet. wait for the designer to finish it</p>
      <Link as="/user/1/xxx/uploads" href={{ pathname: '/user-uploads', query: { id: 1, slug: 'xxx' } }}>
        <a>more uploads</a>
      </Link>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
