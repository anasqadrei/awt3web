import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (
  <Layout>
    <Head/>
    contact us page
    <div>
      <textarea row="5"/>
      <Link href="#">
        <a>Send</a>
      </Link>
    </div>
  </Layout>
)
