import Layout from 'components/layout'
import Head from 'components/head'
import CreatePlaylist from 'components/playlist.create.comp'

const META = {
  asPath: `/playlist/create`,
  title: `Create Playlist`,
  description: `Create Playlist`,
}

const Page = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <CreatePlaylist/>
  </Layout>
)

export default Page
