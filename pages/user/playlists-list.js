import Link from 'next/link'
import Layout from '../../components/layout'
import Head from '../../components/head'
import LibraryNav from '../../components/libraryNav'

const playlists = []
for (let i = 0; i < 10; i++) {
  playlists.push(
    <div key={i}>
      <Link as="/playlist/1/slug" href={`/playlist?id=1`}>
        <a><img src="https://via.placeholder.com/30"/>My Playlist {i}</a>
      </Link>
    </div>
  )
}

export default (props) => (
  <Layout>
    <LibraryNav/>
    My Playlists List
    <div>
      <Link href="">
        <a><img src="https://via.placeholder.com/30?text=%2B"/>New playlist</a>
      </Link>
    </div>
    {playlists}
  </Layout>
)
