import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import Artist from '../components/artist.comp'
import WithData from '../lib/withData'

export default WithData((props) => (
  <Layout>
    <Artist url={props.url} fixSlug={true} />
    Artist page, list of songs
    <Link as="/song/1/الليل-يا-ليلى" href={`/song?id=1`}>
      <a>
        الليل-يا-ليلى
      </a>
    </Link>
  </Layout>
))
