import { useRouter } from 'next/router'
import { withApollo } from 'lib/withApollo'
import Layout from 'components/layout'
import HashtagSongs from 'components/song.hashtag.comp'
import HashtagPlaylists from 'components/playlist.hashtag.comp'

export default withApollo()(() => (
  <Layout>
    <h1 dir="ltr">#{ useRouter().query.hashtag }</h1>
    <HashtagSongs/>
    <HashtagPlaylists/>
  </Layout>
))
