import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (

  <Layout>
    Browse page
    <p>Artists List</p>
    <Link as="/artist/1/وديع-الصافي" href={`/artist?id=1&slug=وديع-الصافي`}>
      <a>وديع الصافي</a>
    </Link>
    <br/>
    <Link as="/artist/4" href={`/artist?id=4`}>
      <a>artist doesn't exist</a>
    </Link>
    <br/>
    <Link as="/artist/185/j" href={{ pathname: '/artist', query: { id: 185, slug: 'fairoz' } }}>
      <a>فيروز</a>
    </Link>
    <br/>
    <Link as="/artist/5/elisxa" href={{ pathname: '/artist', query: { id: 5, slug: 'elizsa' } }}>
      <a>elisa</a>
    </Link>
    <p>Hashtags List</p>
    <Link as="/hashtag/الليل_يا_ليلى" href={`/hashtag?id=XX`}>#الليل....</Link>
  </Layout>
)
