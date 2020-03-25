import Link from 'next/link'
import { useRouter } from 'next/router'
import WithData from '../lib/withData'
import Layout from '../components/layout'
import Head from '../components/head'
import SearchArtists from '../components/artist.search.comp'
import TopSearchTerms from '../components/search.topTerms.comp'
import TopSongsInClickedSearchResults from '../components/song.topInClickedSearchResults.comp'
import TopArtistsInClickedSearchResults from '../components/artist.topInClickedSearchResults.comp'
import TopPlaylistsInClickedSearchResults from '../components/playlist.topInClickedSearchResults.comp'
import UserRecentlySearched from '../components/search.userRecentlySearched.comp'

export default WithData(() => (
  <Layout>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <div>
      Results for <b>{ useRouter().query.q }</b> Search Term
    </div>

    {/* // TEMP: until elastic search is turned on */}
    <div>
      <SearchArtists/>
    </div>
    <div>
      <TopSongsInClickedSearchResults/>
    </div>

    <div>
      <p>Tranding Searches</p>
      <TopSearchTerms/>
      <TopSongsInClickedSearchResults/>
      <TopArtistsInClickedSearchResults/>
      <TopPlaylistsInClickedSearchResults/>
    </div>
    <div>
      <p>Recent Searches</p>
      <UserRecentlySearched/>
    </div>
  </Layout>
))
