import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Error from 'next/error'
import * as Sentry from '@sentry/node'
import { initializeApollo } from 'lib/apolloClient'
import { validateUrl } from 'lib/validateUrl'
import { GET_ARTIST_QUERY } from 'lib/graphql'
import { ARTISTS_COLLECTION, DISPLAY } from 'lib/constants'
import Layout from 'components/layout'
import Head from 'components/head'
import LikeArtist from 'components/artist.like.comp'
import ShareArtist from 'components/artist.share.comp'
import ArtistSongs from 'components/song.artist.comp'
import CreateComment from 'components/comment.create.comp'
import CommentsList from 'components/comment.list.comp'

export async function getStaticProps(context) {
  try {
    // apollo client for the build time
    const client = await initializeApollo()
    // query
    const { data } = await client.query({
      query: GET_ARTIST_QUERY,
      variables: { id: context.params.id }
    })
    // return apollo cache and artist
    return {
      props: {
        initialApolloState: client.cache.extract(),
        artist: data.getArtist,
      },
    }
  } catch (error) {
    Sentry.captureException(error)
    return { props: {} }
  }
}

export async function getStaticPaths() {
  // because we have so many paths, we'll return nothing and let it build at production time
  return {
    paths: [],
    fallback: true,
  }
}

export default ({ artist }) => {
  const router = useRouter()

  // fix url in case it doesn't match the slug
  useEffect(() => {
    // artist is null at build time (Static Generation)
    if (artist) {
      validateUrl(router, 'artist', artist.id, artist.slug)
    }
  })

  // if artist was not found or error (after running getStaticProps())
  if (!router.isFallback && !artist) {
    return <Error statusCode={ 404 } title="Artist Not Found"/>;
  }

  // If the page is not yet generated, this will be displayed initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (<div>Loading... (design it please)</div>)
  }

  return (
    <Layout>
      <Head title={ artist.name } description={ artist.name } asPath={ `/artist/${ artist.id }/${ decodeURIComponent(artist.slug) }` } ogImage={ artist.imageUrl }/>
      <section>
        <div>
          <img src={ artist.imageUrl ? artist.imageUrl : `https://via.placeholder.com/100?text=no+photo` }/>
          <h1 className="title">{ artist.name }</h1>
          <LikeArtist artistId={ artist.id }/>
        </div>
        <div>
          New Songs
          <ArtistSongs artistId={ artist.id } sort="-createdDate" snippet={ true } display={ DISPLAY.TEXT }/>
        </div>
        <div>
          <ShareArtist artistId={ artist.id }/>
        </div>
        <div>
          <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
        </div>
        <div>
          Popular songs
          <ArtistSongs artistId={ artist.id } sort="-plays" snippet={ true } display={ DISPLAY.TEXT }/>
        </div>
        <div>
          Data?
          { artist.songUsersPlayed ? `${ artist.songUsersPlayed } listeners` : null }
          Songs played: { artist.songPlays ? artist.songPlays : 0 }
        </div>
        <div>
          All songs
          Total Songs: { artist.songs }, Liked songs: { artist.songLikes }
          <ArtistSongs artistId={ artist.id } snippet={ false } display={ DISPLAY.LIST }/>
        </div>
        <CreateComment collection={ ARTISTS_COLLECTION } id={ artist.id }/>
        <CommentsList collection={ ARTISTS_COLLECTION } id={ artist.id }/>
      </section>
      <style jsx>{`
        .title, .description {
          text-align: center;
        }
      `}</style>
    </Layout>
  )
}
