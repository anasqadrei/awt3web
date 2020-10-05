import Layout from 'components/layout'
import Head from 'components/head'
import LibraryNav from 'components/libraryNav'
import UserMostPlayedSongs from 'components/song.userMostPlayed.comp'
import UserMostPlayedArtists from 'components/artist.userMostPlayed.comp'

const META = {
  asPath: `/most-played`,
  title: `Most Played`,
  description: `Most Played`,
}

const MostPlayed = () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <LibraryNav/>
    <div>
      <UserMostPlayedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      <UserMostPlayedArtists/>
    </div>
  </Layout>
)

export default MostPlayed
