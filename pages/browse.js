import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

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
      <a><img src="https://via.placeholder.com/150?text=Artist+Img" alt=""/>Artists {i}</a>
    </Link>
  )
}

export default (props) => (
  <Layout>
    <div>Browse</div>
    <div>
      {hashtags}
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>Artists</div>
    <div>
      {artists}
    </div>
  </Layout>
)
