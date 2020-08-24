import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import Head from 'components/head'
import CreateSong from 'components/song.create.comp'

export default withApollo()(() => (
  <Layout>
    <Head/>
    upload page
    <CreateSong/>
  </Layout>
))