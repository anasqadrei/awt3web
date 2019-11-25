import { withRouter } from 'next/router'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Artist from '../components/artist.comp'

export default withRouter(WithData((props) => (
  <Layout>
    <Artist router={ props.router } fixSlug={ true } />
  </Layout>
)))
