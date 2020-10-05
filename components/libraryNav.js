import Link from 'next/link'

const Comp = () => (
  <nav>
    <Link href="/user/playlists-list">
      <a>قوائم الأغاني</a>
    </Link>
    { ` - ` }
    <Link href="/user/recently-played">
      <a>آخر ما استمعت</a>
    </Link>
    { ` - ` }
    <Link href="/user/most-played">
      <a>أكثر ما سمعت</a>
    </Link>
    { ` - ` }
    <Link href="/user/liked">
      <a>المفضلة</a>
    </Link>
    { ` - ` }
    <Link href="/user/saved">
      <a>المنزلة</a>
    </Link>
  </nav>
)

export default Comp