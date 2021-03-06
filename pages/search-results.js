import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

const songs = []
for (let i = 0; i < 20; i++) {
  songs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/30?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <Link as="/artist/1/slug" href={`/artist?id=1`}>
        <a>artist name</a>
      </Link>
      <p>Lorem ipsum dolor sit amet, <strong>consectetur adipiscing</strong> elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua....</p>
    </div>
  )
}

const artists = []
for (let i = 0; i < 10; i++) {
  artists.push(
    <Link key={i} as="/artist/0/xxx" href={{ pathname: '/artist', query: { id: 0, slug: 'xxx' } }}>
      <a><img src="https://via.placeholder.com/150?text=Artist+Img" alt=""/>Artists Name {i}</a>
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

const recentSearches = []
for (let i = 0; i < 20; i++) {
  recentSearches.push(
    <Link key={i} href="search-results?q=Search-Term">
      <a>recent search keyword {i} </a>
    </Link>
  )
}

export default (props) => (
  <Layout>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      Results for XXX Search Term
    </div>
    <div>
      {artists}
    </div>
    {songs}
    <div>
      <p>Tranding Searches</p>
      {trendingSearches}
    </div>
    <div>
      <p>Recent Searches</p>
      {recentSearches}
    </div>
  </Layout>
)
