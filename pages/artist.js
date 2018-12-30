import Link from 'next/link'
import Layout from '../components/layout'
import WithData from '../lib/withData'
import Comment from '../components/comment.comp'
import CommentsList from '../components/commentsList.comp'
// import Artist from '../components/artist.comp'
// <Artist url={props.url} fixSlug={true} />

const recentlyAddedSongs = []
for (let i = 0; i < 10; i++) {
  recentlyAddedSongs.push(
    <Link key={i} as="/song/1/slug" href={`/song?id=1`}>
      <a>song title </a>
    </Link>
  )
}

const popularSongs = []
for (let i = 0; i < 10; i++) {
  popularSongs.push(
    <Link key={i} as="/song/1/slug" href={`/song?id=1`}>
      <a>song title </a>
    </Link>
  )
}

const allSongs = []
for (let i = 0; i < 20; i++) {
  allSongs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/30?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> 3:25
      <img src="https://via.placeholder.com/30?text=playsCount"/> 2,323
      <img src="https://via.placeholder.com/30?text=More+Actions"/>
    </div>
  )
}

export default WithData((props) => (
  <Layout>
    <div>
      <img src="https://via.placeholder.com/80"/>Artist Name
      <Link href=""><a>Like</a></Link> 2,233 liked them
    </div>
    <div>
      New Songs
      {recentlyAddedSongs}
    </div>
    <div>
      Share
      <Link href="/"><a>Facebook</a></Link>
      <Link href="/"><a>Twitter</a></Link>
      <Link href="/"><a>Google+</a></Link>
      <input value="https://www.awtarika.com/artist/1/slug-here"/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      Popular songs
      {popularSongs}
    </div>
    <div>
      Data?
      3,444 listers
      Songs played: 5,324,355
    </div>
    <div>
      All songs (sort: alphabetically, new, most listed, most liked).
      Total Songs: 3,344, Liked songs: 3,553
      {allSongs}
    </div>
    <Comment/>
    <CommentsList/>
  </Layout>
))
