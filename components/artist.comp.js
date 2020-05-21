import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as Sentry from '@sentry/node'
import Head from 'components/head'
import LikeArtist from 'components/artist.like.comp'
import ShareArtist from 'components/artist.share.comp'
import ArtistSongs from 'components/song.artist.comp'
import CreateComment from 'components/comment.create.comp'
import CommentsList from 'components/comment.list.comp'
import ErrorMessage from 'components/errorMessage'
import { DISPLAY } from 'lib/constants'

export const ARTISTS_COLLECTION = 'artists'
export const GET_ARTIST_QUERY = gql`
  query getArtist ($id: ID!) {
    getArtist(id: $id) {
      id
      name
      slug
      imageUrl
      likes
      shares
      comments
      songs
      songUsersPlayed
      songPlays
      songLikes
      songImages
      url
    }
  }
`

export default function Artist() {
  const router = useRouter()

  // set query variables
  const queryVariables = {
    id: router.query.id
  }

  // excute query
  const { loading, error, data } = useQuery (
    GET_ARTIST_QUERY,
    {
      variables: queryVariables,
    }
  )

  // error handling
  if (error) {
    Sentry.captureException(error)
    return <ErrorMessage message='حدث خطأ ما في عرض بيانات الفنان. الرجاء إعادة المحاولة.' />
  }

  // initial loading
  if (loading) {
    return (<div>Loading... (design this)</div>)
  }

  // get data
  const { getArtist } = data

  // in case artist not found
  if (!getArtist) {
    return (<div>Artist doesn't exist (design this)</div>)
  }

  // fix url in case it doesn't match the slug
  const regExp = new RegExp (`^/artist/${ router.query.id }/${ getArtist.slug }([?].*|[#].*|/)?$`)
  if (!decodeURIComponent(router.asPath).match(regExp)) {
    const href = `/artist/[id]/[slug]`
    const as = `/artist/${ router.query.id }/${ getArtist.slug }`
    router.replace(href, as)
  }

  // display artist
  return (
    <section>
      <Head title={ getArtist.name } description={ getArtist.name } asPath={ decodeURIComponent(router.asPath) } ogImage={ getArtist.imageUrl } />
      <div>
        <img src={ getArtist.imageUrl ? getArtist.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
        <h1 className="title">{ getArtist.name }</h1>
        <LikeArtist/>
        { getArtist.likes ? `${ getArtist.likes } liked them` : `be the first to like? or empty?` }
      </div>

      <div>
        New Songs
        <ArtistSongs artistId={ getArtist.id } sort="-createdDate" snippet={ true } display={ DISPLAY.TEXT }/>
      </div>

      <div>
        Share
        { getArtist.shares ? `${ getArtist.shares } shared this` : `be the first to share` }
        <ShareArtist/>
        <span dir="ltr"><input value={ getArtist.url } readOnly/></span>
      </div>

      <div>
        <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
      </div>

      <div>
        Popular songs
        <ArtistSongs artistId={ getArtist.id } sort="-plays" snippet={ true } display={ DISPLAY.TEXT }/>
      </div>

      <div>
        Data?
        { getArtist.songUsersPlayed ? `${ getArtist.songUsersPlayed } listeners` : null }
        Songs played: { getArtist.songPlays ? getArtist.songPlays : 0 }
      </div>

      <div>
        All songs
        Total Songs: { getArtist.songs }, Liked songs: { getArtist.songLikes }
        <ArtistSongs artistId={ getArtist.id } snippet={ false } display={ DISPLAY.LIST }/>
      </div>

      <CreateComment collection={ ARTISTS_COLLECTION } id={ getArtist.id } />
      <CommentsList collection={ ARTISTS_COLLECTION } id={ getArtist.id } total={ getArtist.comments }/>

      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </section>
  )
}
