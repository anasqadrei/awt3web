import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Head from 'components/head'
import HashtagSongs from 'components/song.hashtag.comp'
import HashtagPlaylists from 'components/playlist.hashtag.comp'

const META = {
  title: `وسم`,
  description: `وسم و كلمة مفتاحية و هاش تاجات`,
}

 const Page = () => (
  <Layout>
    <Head title={ `${ META.title }: ${ useRouter().query.hashtag || `` }` } description={ META.description }/>
    <h1>#{ useRouter().query.hashtag }</h1>
    <HashtagSongs hashtag={ useRouter().query.hashtag }/>
    <HashtagPlaylists hashtag={ useRouter().query.hashtag }/>
  </Layout>
)

export default Page