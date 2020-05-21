import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import UserSongs from 'components/song.user.comp'
import UserSongImages from 'components/songImage.user.comp'
import UserLyrics from 'components/lyrics.user.comp'

export default withApollo()(() => (
  <Layout>
    <p>User Uploads</p>
    <p>Songs</p>
    <UserSongs snippet={ false }/>
    <p>Images</p>
    <UserSongImages snippet={ false }/>
    <p>Lyrics</p>
    <UserLyrics snippet={ false }/>
  </Layout>
))
