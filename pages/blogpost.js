import { withRouter } from 'next/router'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Blogpost from '../components/blogpost.comp'

export default withRouter(WithData((props) => (
  <Layout>
    <Blogpost router={ props.router } fixSlug={ true } />
  </Layout>
)))
