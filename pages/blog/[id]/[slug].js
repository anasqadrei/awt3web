import { withApollo } from '../../../lib/withApollo'
import Layout from '../../../components/layout'
import Blogpost from '../../../components/blogpost.comp'

export default withApollo()(() => (
  <Layout>
    <Blogpost/>
  </Layout>
))
