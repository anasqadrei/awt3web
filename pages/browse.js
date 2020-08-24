import Layout from 'components/layout'
import Head from 'components/head'
import ArtistsGrid from 'components/artist.grid.comp'
import TopHashtagsInSongs from 'components/hashtag.topInSongs.comp'
import TopHashtagsInPlaylists from 'components/hashtag.topInPlaylists.comp'

const META = {
  title: `تصفح`,
  description: `تصفح المطربين و الأغاني`,
}

export default () => (
  <Layout>
    <Head title={ META.title } description={ META.description }/>
    <div>Browse</div>
    <div>
      song hashtags
      {/* <TopHashtagsInSongs/> */}
    </div>
    <div>
      playlist hashtags
      {/* <TopHashtagsInPlaylists/> */}
    </div>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>Artists</div>
    <ArtistsGrid/>
  </Layout>
)
