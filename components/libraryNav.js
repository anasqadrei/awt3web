import Link from 'next/link'

const LibraryNav = () => (
  <nav>
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
  </nav>
)

export default LibraryNav
