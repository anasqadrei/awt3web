import Link from 'next/link'
import Search from 'components/search.comp'
import { queryAuthUser } from 'lib/localState'
import AuthUser, { logout } from 'components/user.auth.comp'

export default () => {
  // get authenticated user
  const getAuthUser = queryAuthUser()
  
  // display component
  return (
    <nav>
      <Link href="/">
        <a>Awtarika</a>
      </Link>
      <Search/>
      <Link href="/song/upload">
        <a>Upload</a>
      </Link>
      <Link href="/user/playlists-list">
        <a>Library</a>
      </Link>
      <Link href="/user/playlists-list">
        <a>My Playlists</a>
      </Link>
      <Link href="/user/recently-played">
        <a>Recently Played</a>
      </Link>
      <Link href="/user/most-played">
        <a>Most Played</a>
      </Link>
      <Link href="/user/liked">
        <a>Liked</a>
      </Link>
      <Link href="/user/saved">
        <a>Saved</a>
      </Link>
      {
        getAuthUser ? (
          <div>
            <Link href="/user/[id]/[slug]" as={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <a>{ getAuthUser.username }</a>
            </Link>
            <button onClick={ logout }>
              Logout
            </button>
          </div>
        ) : (
          <AuthUser/>
        )
      }
    </nav>
  )
}
