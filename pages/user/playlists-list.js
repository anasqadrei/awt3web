import { withApollo } from '../../lib/withApollo'
import Link from 'next/link'
import Layout from '../../components/layout'
import LibraryNav from '../../components/libraryNav'
import Playlists from '../../components/playlist.user.comp'

export default withApollo()(() => (
  <Layout>
    <LibraryNav/>
    <div>
      My Playlists List
      <div>
        <Link href="/playlist/create">
          <a><img src="https://via.placeholder.com/30?text=%2B"/>Create a New playlist</a>
        </Link>
      </div>
      private playlists
      <Playlists snippet={ false } private={ true }/>
      public playlists
      <Playlists snippet={ false } private={ false }/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
))
