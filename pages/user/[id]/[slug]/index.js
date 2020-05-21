import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import User from 'components/user.comp'

export default withApollo()(() => (
  <Layout>
    <User/>
  </Layout>
))
