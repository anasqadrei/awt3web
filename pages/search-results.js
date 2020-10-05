import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Head from 'components/head'
import SearchArtists from 'components/artist.search.comp'
import SearchSongs from 'components/song.search.comp'
import SearchPlaylists from 'components/playlist.search.comp'
import TopSearchTerms from 'components/search.topTerms.comp'
import TopSongsInClickedSearchResults from 'components/song.topInClickedSearchResults.comp'
import TopArtistsInClickedSearchResults from 'components/artist.topInClickedSearchResults.comp'
import TopPlaylistsInClickedSearchResults from 'components/playlist.topInClickedSearchResults.comp'
import UserRecentlySearched from 'components/search.userRecentlySearched.comp'

const META = {
  title: `بحث`,
  description: `نتائج البحث`,
}

const SearchResults = () => (
  <Layout>
    <Head title={ `${ META.title }: ${ useRouter().query.q || `` }` } description={ META.description }/>
    <div>
      <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
    </div>
    <p>Results for <b>{ useRouter().query.q }</b> Search Term</p>
    { useRouter().query.q &&
      <div>
        <SearchArtists/>
        <SearchSongs/>
        <SearchPlaylists/>
      </div>
    }
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
)

export default SearchResults
