import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import BlogpostsList from 'components/blogpostsList.comp'

export default withApollo()(() => (
  <Layout>
    <BlogpostsList/>
  </Layout>
))
