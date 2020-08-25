import Layout from 'components/layout'
import LibraryNav from 'components/libraryNav'
import UserLikedSongs from 'components/song.userLiked.comp'
import UserLikedArtists from 'components/artist.userLiked.comp'
import UserLikedPlaylists from 'components/playlist.userLiked.comp'

export default () => (
  <Layout>
    <LibraryNav/>
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
