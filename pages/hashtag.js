import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import SongItem from '../components/songItem.comp'

const songs = []
for (let i = 0; i < 10; i++) {
  songs.push(
    <SongItem key={i}/>
  )
}

export default (props) => (
  <Layout>
    <Head/>
    #hashtag
    {songs}
  </Layout>
)
