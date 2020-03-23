import Link from 'next/link'

const Nav = () => (
  <nav>
    <Link href="/">
      <a>Awtarika</a>
    </Link>
    <input type="text"/>
    <Link href="/search-results?q=Search-Term">
      <a>Search</a>
    </Link>
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
    <Link href="/user/[id]/[slug]" as={ `/user/1/xxx` }>
      <a>Login</a>
    </Link>
  </nav>
)

export default Nav
