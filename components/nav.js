import Link from 'next/link'
import Search from 'components/search.comp'
import { queryAuthUser } from 'lib/localState'
import LibraryNav from 'components/libraryNav'
import AuthUser, { logout } from 'components/user.auth.comp'

const Comp = () => {
  // get authenticated user
  const getAuthUser = queryAuthUser()
  
  // display component
  return (
    <nav>
      <Link href="/">
        <a>أوتاريكا</a>
      </Link>
      <Search/>
      <Link href="/song/upload">
        <a>إضافة أغاني</a>
      </Link>
      {
        getAuthUser ? (
          <div>
            <Link href="/user/[id]/[slug]" as={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <a>{ getAuthUser.username }</a>
            </Link>
            <Link href="/user/[id]/[slug]" as={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <img src={ getAuthUser.imageUrl ? getAuthUser.imageUrl : `https://via.placeholder.com/100?text=No+Photo` } alt={ getAuthUser.imageUrl && getAuthUser.username }/>
            </Link>
            <button onClick={ logout }>
              Logout
            </button>
            <br/>
            <LibraryNav/>
          </div>
        ) : (
          <AuthUser/>
        )
      }
    </nav>
  )
}

export default Comp