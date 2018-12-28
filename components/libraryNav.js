import Link from 'next/link'

const LibraryNav = () => (
  <nav>
    <Link href="/playlists-list">
      <a>My Playlists</a>
    </Link>
    <Link href="/recently-played">
      <a>Recently Played</a>
    </Link>
    <Link href="/most-played">
      <a>Most Played</a>
    </Link>
    <Link href="/liked">
      <a>Liked</a>
    </Link>
    <Link href="/saved">
      <a>Saved</a>
    </Link>
  </nav>
)

export default LibraryNav
