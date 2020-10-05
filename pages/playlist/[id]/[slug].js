import Layout from 'components/layout'
import Head from 'components/head'
import LibraryNav from 'components/libraryNav'
import Playlist from 'components/playlist.comp'

const Page = () => (
  <Layout>
    <Head/>
    <LibraryNav/>
    <Playlist/>
  </Layout>
)

export default Page