import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import LibraryNav from '../components/libraryNav'
import SongItem from '../components/songItem.comp'
import ArtistItem from '../components/artistItem.comp'

const songs = []
for (let i = 0; i < 10; i++) {
  songs.push(
    <SongItem key={i}/>
  )
}

const artists = []
for (let i = 0; i < 5; i++) {
  artists.push(
    <ArtistItem key={i}/>
  )
}

export default (props) => (
  <Layout>
    <LibraryNav/>
    Saved
    <div>
      Songs
      {songs}
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
    </div>
    <div>
      Artists
      {artists}
    </div>
  </Layout>
)
