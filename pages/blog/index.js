import WithData from '../../lib/withData'
import Layout from '../../components/layout'
import BlogpostsList from '../../components/blogpostsList.comp'

export default WithData(() => (
  <Layout>
    <BlogpostsList/>
  </Layout>
))
