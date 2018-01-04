import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

// export default withData((props) => (
export default (props) => (

  <Layout>
    search results page, list of songs or artists
    <p>Recent Searches</p>
    <p>Tranding Searches</p>
    <Link as="/artist/1/وديع" href={`/artist?id=1`}>
      <a>وديع الصافي</a>
    </Link>
    <Link as="/song/1/الليل-يا-ليلى" href={`/song?id=1`}>
      <a>
        الليل-يا-ليلى
        وديع الصافي
      </a>
    </Link>
  </Layout>
)
// ))
