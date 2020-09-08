import Layout from 'components/layout'
import Head from 'components/head'
import LibraryNav from 'components/libraryNav'
import UserSavedSongs from 'components/song.userSaved.comp'

const META = {
  asPath: `/saved`,
  title: `Saved Songs`,
  description: `saved songs`,
}

export default () => (
  <Layout>
    <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
    <LibraryNav/>
    <div>
      <UserSavedSongs/>
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
  </Layout>
)
