import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import * as Sentry from '@sentry/nextjs'
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

    // if artist was not found
    if (!data?.getArtist) {
      return { notFound: true }
    }

    // return apollo cache and artist
    // incremental static regeneration every 10 minutes (600 seconds)
    return {
      props: {
        initialApolloState: client.cache.extract(),
        artist: data.getArtist,
      },
      revalidate: 600,
    }
  } catch (error) {
    Sentry.captureException(error)
    return { notFound: true }
  }
}

export async function getStaticPaths() {
  // because we have so many paths, we'll return nothing and let it build at production time
  return {
    paths: [],
    fallback: true,
  }
}

const Page = ({ artist }) => {
  const router = useRouter()

  // fix url in case it doesn't match the slug
  useEffect(() => {
    // artist is null at build time (Static Generation)
    if (artist) {
      validateUrl(router, 'artist', artist.id, artist.slug)
    }
  })

  // If the page is not yet generated, this will be displayed initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (
      <div>
        Loading... (design it please)
      </div>
    )
  }

  // TODO: doesn't work on dev. check on production
  const META = {
    asPath: `/artist/${ artist.id }/${ decodeURIComponent(artist.slug) }`,
    title: artist.name,
    description: artist.name,
    image: artist.imageUrl,
  }

  return (
    <Layout>
      <Head asPath={ META.asPath } title={ META.title } description={ META.description } image={ META.image }/>

      <section>
        <div>
          <Image src={ artist.imageUrl || `https://via.placeholder.com/100?text=no+photo?` } alt={ artist.name } width={ 100 } height={ 100 }/>
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
    </Layout>
  )
}

export default Page