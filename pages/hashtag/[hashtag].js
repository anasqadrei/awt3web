import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Head from 'components/head'
import HashtagSongs from 'components/song.hashtag.comp'
import HashtagPlaylists from 'components/playlist.hashtag.comp'

const META = {
  title: `وسم:`,
  description: `وسم و كلمة مفتاحية و هاش تاجات`,
}

// TODO: title useRouter().query.hashtag shows as undefined in Head. fix it

export default () => (
  <Layout>
    <Head title={ `${ META.title } ${ useRouter().query.hashtag }` } description={ META.description }/>
    <h1>#{ useRouter().query.hashtag }</h1>
    <HashtagSongs/>
    <HashtagPlaylists/>
  </Layout>
)
