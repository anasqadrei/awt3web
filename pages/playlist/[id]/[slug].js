import WithData from '../../../lib/withData'
import Layout from '../../../components/layout'
import LibraryNav from '../../../components/libraryNav'
import Playlist from '../../../components/playlist.comp'

export default WithData(() => (
  <Layout>
    <LibraryNav/>
    <Playlist/>
  </Layout>
))
