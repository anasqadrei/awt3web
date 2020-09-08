import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Head from 'components/head'
import UserSongs from 'components/song.user.comp'
import UserSongImages from 'components/songImage.user.comp'
import UserLyrics from 'components/lyrics.user.comp'

const META = {
  title: `Uploads`,
}

export default () => (
  <Layout>
    <Head title={ META.title }/>
    <p>User Uploads</p>
    <p>Songs</p>
    <UserSongs userId={ useRouter().query.id } snippet={ false }/>
    <p>Images</p>
    <UserSongImages userId={ useRouter().query.id } snippet={ false }/>
    <p>Lyrics</p>
    <UserLyrics userId={ useRouter().query.id } snippet={ false }/>
  </Layout>
)
