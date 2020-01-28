import Link from 'next/link'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Head from '../components/head'
import NewSongs from '../components/song.new.comp'
import TopLikedArtists from '../components/artist.topLiked.comp'
import TopHashtagsInSongs from '../components/hashtag.topInSongs.comp'

const trendingSongs = []
for (let i = 0; i < 20; i++) {
  trendingSongs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/80?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <Link as="/artist/1/slug" href={`/artist?id=1`}>
        <a>artist name</a>
      </Link>
    </div>
  )
}

const recentlyPlayedSongs = []
for (let i = 0; i < 20; i++) {
  recentlyPlayedSongs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/80?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <Link as="/artist/1/slug" href={`/artist?id=1`}>
        <a>artist name</a>
      </Link>
    </div>
  )
}

const trendingSearches = []
for (let i = 0; i < 20; i++) {
  trendingSearches.push(
    <Link key={i} href="search-results?q=Search-Term">
      <a>trending keyword {i} </a>
    </Link>
  )
}

export default WithData(() => (
  <Layout>
    <Head/>
    <div>
      <h1>Awtarika</h1>
      <p>اهلا بكم في موقع اوتاريكا للاغاني حيث نتمنى ان تسعدوا بقضاء افضل الاوقات بسماع كل ما يحلوا لكم من اغاني و موسيقى.</p>
      <NewSongs/>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <div>
        Trending
        {trendingSongs}
      </div>
      <div>
        Trending Searches
        {trendingSearches}
      </div>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <div>
        My Recently Played
        {recentlyPlayedSongs}
      </div>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <div>
        song hashtags
        <TopHashtagsInSongs/>
      </div>
      <div>
        popular artists
        <TopLikedArtists/>
      </div>
      <Link href="browse">
        <a>Browse More</a>
      </Link>
    </div>
  </Layout>
))
