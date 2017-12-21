import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

// export default withData((props) => (
export default (props) => (

  <Layout>
    playlists list page, list of songs
    <Link as="/playlist/1/my-list" href={`/playlist?id=1`}>
      <a>
        my list
      </a>
    </Link>
  </Layout>
)
// ))
