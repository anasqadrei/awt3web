import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Head from 'components/head'
import NewSongs from 'components/song.new.comp'
import TopSongs from 'components/song.top.comp'
import UserRecentlyPlayedSongs from 'components/song.userRecentlyPlayed.comp'
import TopLikedArtists from 'components/artist.topLiked.comp'
import TopHashtagsInSongs from 'components/hashtag.topInSongs.comp'
import TopHashtagsInPlaylists from 'components/hashtag.topInPlaylists.comp'
import TopSearchTerms from 'components/search.topTerms.comp'

const Page = () => {

  // remove old awtphase2 hashbangs /#!/
  const router = useRouter()
  if (router.asPath.match(/^\/\#\!\//)) {
    router.push(router.asPath.substring(3))
    return null
  }

  return (
    <Layout>
      <Head/>
      <div>
        <h1>Awtarika</h1>
        <p>اهلا بكم في موقع اوتاريكا للاغاني حيث نتمنى ان تسعدوا بقضاء افضل الاوقات بسماع كل ما يحلوا لكم من اغاني و موسيقى.</p>
        <NewSongs/>
        <div>
          <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
        </div>
        <div>
          <TopSongs/>
        </div>
        <div>
          Trending Searches
          <TopSearchTerms/>
        </div>
        <div>
          <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
        </div>
        <div>
          <UserRecentlyPlayedSongs snippet={ true }/>
          <Link href="/user/recently-played">
            <a>More</a>
          </Link>
        </div>
        <div>
          <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
        </div>
        <div>
          song hashtags
          <TopHashtagsInSongs/>
        </div>
        <div>
          playlist hashtags
          <TopHashtagsInPlaylists/>
        </div>
        <div>
          popular artists
          <TopLikedArtists/>
        </div>
        <Link href="browse">
          <a>Browse More</a>
        </Link>
      </div>
    </Layout>
  )
}

export default Page
