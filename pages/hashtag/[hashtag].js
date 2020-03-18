import { useRouter } from 'next/router'
import WithData from '../../lib/withData'
import Layout from '../../components/layout'
import HashtagSongs from '../../components/song.hashtag.comp'
import HashtagPlaylists from '../../components/playlist.hashtag.comp'

export default WithData(() => (
  <Layout>
    <h1 dir="ltr">#{ useRouter().query.hashtag }</h1>
    <HashtagSongs/>
    <HashtagPlaylists/>
  </Layout>
))
