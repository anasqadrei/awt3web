import Layout from 'components/layout'
import Head from 'components/head'
import LibraryNav from 'components/libraryNav'
import CreatePlaylist from 'components/playlist.create.comp'

const META = {
  asPath: `/playlist/create`,
  title: `Create Playlist`,
  description: `Create Playlist`,
}

export default () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <LibraryNav/>
    <CreatePlaylist/>
  </Layout>
)
