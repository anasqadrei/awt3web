import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import Artist from 'components/artist.comp'

export default withApollo()(() => (
  <Layout>
    <Artist/>
  </Layout>
))
