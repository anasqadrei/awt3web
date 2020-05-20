import { withApollo } from '../../lib/withApollo'
import Layout from '../../components/layout'
import LibraryNav from '../../components/libraryNav'
import UserMostPlayedSongs from '../../components/song.userMostPlayed.comp'
import UserMostPlayedArtists from '../../components/artist.userMostPlayed.comp'

export default withApollo()(() => (
  <Layout>
    <LibraryNav/>
    <div>
      <UserMostPlayedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      <UserMostPlayedArtists/>
    </div>
  </Layout>
))
