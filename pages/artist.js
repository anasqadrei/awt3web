import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import Artist from '../components/artist.comp'
import withData from '../lib/withData'

export default withData((props) => (
  <Layout>
    <Artist id={props.url.query.id} />
    Artist page, list of songs
    <Link as="/song/1/الليل-يا-ليلى" href={`/song?id=1`}>
      <a>
        الليل-يا-ليلى
      </a>
    </Link>
  </Layout>
))
