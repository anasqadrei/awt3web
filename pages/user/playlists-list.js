import Link from 'next/link'
import { queryAuthUser } from 'lib/localState'
import Head from 'components/head'
import Layout from 'components/layout'
import Playlists from 'components/playlist.user.comp'

const META = {
  asPath: `/playlists-list`,
  title: `Playlists List`,
  description: `Playlists List`,
}

const Page = () => {
  // get authenticated user
  const getAuthUser = queryAuthUser()

  return (
    <Layout>
      <Head asPath={ META.asPath } title={ META.title } description={ META.description }/>
      <div>
        My Playlists List
        <div>
          <Link href="/playlist/create">
            <a><img src="https://via.placeholder.com/30?text=%2B"/>Create a New playlist</a>
          </Link>
        </div>
        private playlists
        <Playlists userId={ getAuthUser?.id } snippet={ false } private={ true }/>
        public playlists
        <Playlists userId={ getAuthUser?.id } snippet={ false } private={ false }/>
      </div>
      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>
    </Layout>
  )
}

export default Page
