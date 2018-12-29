import Link from 'next/link'

const Nav = () => (
  <nav>
    <Link prefetch href="/">
      <a>Awtarika</a>
    </Link>
    <input type="text"/>
    <Link href="/search-results?q=Search-Term">
      <a>Search</a>
    </Link>
    <Link prefetch href="/song-upload">
      <a>Upload</a>
    </Link>
    <Link href="/playlists-list">
      <a>Library</a>
    </Link>
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
    <Link as="/user/1/xxx" href={{ pathname: '/user', query: { id: 1, slug: 'xxx' } }}>
      <a>Login</a>
    </Link>
  </nav>
)

export default Nav
