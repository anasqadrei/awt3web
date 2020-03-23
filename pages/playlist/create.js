import WithData from '../../lib/withData'
import Layout from '../../components/layout'
import LibraryNav from '../../components/libraryNav'
import CreatePlaylist from '../../components/playlist.create.comp'

export default WithData(() => (
  <Layout>
    <CreatePlaylist/>
  </Layout>
))
