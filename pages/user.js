import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (
  <Layout>
    <p>User Page</p>
    <p>profile, photo, premium account?, social media account</p>
    <Link href="/multilist">
      <a>uploads (make it user/uploads)</a>
    </Link>
  </Layout>
)
