import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import LibraryNav from '../components/libraryNav'
import SongItem from '../components/songItem.comp'

const songs = []
for (let i = 0; i < 10; i++) {
  songs.push(
    <SongItem key={i}/>
  )
}

export default (props) => (
  <Layout>
    <LibraryNav/>
    <img src="https://via.placeholder.com/80"/>playlist page, list of songs
    <div>
      <Link href=""><a>Play All</a></Link> | <Link href=""><a>Shuffle</a></Link> | <Link href=""><a>Edit</a></Link> | <Link href=""><a>Delete</a></Link>
    </div>
    {songs}
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
)
