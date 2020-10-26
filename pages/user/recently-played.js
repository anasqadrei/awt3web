import Layout from 'components/layout'
import Head from 'components/head'
import UserRecentlyPlayedSongs from 'components/song.userRecentlyPlayed.comp'

const META = {
  asPath: `/recently-played`,
  title: `Recently Played`,
  description: `Recently Played`,
}

const Page = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <div>
      <UserRecentlyPlayedSongs snippet={ false }/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
) 

export default Page
