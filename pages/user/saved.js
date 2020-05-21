import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import LibraryNav from 'components/libraryNav'
import UserSavedSongs from 'components/song.userSaved.comp'

export default withApollo()(() => (
  <Layout>
    <LibraryNav/>
    <div>
      <UserSavedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
))
