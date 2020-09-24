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
      {
        getAuthUser ? (
          <div>
            <Link href="/user/playlists-list">
              <a>Library</a>
            </Link>
            <Link href="/user/[id]/[slug]" as={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <a>{ getAuthUser.username }</a>
            </Link>
            <Link href="/user/[id]/[slug]" as={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <img src={ getAuthUser.imageUrl ? getAuthUser.imageUrl : `https://via.placeholder.com/100?text=No+Photo` } alt={ getAuthUser.imageUrl && getAuthUser.username }/>
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
