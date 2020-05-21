import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import LibraryNav from 'components/libraryNav'
import CreatePlaylist from 'components/playlist.create.comp'

export default withApollo()(() => (
  <Layout>
    <CreatePlaylist/>
  </Layout>
))
