import WithData from '../../lib/withData'
import Layout from '../../components/layout'
import LibraryNav from '../../components/libraryNav'
import UserRecentlyPlayedSongs from '../../components/song.userRecentlyPlayed.comp'

export default WithData(() => (
  <Layout>
    <LibraryNav/>
    <div>
      <UserRecentlyPlayedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
))
