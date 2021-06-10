import Link from 'next/link'
import Image from 'next/image'
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
            <Link href={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <a>{ getAuthUser.username }</a>
            </Link>
            <Link href={ `/user/${ getAuthUser.id }/${ getAuthUser.slug }` }>
              <a>
                {
                  getAuthUser.imageUrl?.match(process.env.NEXT_PUBLIC_AWTARIKA_IMAGES_DOMAIN) ? (
                    <Image src={ getAuthUser.imageUrl } alt={ getAuthUser.imageUrl && getAuthUser.username } width={ 50 } height={ 50 }/>
                  ) : (
                    <img src={ getAuthUser.imageUrl || `https://via.placeholder.com/50?text=No+Photo` } alt={ getAuthUser.imageUrl && getAuthUser.username } width={ 50 } height={ 50 }/>
                  )
                }
              </a>
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