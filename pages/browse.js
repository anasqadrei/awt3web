import Link from 'next/link'
import Layout from '../components/layout'
import Head from '../components/head'

export default (props) => (

  <Layout>
    <div>Browse</div>
    <div>
      <Link as="/hashtag/XX" href={`/hashtag?id=XX`}>
        <a>#Tamer Hosny</a>
      </Link>
      <Link as="/hashtag/XX" href={`/hashtag?id=XX`}>
        <a>#Nancy Ajram</a>
      </Link>
      <Link as="/hashtag/XX" href={`/hashtag?id=XX`}>
        <a>#George Wassouf</a>
      </Link>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+LeaderboardAd" />
    </div>
    <div>Artists</div>
    <div>
      <Link as="/artist/0/xxx" href={{ pathname: '/artist', query: { id: 0, slug: 'xxx' } }}>
        <a><img src="https://via.placeholder.com/150?text=TamerHosny"/>Tamer Hosny</a>
      </Link>
      <Link as="/artist/0/xxx" href={{ pathname: '/artist', query: { id: 0, slug: 'xxx' } }}>
        <a><img src="https://via.placeholder.com/150?text=NancyAjram"/>Nancy Ajram</a>
      </Link>
      <Link as="/artist/0/xxx" href={{ pathname: '/artist', query: { id: 0, slug: 'xxx' } }}>
        <a><img src="https://via.placeholder.com/150?text=GeorgeWassouf"/>George Wassouf</a>
      </Link>
      <Link as="/artist/1/وديع-الصافي" href={`/artist?id=1&slug=وديع-الصافي`}>
        <a><img src="https://via.placeholder.com/150"/>وديع الصافي</a>
      </Link>
      <Link as="/artist/4" href={`/artist?id=4`}>
        <a><img src="https://via.placeholder.com/150"/>artist doesn't exist</a>
      </Link>
      <Link as="/artist/185/j" href={{ pathname: '/artist', query: { id: 185, slug: 'fairoz' } }}>
        <a><img src="https://via.placeholder.com/150"/>فيروز</a>
      </Link>
      <Link as="/artist/5/elisxa" href={{ pathname: '/artist', query: { id: 5, slug: 'elizsa' } }}>
        <a><img src="https://via.placeholder.com/150"/>elisa</a>
      </Link>
    </div>
  </Layout>
)
