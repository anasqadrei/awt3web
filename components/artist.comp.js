import Link from 'next/link'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import Raven from 'raven-js'
import Head from './head'
import Comment from './comment.comp'
import CommentsList from './commentsList.comp'
import ErrorMessage from './errorMessage'

const recentlyAddedSongs = []
for (let i = 0; i < 10; i++) {
  recentlyAddedSongs.push(
    <Link key={i} as="/song/1/slug" href={`/song?id=1`}>
      <a>song title </a>
    </Link>
  )
}

const popularSongs = []
for (let i = 0; i < 10; i++) {
  popularSongs.push(
    <Link key={i} as="/song/1/slug" href={`/song?id=1`}>
      <a>song title </a>
    </Link>
  )
}

const allSongs = []
for (let i = 0; i < 20; i++) {
  allSongs.push(
    <div key={i}>
      <img src="https://via.placeholder.com/30?text=song+image"/>
      <Link as="/song/1/slug" href={`/song?id=1`}>
        <a>song title</a>
      </Link>
      <img src="https://via.placeholder.com/30?text=duration"/> 3:25
      <img src="https://via.placeholder.com/30?text=playsCount"/> 2,323
      <img src="https://via.placeholder.com/30?text=More+Actions"/>
    </div>
  )
}

const artistQuery = gql`
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

function ArtistData({ data: { loading, error, getArtist }, ownProps }) {
  if (loading) {
    return (<div>Loading... (design this)</div>)
  } else if (error) {
    Raven.captureException(error.message, {extra: error})
    return <ErrorMessage message='حدث خطأ ما في عرض بيانات الفنان. الرجاء إعادة المحاولة.' />
  } else if (!getArtist) {
    return (<div>Artist doesn't exist (design this)</div>)
  } else if (getArtist) {
    if (ownProps.fixSlug) {
      // const re = new RegExp ('^' + ownProps.router.pathname + '/' + ownProps.router.query.id + '/' + getArtist.slug + '([?].*|[#].*|/)?$')
      // if (!decodeURIComponent(ownProps.router.asPath).match(re)) {
      //   const href = ownProps.router.pathname + '?id=' + ownProps.router.query.id + '&slug=' + getArtist.slug
      //   const as = ownProps.router.pathname + '/' + ownProps.router.query.id + '/' + getArtist.slug
      //   ownProps.router.replace(href, as)
      // }
      const regExp = new RegExp (`^${ ownProps.router.pathname }/${ ownProps.router.query.id }/${ getArtist.slug }([?].*|[#].*|/)?$`)
      if (!decodeURIComponent(ownProps.router.asPath).match(regExp)) {
        const href = `${ ownProps.router.pathname }?id=${ ownProps.router.query.id }&slug=${ getArtist.slug }`
        const as = `${ ownProps.router.pathname }/${ ownProps.router.query.id }/${ getArtist.slug }`
        ownProps.router.replace(href, as)
      }
    }
    return (
      <div>
        <Head title={ getArtist.name } description={ getArtist.name } url={ getArtist.url } ogImage={ getArtist.imageUrl } />
        <div>
          <img src={ getArtist.imageUrl?getArtist.imageUrl:`https://via.placeholder.com/100?text=no+photo?` }/>
          <h1 className="title">{ getArtist.name }</h1>
          <Link href=""><a>Like</a></Link>
          { getArtist.likes?`${ getArtist.likes } liked them`:`be the first to like? or empty?` }
        </div>

        <div>
          New Songs
          {recentlyAddedSongs}
        </div>

        <div>
          Share
          { getArtist.shares?`${ getArtist.shares } shared this`:`be the first to share` }
          <Link href="/"><a>Facebook</a></Link>
          <Link href="/"><a>Twitter</a></Link>
          <Link href="/"><a>Google+</a></Link>
          <span dir="ltr"><input value={ getArtist.url } readOnly/></span>
        </div>

        <div>
          <img src="https://via.placeholder.com/728x90?text=728x90+Leaderboard+Ad+but+will+be+responsive"/>
        </div>

        <div>
          Popular songs
          {popularSongs}
        </div>

        <div>
          Data?
          { getArtist.songUsersPlayed?`${ getArtist.songUsersPlayed } listers`:`` }
          Songs played: { getArtist.songPlays?getArtist.songPlays:0 }
        </div>

        <div>
          All songs (sort: alphabetically, new, most listed, most liked).
          Total Songs: { getArtist.songs }, Liked songs: { getArtist.songLikes }
          {allSongs}
        </div>

        <Comment/>
        <CommentsList total={ getArtist.comments }/>

        <style jsx>{`
          .title, .description {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}

export default graphql(artistQuery, {
  options: ({ router }) => {
    return { variables: {
        id: router.query.id
      }
    }
  },
  props: ({ data, ownProps }) => ({ data, ownProps })
})(ArtistData)
