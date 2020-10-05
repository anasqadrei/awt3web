import Layout from 'components/layout'
import Head from 'components/head'
import CreateSong from 'components/song.create.comp'

const META = {
  asPath: `/song/upload`,
  title: `Upload Song`,
  description: `Upload Song`,
}

const Upload = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    upload page
    <CreateSong/>
  </Layout>
)

export default Upload
