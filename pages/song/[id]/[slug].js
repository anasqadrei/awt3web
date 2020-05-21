import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import Song from 'components/song.comp'

export default withApollo()(() => (
  <Layout>
    <Song/>
  </Layout>
))
