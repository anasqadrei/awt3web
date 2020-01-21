import WithData from '../lib/withData'
import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'
import ArtistsGrid from '../components/artist.grid.comp'

const hashtags = []
for (let i = 0; i < 20; i++) {
  hashtags.push(
    <Link key={i} as="/hashtag/XX" href={`/hashtag?id=XX`}>
      <a>#Hashtagـ{i} </a>
    </Link>
  )
}

export default WithData((props) => (
  <Layout>
    <div>Browse</div>
    <div>
      {hashtags}
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>Artists</div>
    <ArtistsGrid/>
  </Layout>
))
