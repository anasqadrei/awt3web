import { withRouter } from 'next/router'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Song from '../components/song.comp'

export default withRouter(WithData((props) => (
  <Layout>
    <Song router={ props.router } fixSlug={ true } />
  </Layout>
)))
