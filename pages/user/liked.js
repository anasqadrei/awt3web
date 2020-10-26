import Layout from 'components/layout'
import Head from 'components/head'
import UserLikedSongs from 'components/song.userLiked.comp'
import UserLikedArtists from 'components/artist.userLiked.comp'
import UserLikedPlaylists from 'components/playlist.userLiked.comp'

const META = {
  asPath: `/liked`,
  title: `Liked`,
  description: `Liked`,
}

const Page = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <div>
      <UserLikedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      <UserLikedArtists/>
    </div>
    <div>
      <UserLikedPlaylists/>
    </div>
  </Layout>
)


export default Page
