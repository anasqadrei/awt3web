import Link from 'next/link'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Head from '../components/head'
import NewSongs from '../components/song.new.comp'
import TopSongs from '../components/song.top.comp'
import UserRecentlyPlayedSongs from '../components/song.userPlayed.comp'
import TopLikedArtists from '../components/artist.topLiked.comp'
import TopHashtagsInSongs from '../components/hashtag.topInSongs.comp'
import TopHashtagsInPlaylists from '../components/hashtag.topInPlaylists.comp'

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
        <TopSongs/>
      </div>
      <div>
        Trending Searches
        {trendingSearches}
      </div>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <div>
        <UserRecentlyPlayedSongs/>
      </div>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
      <div>
        song hashtags
        <TopHashtagsInSongs/>
      </div>
      <div>
        playlist hashtags
        <TopHashtagsInPlaylists/>
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
