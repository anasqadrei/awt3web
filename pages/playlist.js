import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

// export default withData((props) => (
export default (props) => (

  <Layout>
    playlist page, list of songs
    <Link as="/song/1/الليل-يا-ليلى" href={`/song?id=1`}>
      <a>
        الليل-يا-ليلى
        وديع الصافي
      </a>
    </Link>
  </Layout>
)
// ))
