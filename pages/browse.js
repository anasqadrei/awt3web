// @flow

import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

// export default withData((props) => (
export default (props) => (

  <Layout>
    Browse page
    <p>Artists List</p>
    <Link as="/artist/1/وديع" href={`/artist?id=1`}>
      <a>وديع الصافي</a>
    </Link>
    <p>Hashtags List</p>
    <Link as="/hashtag/الليل_يا_ليلى" href={`/hashtag?id=XX`}>#الليل....</Link>
  </Layout>
)
// ))
