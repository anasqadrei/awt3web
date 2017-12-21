// @flow

import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

// export default withData((props) => (
export default (props) => (

  <Layout>
    blog page
    <p>blogposts List</p>
    <Link as="/blog/1/xx" href={`/blogpost?id=1`}>xx</Link>
  </Layout>
)
// ))
