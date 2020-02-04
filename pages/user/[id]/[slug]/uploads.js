import WithData from '../../../../lib/withData'
import Layout from '../../../../components/layout'
import UserSongs from '../../../../components/song.user.comp'

export default WithData(() => (
  <Layout>
    <p>User Uploads</p>
    <UserSongs snippet={ false }/>
  </Layout>
))
