import WithData from '../../lib/withData'
import Layout from '../../components/layout'
import Head from '../../components/head'
import CreateSong from '../../components/song.create.comp'

export default WithData(() => (
  <Layout>
    <Head/>
    upload page
    <CreateSong/>
  </Layout>
))
