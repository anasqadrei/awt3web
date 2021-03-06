import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

const recentlyAddedSongs = []
for (let i = 0; i < 20; i++) {
  recentlyAddedSongs.push(
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

const hashtags = []
for (let i = 0; i < 20; i++) {
  hashtags.push(
    <Link key={i} as="/hashtag/XX" href={`/hashtag?id=XX`}>
      <a>#Hashtagـ{i} </a>
    </Link>
  )
}

const artists = []
for (let i = 0; i < 20; i++) {
  artists.push(
    <Link key={i} as="/artist/0/xxx" href={{ pathname: '/artist', query: { id: 0, slug: 'xxx' } }}>
      <a><img src="https://via.placeholder.com/80?text=Artist+Img" alt=""/>Artists {i}</a>
    </Link>
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

export default () => (
  <Layout>
    <Head title="أوتاريكا" />
    <div>
      <h1>Awtarika</h1>
      <p>اهلا بكم في موقع اوتاريكا للاغاني حيث نتمنى ان تسعدوا بقضاء افضل الاوقات بسماع كل ما يحلوا لكم من اغاني و موسيقى.</p>
      <div>
        New Songs
        {recentlyAddedSongs}
      </div>
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
        hashtags
        {hashtags}
      </div>
      <div>
        popular artists
        {artists}
      </div>
      <Link href="browse">
        <a>Browse More</a>
      </Link>
    </div>
  </Layout>
)
