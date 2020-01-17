import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import Head from './head'
import SongItem from './song.item.comp'
import CreateComment from './comment.create.comp'
import CommentsList from './comment.list.comp'
import ErrorMessage from './errorMessage'

const PLAYLISTS_COLLECTION = 'playlists'
const GET_PLAYLIST_QUERY = gql`
  query getPlaylist ($id: ID!) {
    getPlaylist(id: $id) {
      id
      name
      slug
      url
      imageUrl
      desc
      hashtags
      private
      duration
      createdDate
      lastUpdatedDate
      user {
        id
        username
        slug
      }
      songs {
        id
        title
        slug
        artist {
          id
          name
          slug
        }
        duration
        defaultImage {
          url
        }
      }
      comments
      plays
      usersPlayed
      likes
      shares
    }
  }
`

export default function playlist() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_PLAYLIST_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage />
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getPlaylist } = data

  // in case playlist not found
  if (!getPlaylist) {
    return (<div>Playlist doesn't exist (design this)</div>)
  }

  // fix url in case it doesn't match the slug
  const regExp = new RegExp (`^/playlist/${ router.query.id }/${ getPlaylist.slug }([?].*|[#].*|/)?$`)
  if (!decodeURIComponent(router.asPath).match(regExp)) {
    const href = `/playlist/[id]/[slug]`
    const as = `/playlist/${ router.query.id }/${ getPlaylist.slug }`
    router.replace(href, as)
  }

  // display playlist
  return (
    <section>
      <Head title={ getPlaylist.name } description={ getPlaylist.name } asPath={ decodeURIComponent(router.asPath) } ogImage={ getPlaylist.imageUrl } />
      <div>
        <img src={ getPlaylist.imageUrl ? getPlaylist.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
        <h1 className="title">{ getPlaylist.name }</h1>
        <Link href=""><a>Like</a></Link>
        { getPlaylist.likes ? `${ getPlaylist.likes } liked them` : `be the first to like? or empty?` }
      </div>

      <div>
        <Link href=""><a>Play All</a></Link> | <Link href=""><a>Shuffle</a></Link> | <Link href=""><a>Edit</a></Link> | <Link href=""><a>Delete</a></Link>
      </div>

      <div>
        Share
        { getPlaylist.shares ? `${ getPlaylist.shares } shared this` : `be the first to share` }
        <Link href="/"><a>Facebook</a></Link>
        <Link href="/"><a>Twitter</a></Link>
        <span dir="ltr"><input value={ getPlaylist.url } readOnly/></span>
      </div>

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        Data?
        { getPlaylist.usersPlayed ? `${ getPlaylist.usersPlayed } listeners` : null }
        Played: { getPlaylist.plays ? getPlaylist.plays : 0 }

        Added by: <Link href="/user/[id]/[slug]" as={ `/user/${ getPlaylist.user.id }/${ getPlaylist.user.slug }` }><a>{ getPlaylist.user.username }</a></Link> on { getPlaylist.createdDate }
      </div>

      <div>
        { getPlaylist.songs && getPlaylist.songs.map(song => (
          <SongItem key={ song.id } song={ song } />
        )) }
      </div>

      <CreateComment collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id } />
      <CommentsList collection={ PLAYLISTS_COLLECTION } id={ getPlaylist.id } total={ getPlaylist.comments }/>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
