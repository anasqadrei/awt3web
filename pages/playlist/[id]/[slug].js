import { withApollo } from '../../../lib/withApollo'
import Layout from '../../../components/layout'
import LibraryNav from '../../../components/libraryNav'
import Playlist from '../../../components/playlist.comp'

export default withApollo()(() => (
  <Layout>
    <LibraryNav/>
    <Playlist/>
  </Layout>
))
